import { query } from '../../_generated/server'
import { v } from 'convex/values'
import { DEFAULT_FARM_EXTERNAL_ID } from '../../seedData'
import area from '@turf/area'
import type { Feature, Polygon } from 'geojson'
import { HECTARES_PER_SQUARE_METER } from '../../lib/areaConstants'
import { getPaddockContext } from '../../lib/sectionSizing'
import { findFarmByExternalId } from './_helpers'

interface PaddockData {
  externalId: string
  name: string
  area: number
  ndviMean: number
  ndviStd: number
  ndviTrend: string
  restDays: number
  daysGrazed: number
  totalPlanned: number
  geometry: any
  latestObservation: {
    date: string
    ndviMean: number
    ndviStd: number
    cloudFreePct: number
  } | null
}

interface PaddockSummary {
  externalId: string
  name: string
  area: number
  ndviMean: number
  restDays: number
  lastGrazed: string | null
  status: string
  geometry: any
  dataQualityWarning: string | null
}

export const getAllPaddocksWithObservations = query({
  args: { farmExternalId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<PaddockSummary[]> => {
    const farmExternalId = args.farmExternalId ?? DEFAULT_FARM_EXTERNAL_ID

    const farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q: any) => q.eq('externalId', farmExternalId))
      .first()

    if (!farm) {
      return []
    }

    const paddocks = await ctx.db
      .query('paddocks')
      .withIndex('by_farm', (q: any) => q.eq('farmId', farm._id))
      .collect()

    if (paddocks.length === 0) {
      return []
    }

    const observations = await ctx.db
      .query('observations')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .collect()

    const grazingEvents = await ctx.db
      .query('grazingEvents')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .collect()

    // Get farm settings for cloudCoverTolerance
    const settings = await ctx.db
      .query('farmSettings')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .first()

    // cloudCoverTolerance is stored as percentage (0-100), convert to 0-1
    const minCloudFreePct = (settings?.cloudCoverTolerance ?? 50) / 100

    const calculateAreaHectares = (geometry: any): number => {
      try {
        const sqMeters = area(geometry)
        return Number.isFinite(sqMeters)
          ? Math.round(sqMeters * HECTARES_PER_SQUARE_METER * 10) / 10
          : 0
      } catch {
        return 0
      }
    }

    return paddocks
      .map((paddock: any) => {
        const paddockObservations = observations.filter(
          (o: any) => o.paddockExternalId === paddock.externalId
        )

        // Sort observations by date descending
        paddockObservations.sort(
          (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        const latestObservation = paddockObservations[0] ?? null

        // Find latest reliable observation (meeting quality threshold)
        const reliableObservation =
          paddockObservations.find((o: any) => o.isValid && o.cloudFreePct >= minCloudFreePct) ??
          null

        // Determine if current data is reliable
        const isCurrentReliable =
          latestObservation &&
          (latestObservation.cloudFreePct ?? 0) >= minCloudFreePct &&
          latestObservation.isValid

        // Use reliable observation for NDVI if current is unreliable
        const observationToUse = isCurrentReliable
          ? latestObservation
          : (reliableObservation ?? latestObservation)

        // Calculate days since reliable observation
        const daysSinceReliable = reliableObservation
          ? Math.floor(
              (Date.now() - new Date(reliableObservation.date).getTime()) / (1000 * 60 * 60 * 24)
            )
          : null

        // Generate data quality warning if using fallback data
        let dataQualityWarning: string | null = null
        if (!isCurrentReliable && reliableObservation) {
          dataQualityWarning = `Using ${daysSinceReliable}-day-old data (recent imagery cloudy)`
        } else if (!isCurrentReliable && !reliableObservation && latestObservation) {
          const cloudPct = Math.round((1 - (latestObservation.cloudFreePct ?? 0)) * 100)
          dataQualityWarning = `Latest observation has ${cloudPct}% cloud cover - no reliable historical data`
        }

        const paddockGrazingEvents = grazingEvents.filter(
          (e: any) => e.paddockExternalId === paddock.externalId
        )

        const mostRecentEvent =
          paddockGrazingEvents.length > 0
            ? paddockGrazingEvents.reduce((latest: any, event: any) => {
                if (!latest || new Date(event.date) > new Date(latest.date)) {
                  return event
                }
                return latest
              }, null)
            : null

        let restDays = 0
        if (mostRecentEvent?.date && observationToUse?.date) {
          try {
            const lastDate = new Date(mostRecentEvent.date)
            const obsDate = new Date(observationToUse.date)
            restDays = Math.max(
              0,
              Math.floor((obsDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
            )
          } catch {
            restDays = 0
          }
        }

        const ndviMean = observationToUse?.ndviMean ?? paddock.ndvi ?? 0

        let status = 'recovering'
        if (ndviMean >= 0.4 && restDays >= 21) {
          status = 'ready'
        } else if (ndviMean >= 0.4 && restDays >= 14) {
          status = 'almost_ready'
        } else if (restDays < 7) {
          status = 'grazed'
        }

        return {
          externalId: paddock.externalId,
          name: paddock.name,
          area: paddock.area || calculateAreaHectares(paddock.geometry),
          ndviMean,
          restDays,
          lastGrazed: mostRecentEvent?.date || null,
          status,
          geometry: paddock.geometry,
          dataQualityWarning,
        }
      })
      .sort((a: any, b: any) => b.ndviMean - a.ndviMean)
  },
})

export const getPaddockData = query({
  args: { farmExternalId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<PaddockData | null> => {
    const farmExternalId = args.farmExternalId ?? DEFAULT_FARM_EXTERNAL_ID

    const farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q: any) => q.eq('externalId', farmExternalId))
      .first()

    if (!farm) {
      return null
    }

    const paddocks = await ctx.db
      .query('paddocks')
      .withIndex('by_farm', (q: any) => q.eq('farmId', farm._id))
      .collect()

    if (paddocks.length === 0) {
      return null
    }

    const observations = await ctx.db
      .query('observations')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .collect()

    const grazingEvents = await ctx.db
      .query('grazingEvents')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .collect()

    const mostRecentGrazingEvent =
      grazingEvents.length > 0
        ? grazingEvents.reduce((latest: any, event: any) => {
            if (!latest || new Date(event.date) > new Date(latest.date)) {
              return event
            }
            return latest
          }, null)
        : null

    const activePaddockId = mostRecentGrazingEvent?.paddockExternalId || paddocks[0]?.externalId

    const activePaddock = paddocks.find((p: any) => p.externalId === activePaddockId)

    if (!activePaddock) {
      return null
    }

    const paddockObservations = observations.filter(
      (o: any) => o.paddockExternalId === activePaddockId
    )

    const latestObservation =
      paddockObservations.length > 0
        ? paddockObservations.reduce((latest: any, obs: any) => {
            if (!latest || new Date(obs.date) > new Date(latest.date)) {
              return obs
            }
            return latest
          }, null)
        : null

    const paddockGrazingEvents = grazingEvents.filter(
      (e: any) => e.paddockExternalId === activePaddockId
    )

    const daysGrazed = paddockGrazingEvents.length

    const calculateAreaHectares = (geometry: any): number => {
      try {
        const sqMeters = area(geometry)
        return Number.isFinite(sqMeters)
          ? Math.round(sqMeters * HECTARES_PER_SQUARE_METER * 10) / 10
          : 0
      } catch {
        return 0
      }
    }

    let ndviTrend = 'stable'
    if (paddockObservations.length >= 2) {
      const sorted = [...paddockObservations].sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
      const prev = sorted[sorted.length - 2]?.ndviMean || 0
      const curr = sorted[sorted.length - 1]?.ndviMean || 0
      const diff = curr - prev
      if (diff > 0.02) ndviTrend = 'increasing'
      else if (diff < -0.02) ndviTrend = 'decreasing'
    }

    // Get the most recent grazing event for THIS specific paddock
    const mostRecentPaddockEvent =
      paddockGrazingEvents.length > 0
        ? paddockGrazingEvents.reduce((latest: any, event: any) => {
            if (!latest || new Date(event.date) > new Date(latest.date)) {
              return event
            }
            return latest
          }, null)
        : null

    const lastGrazed = mostRecentPaddockEvent?.date
    let restDays = 0
    if (lastGrazed && latestObservation) {
      try {
        const lastDate = new Date(lastGrazed)
        const obsDate = new Date(latestObservation.date)
        restDays = Math.max(
          0,
          Math.floor((obsDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        )
      } catch {
        restDays = 0
      }
    }

    return {
      externalId: activePaddock.externalId,
      name: activePaddock.name,
      area: activePaddock.area || calculateAreaHectares(activePaddock.geometry),
      ndviMean: activePaddock.ndvi || (latestObservation?.ndviMean ?? 0.45),
      ndviStd: latestObservation?.ndviStd ?? 0.08,
      ndviTrend,
      restDays,
      daysGrazed,
      totalPlanned: 4,
      geometry: activePaddock.geometry,
      latestObservation: latestObservation
        ? {
            date: latestObservation.date,
            ndviMean: latestObservation.ndviMean,
            ndviStd: latestObservation.ndviStd,
            cloudFreePct: latestObservation.cloudFreePct,
          }
        : null,
    }
  },
})

/**
 * Get paddock context for agent's spatial reasoning.
 * Returns boundary coordinates, corners, and computed context.
 */
export const getPaddockContextForAgent = query({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.string(),
  },
  handler: async (ctx, args) => {
    const farm = await findFarmByExternalId(ctx, args.farmExternalId)
    if (!farm) {
      throw new Error('Farm not found')
    }

    const paddock = await ctx.db
      .query('paddocks')
      .withIndex('by_farm_externalId', (q: any) =>
        q.eq('farmId', farm._id).eq('externalId', args.paddockExternalId)
      )
      .first()

    if (!paddock) {
      throw new Error('Paddock not found')
    }

    const paddockFeature = paddock.geometry as Feature<Polygon>
    const context = getPaddockContext(paddockFeature)

    return {
      boundary: context.boundary,
      corners: context.corners,
      totalAreaHa: context.totalAreaHa,
      aspectRatio: context.aspectRatio,
      bounds: context.bounds,
    }
  },
})
