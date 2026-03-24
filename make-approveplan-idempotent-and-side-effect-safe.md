# Make `approvePlan` Idempotent and Side-Effect Safe

## Summary

Fix `app/convex/intelligence.ts` so approving the same plan more than once is a no-op after the first successful approval. The mutation must not:

- re-schedule `recordApprovedSection`
- re-insert a `sectionGrazingEvents` row
- re-advance `paddockForecasts.activeSectionIndex`
- re-increment `paddockForecasts.daysInActiveSection`
- overwrite the original approval metadata

The implementation should define the plan row as the source of truth for whether approval-side effects have already been applied, and every downstream write path should be safe against retries on its own.

## Chosen approach

Use a two-layer idempotency design:

1. `approvePlan` gets a front-door guard:
   - Read the plan.
   - If the plan is already approved, return immediately without changing state.
   - Only the first approval call may patch the plan, schedule section recording, and mutate forecast progress.

2. `recordApprovedSection` gets its own duplicate guard:
   - Before creating or updating rotation state, look for an existing `sectionGrazingEvents` record for the same `planId`.
   - If one exists, return that existing event and skip all inserts/rotation total updates.
   - This protects against scheduler retries, duplicate enqueues, or future callers invoking the internal mutation twice.

This keeps the public mutation idempotent and also makes the scheduled internal mutation independently safe.

## Implementation details

### 1. Harden `approvePlan`
File: `app/convex/intelligence.ts`

Update `approvePlan` to follow this sequence:

1. Load `plan`.
2. Throw if missing.
3. If `plan.status === 'approved'`:
   - return `args.planId` immediately.
   - do not patch the plan.
   - do not schedule `recordApprovedSection`.
   - do not touch `dailyBriefs` / `paddockForecasts`.
4. Otherwise:
   - compute `now`.
   - patch the plan to:
     - `status: 'approved'`
     - `approvedAt: now`
     - `approvedBy: args.userId`
     - `updatedAt: now`
   - schedule `recordApprovedSection` only once.
   - progress the linked forecast only once.

Important detail:
- Use the pre-patch `plan` object only for immutable fields needed to drive side effects (`farmExternalId`, `primaryPaddockExternalId`, `sectionGeometry`, `progressionContext`, `date`).
- Do not overwrite `approvedAt`/`approvedBy` on retries; preserving first approval metadata is part of idempotency.

### 2. Add duplicate detection to `recordApprovedSection`
File: `app/convex/intelligence.ts`

At the top of `recordApprovedSection`:

1. Query `sectionGrazingEvents` for an existing event matching `args.planId`.
2. If found:
   - log a debug message indicating duplicate replay was ignored.
   - return the existing event `_id`.
3. Only if not found:
   - continue with centroid calculation
   - resolve/create rotation
   - calculate sequence number
   - insert the section event
   - patch rotation totals

### 3. Add an index to support idempotency lookup
File: `app/convex/schema.ts`

Add an index on `sectionGrazingEvents.planId`.

Recommended index:
- `.index('by_plan', ['planId'])`

Why:
- The duplicate check in `recordApprovedSection` should not require a collection scan.
- `planId` is already part of the row shape and is the correct natural idempotency key for “this approved plan has already been recorded”.

Constraint to preserve:
- `planId` is currently optional for migration/backward compatibility, so the implementation must only perform the duplicate check when `args.planId` is present.
- Since `recordApprovedSection` always receives a `planId`, the lookup can rely on it.
- Existing rows with missing `planId` remain valid; they just won’t participate in this guard.

### 4. Keep forecast progression behind the same one-time gate
File: `app/convex/intelligence.ts`

Do not add separate forecast-history dedupe logic if `approvePlan` already returns early for approved plans. The forecast mutation block should remain inside the “first approval only” path.

Expected behavior:
- First approval:
  - `MOVE` brief: append one history entry, advance one section, reset `daysInActiveSection` to `1`
  - `STAY` brief: increment `daysInActiveSection` by `1`
