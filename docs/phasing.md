# Development Phasing Plan

This document outlines a methodical approach to building the Grazing Intelligence Demo. Each phase scaffolds on validated work from the previous phase, producing testable artifacts before proceeding.

## Guiding Principles

1. **Vertical slices over horizontal layers** - Each phase delivers something testable end-to-end, not just "backend done, waiting on frontend"
2. **Stub before integrating** - Mock external dependencies (satellite APIs) initially, then swap in real implementations
3. **Design drives development** - UI/UX decisions inform API shape, not the reverse
4. **Single farm, single day first** - Get one complete daily flow working before adding history, multiple farms, etc.

---

## Phase Summary

| Phase | Duration | Validates |
|-------|----------|-----------|
| 0: UX Design | 1-2 weeks | User experience before code |
| 1: Farm Geometry | 1 week | Map rendering, GeoJSON pipeline |
| 2: Satellite PoC | 1-2 weeks | Data access, NDVI computation |
| 3: Processing Pipeline | 1-2 weeks | Cloud masking, time series, zonal stats |
| 4: Intelligence Layer | 1-2 weeks | Scoring, planning, confidence |
| 5: Morning Brief | 1-2 weeks | Core product experience |
| 6: Export & Polish | 1-2 weeks | Demo readiness |

**Total: 8-14 weeks** depending on team size and iteration needs.

---

## Current State Snapshot (Jan 20, 2026)

Phase 1 (Farm Geometry Foundation) is now complete. The app uses Convex for
persistent storage and has a dev-mode auth bypass via `VITE_DEV_AUTH=true`.

### Completed in this update

**Convex Backend**
- `users` table with user→farm mapping
- `farmSettings` table for persistent settings
- Seed functions for dev user, sample farm, paddocks, and settings
- Queries: `getFarm`, `getUserByExternalId`, `getSettings`
- Mutations: `seedSampleFarm`, `applyPaddockChanges`, `updatePaddockMetadata`,
  `updateSettings`, `resetSettings`

**Auth Layer**
- Dev auth bypass: set `VITE_DEV_AUTH=true` to skip Clerk login
- Prod auth: requires `VITE_CLERK_PUBLISHABLE_KEY`
- `AppAuthProvider` and `AuthGate` components wrap the app

**Frontend Integration**
- `GeometryProviderWithConvex` reads from Convex (no localStorage fallback)
- `useCurrentUser` hook manages user→farm lookup and seeding
- `useFarmSettings` hook manages settings persistence
- `settings.tsx` route uses Convex-backed settings

### Remaining gaps (for demo readiness)

- Satellite ingestion and processing pipeline (Phases 2-3)
- Rules-based planner and plan generation (Phase 4)
- Real exports (GeoJSON/text) and integration workflows
- Morning Brief, history, and analytics still use mock plan/observation data

### Stack

- Backend/data: Convex
- Auth: Clerk (dev bypass via env var)

### Phase status

- Phase 0: UX prototype complete (UI artifacts in `app/`)
- Phase 1: **Complete** (Convex backend + geometry persistence + auth layer)
- Phases 2-4: Not started (data pipeline and intelligence layer)
- Phase 5: UI complete; logic/API integration missing
- Phase 6: UI polish present; export implementation missing

## Next Logical Chunk: Working Demo Slice (Single Farm)

**Goal:** Replace mock data with a minimal end-to-end data loop so a small cohort can use the app daily.

### Scope

- Convex backend foundation with `Farm`, `Paddock`, `Observation`, `Plan`, and `Feedback` data
- Clerk auth wired to a small set of users (single farm per user for now)
- Satellite PoC to minimal pipeline (latest cloud-safe NDVI, optional 21-day window + cloud mask + zonal stats)
- Rules-based planner to generate a daily recommendation with alternatives
- Frontend integration for brief, plan, approve, and feedback flows
- Basic ops: daily refresh job, cloud cover fallbacks, and logging

### Out of scope for this chunk

- Enterprise org management, billing, and admin tooling
- Production-grade exports and third-party integrations
- Multi-farm analytics and deep historical trends

---

## Phase 0: UX Design & Prototyping

**Duration:** 1-2 weeks

**Goal:** Define exactly what the Morning Farm Brief looks and feels like before writing production code.

### Deliverables

