/**
 * Shared helper utilities for grazing agent tools.
 */

import type { QueryCtx, MutationCtx } from '../../_generated/server'
import area from '@turf/area'
import { HECTARES_PER_SQUARE_METER } from '../../lib/areaConstants'

type ReadCtx = QueryCtx | MutationCtx

/**
 * Look up a farm by external ID.
 * Shared across modules that need farm resolution.
 */
export async function findFarmByExternalId(ctx: ReadCtx, farmExternalId: string) {
  return await ctx.db
    .query('farms')
    .withIndex('by_externalId', (q) => q.eq('externalId', farmExternalId))
    .first()
}

/**
 * Calculate area in hectares from a GeoJSON geometry.
 * Returns 0 if the geometry is invalid or the calculation fails.
 */
export function calculateAreaHectares(geometry: unknown): number {
  try {
    const sqMeters = area(geometry as Parameters<typeof area>[0])
    return Number.isFinite(sqMeters)
      ? Math.round(sqMeters * HECTARES_PER_SQUARE_METER * 10) / 10
      : 0
  } catch {
    return 0
  }
}