- Repeated approval:
  - no forecast changes at all

This is sufficient because `approvePlan` is the only caller performing forecast progression today.

### 5. Preserve mutation return contract
File: `app/convex/intelligence.ts`

Keep `approvePlan` returning `args.planId` for both:
- first successful approval
- repeated no-op approval

That avoids client changes and makes retries harmless.

## Public API / interface changes

### Schema
File: `app/convex/schema.ts`

Add:
- `sectionGrazingEvents.by_plan(planId)`

No changes to mutation arguments or return shapes.

### Behavior contract
`api.intelligence.approvePlan` becomes explicitly idempotent:
- same `planId` approved multiple times yields the same return value
- only the first call applies approval side effects

## Testing plan

### Unit / integration targets
Primary file:
- `app/convex/intelligence.ts`

Recommended test style:
- Add Convex function-level tests around `approvePlan` and `recordApprovedSection`
- If there is no existing Convex test harness in-repo, add targeted tests for the pure/readable branches and document any remaining gap
- At minimum, expand repo tests with backend-focused coverage instead of only current utility tests

### Required scenarios

1. First approval applies all side effects once
- Seed:
  - pending plan with `sectionGeometry`
  - matching `dailyBrief` with `forecastId`
  - active `paddockForecast`
- Call `approvePlan`
- Assert:
  - plan status becomes `approved`
  - exactly one `sectionGrazingEvents` row exists for that `planId`
  - forecast progresses exactly once
  - `approvedAt` and `approvedBy` are set

2. Re-approving an already approved plan is a no-op
- Seed or produce an already-approved plan with linked forecast and section event
- Call `approvePlan` again
- Assert:
  - return value is still `planId`
  - `approvedAt` is unchanged
  - `approvedBy` is unchanged
  - no additional `sectionGrazingEvents` row is inserted
  - forecast `grazingHistory`, `activeSectionIndex`, and `daysInActiveSection` are unchanged

3. Duplicate scheduled execution of `recordApprovedSection` is ignored
- Seed:
  - rotation and one `sectionGrazingEvents` row for the same `planId`
- Call `recordApprovedSection` again with identical args
- Assert:
  - existing event id is returned
  - rotation totals are unchanged
  - no second row is inserted

4. `STAY` approvals remain idempotent
- Seed:
  - approved/approvable plan linked to a `dailyBrief` with `decision: 'STAY'`
- First call increments `daysInActiveSection` once
- Second call does nothing

5. Plans without `sectionGeometry` still behave safely
- Seed pending plan without a section geometry
- First approval updates plan status only
- Re-approval remains a no-op
- No section event is ever inserted

6. Plans with missing or inactive forecast do not regress
- Seed pending approved path without `dailyBrief.forecastId` or with non-active forecast
- First approval updates plan and may schedule section event
- Re-approval remains a no-op
- No crashes

## Acceptance criteria

The fix is complete when all of the following are true:

- Approving the same plan twice results in one logical approval.
- A plan can have at most one `sectionGrazingEvents` row associated via `planId`.
- `paddockForecasts` never progresses more than once for a single approved plan.
- Retry behavior is safe whether the retry hits the public mutation or the scheduled internal mutation.
- Existing client code can keep calling `approvePlan(planId, userId)` unchanged.

## Rollout / verification

1. Add the schema index and regenerate Convex artifacts if required by the normal project workflow.
2. Run backend/frontend validation:
   - app build
   - relevant tests covering Convex logic
3. Manually verify with a seeded plan:
   - approve once
   - approve again
   - inspect plan, section events, and forecast state

## Assumptions and defaults

- `approvePlan` is intended to be safe under client retries and duplicate clicks, not to reject them as errors.
- The first successful approval owns the canonical `approvedAt` and `approvedBy` values.
- `planId` is the correct idempotency key for section recording.
- No other code path besides `approvePlan` should advance `paddockForecasts` for plan approval.
- Returning the existing `planId` on repeated approval is preferable to throwing, because it preserves current client behavior and makes retries harmless.