- Wireframes for core screens: Map view, Morning Brief, Plan approval, Feedback flow
- Visual design system: typography, color palette, component library decisions
- Clickable prototype (Figma or similar) of the Morning Farm Brief flow
- Sample narrative text for briefs (what does "plain language" actually sound like?)
- Defined viewport size (desktop-first, but what breakpoint?)

### Key UX Questions to Answer

- How does the farmer arrive at the brief? (opens app directly to it? navigates from map?)
- What is the visual hierarchy of the recommendation? (paddock name, confidence, reasoning)
- How is feedback captured? (buttons, text input, both?)
- What does "approve" actually mean in the UI? (what happens next?)

### Why This Phase Matters

The product IS the Morning Farm Brief. If this experience isn't crisp, nothing else matters. Skipping this results in UI rework loops later.

---

## Phase 1: Farm Geometry Foundation

**Duration:** 1 week

**Goal:** Build the digital twin skeleton - farm and paddock polygons on a map.

### Deliverables

- Sample farm GeoJSON (realistic New Zealand/Australian pastoral layout)
- Sample paddock polygons (5-8 paddocks, varying sizes)
- Frontend: Interactive map component with paddock visualization
- Backend: Convex functions to serve farm/paddock geometry
- Data model: `Farm`, `Paddock` collections in Convex (GeoJSON stored)

### Technical Stack (current)

- Frontend framework (React + MapLibre GL JS or Leaflet recommended)
- Backend/data layer (Convex)
- Auth (Clerk)
- Geospatial storage (GeoJSON in Convex; optional PostGIS later)

### What Gets Tested

- Can we render paddocks on a map?
- Can we click a paddock and see its metadata?
- Is the GeoJSON format working correctly end-to-end?

### Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Map Component  │ --> │ Convex Query/Mutation│ --> │ Convex Data │
│   (Frontend)    │     │    (Backend API)     │     │  Storage    │
└─────────────────┘     └──────────────────────┘     └─────────────┘
```

---

## Phase 2: Satellite Pipeline - Proof of Concept

**Duration:** 1-2 weeks

**Goal:** Prove we can fetch satellite data and compute NDVI for a known location.

### Deliverables

- Python script that queries Planetary Computer STAC API for Sentinel-2
- Fetch imagery for sample farm AOI
- Compute NDVI for a single cloud-free scene
- Visualize result (notebook or simple tile endpoint)

### Scope Boundaries

- Single image, not time series yet
- Known good date (manually selected cloud-free day)
- No cloud masking logic yet - just prove the pipeline

### Libraries to Validate

| Library | Purpose |
|---------|---------|
| `pystac-client` | Catalog queries |
| `odc-stac` or `stackstac` | Loading imagery |
| `rasterio` | Raster operations |
| `numpy` | Index computation |

### What Gets Tested

- Can we authenticate and query Planetary Computer?
- Does the data come back in expected format?
- Is NDVI computation producing sensible values (0.2-0.6 range for pasture)?

This is intentionally narrow. The goal is confidence in the data path before building production infrastructure.

---

## Phase 3: Processing Pipeline - Production

**Duration:** 1-2 weeks

**Goal:** Build the full observation pipeline: cloud masking, time series, zonal statistics.

### Deliverables

- Cloud masking using Sentinel-2 SCL band
- Time-series fetch (21-day rolling window)
- Median composite generation
- Zonal statistics computation per paddock
- `Observation` model and storage
- Scheduled job / manual trigger to refresh data

### Data Flow

```
STAC API Query
      │
      ▼
Fetch Imagery + SCL
      │
      ▼
Apply Cloud Mask
      │
      ▼
Compute NDVI/EVI/NDWI
      │
      ▼
Time-Series Median Composite
      │
      ▼
Zonal Statistics per Paddock
      │
      ▼
