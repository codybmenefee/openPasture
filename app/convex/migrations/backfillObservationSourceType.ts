import { mutation } from '../_generated/server'

/**
 * Migration: Backfill existing observations with sourceType, gisCapability,
 * visualState, and confidence fields.
 *
 * All existing records are satellite-derived, so they get:
 * - sourceType: 'sentinel2' (or from their existing sourceProvider)
 * - gisCapability: 'spectral_raster'
 * - visualState.greenness: mapped from ndviMean (clamped 0-1)
 * - confidence: derived from cloudFreePct
 *
 * Run via Convex dashboard or CLI:
 *   npx convex run migrations/backfillObservationSourceType:backfill
 */
export const backfill = mutation({
  args: {},
  handler: async (ctx) => {
    const observations = await ctx.db.query('observations').collect()
    let updated = 0

    for (const obs of observations) {
      if (obs.sourceType) continue

      const sourceProvider = obs.sourceProvider ?? 'sentinel2'
      const sourceType = sourceProvider.toLowerCase().includes('planet')
        ? 'planetscope'
        : 'sentinel2'

      const ndviMean = obs.ndviMean ?? 0
      const greenness = Math.max(0, Math.min(1, ndviMean))
      const cloudFreePct = obs.cloudFreePct ?? 0
      const confidence = Math.max(0, Math.min(1, cloudFreePct))

      await ctx.db.patch(obs._id, {
        sourceType,
        gisCapability: 'spectral_raster',
        visualState: { greenness },
        confidence,
      })
      updated++
    }

    return { updated, total: observations.length }
  },
})