Observations Table (Database)
```

### What Gets Tested

- Do composite values look reasonable compared to raw images?
- Are zonal statistics stable across runs?
- Is cloud masking excluding appropriate pixels?

### Stub Strategy

Until Phase 4, the frontend can display raw paddock observations without the intelligence layer. This proves the data path.

---

## Phase 4: Intelligence Layer - Scoring & Plans

**Duration:** 1-2 weeks

**Goal:** Implement the rules-based planner that ranks paddocks and generates recommendations.

### Deliverables

- Paddock scorer (graze-readiness ranking)
- Recovery modeler (days since last graze, trajectory)
- Plan generator (single recommendation with confidence)
- `GrazingEvent` model (tracks when paddock was grazed)
- `Plan` model and storage
- API: `GET /farms/{id}/plan` returns today's recommendation

### Initial Heuristics

From [domain.md](domain.md):

```python
def is_graze_ready(paddock):
    return (
        paddock.ndvi_mean >= 0.40
        and paddock.ndvi_slope >= -0.01
        and paddock.days_since_graze >= 21
        and paddock.cloud_free_pct >= 0.50
    )
```

### What Gets Tested

- Given known observation data, does the planner pick the expected paddock?
- Is confidence scoring behaving correctly with degraded data?
- Are alternatives ranked sensibly?

### Important

No LLM/AI yet. This is pure deterministic logic. Explainability comes from transparent rules, not model interpretation.

---

## Phase 5: Morning Brief & Approval Flow

**Duration:** 1-2 weeks

**Goal:** Deliver the core product experience - the Morning Farm Brief.

### Deliverables

- Brief generator (narrative text synthesis)
- Frontend: Morning Brief screen (matches Phase 0 design)
- Frontend: Plan card with approve/feedback buttons
- Backend: `POST /farms/{id}/plan/approve`
- Backend: `POST /farms/{id}/plan/feedback` (stores free-text)
- State management for plan lifecycle (pending -> approved/modified)

### Brief Generation Approach

Initially: template-based text generation with variable substitution

```
"Good morning. Your pastures are [overall_status]. 
[key_change_sentence] 
We recommend moving to [paddock_name] today ([confidence]% confidence)."
```

Future enhancement: LLM-powered narrative generation (out of MVP scope).

### What Gets Tested

- Does the brief read naturally?
- Can a user approve a plan and see the state change?
- Is feedback being captured and stored?

This is where the product "becomes real" - everything prior was infrastructure.

---

## Phase 6: Export, Polish & Demo Readiness

**Duration:** 1-2 weeks

**Goal:** Production-ready demo with export capabilities and edge case handling.

### Deliverables

- Export: GeoJSON fence geometry download
- Export: Copy-ready text instructions for virtual fencing tools
- Error states: satellite data unavailable, low confidence warnings
- Loading states and skeleton screens
- Demo script with specific scenarios to walk through
- Sample data that tells a compelling story (paddock A recovering, B ready, C overgrazed)

### Demo Scenarios to Support

1. **Normal day:** Clear recommendation, high confidence
2. **Uncertain day:** Multiple viable options, user picks
3. **Recovery tracking:** Show a paddock improving over time
4. **Feedback loop:** User rejects recommendation, provides reason

### Final Checklist

- [ ] App loads in under 3 seconds
- [ ] Map renders without glitches
- [ ] Brief text is grammatically correct
- [ ] Export files validate as proper GeoJSON
- [ ] No console errors in production build

---

## Recommended Starting Point

After this plan is approved:

1. Create Phase 0 UX artifacts (wireframes, design system choices)
2. Set up Convex project and Clerk auth integration (define user-to-farm mapping)
3. Create sample farm GeoJSON data file and seed it into Convex
4. Wire the frontend to Convex queries/mutations for paddocks and plans

The first code should be a map that renders paddocks. Everything else builds from there.

---

## What This Plan Intentionally Excludes

Per the existing documentation, the following are NOT in scope for the demo:

- Livestock collar integration
- Real-time tracking
- Drone sensing
- Mobile native apps
- Enterprise org management, billing, and admin tooling
- LLM-powered brief generation (template-based first)

These can be added as enhancement phases after the demo is complete.

---

## Phase Dependencies

```
Phase 0 (UX Design)
    │
    ▼
Phase 1 (Farm Geometry) ◄── Foundation for all data
    │
    ├──────────────────┐
    ▼                  ▼
Phase 2 (Satellite PoC)
    │
    ▼
Phase 3 (Processing Pipeline)
    │
    ▼
Phase 4 (Intelligence Layer)
    │
    ▼
Phase 5 (Morning Brief)
    │
    ▼
Phase 6 (Export & Polish)
```

Phase 0 and Phase 1 can run in parallel if resources allow. All subsequent phases are sequential dependencies.
