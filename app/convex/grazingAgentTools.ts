import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { DEFAULT_FARM_EXTERNAL_ID } from './seedData'
import area from '@turf/area'

const HECTARES_PER_SQUARE_METER = 1 / 10000

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

interface PreviousSection {
  id: string
  date: string
  area: number
  geometry: any
}

interface SectionWithJustification {
  id: string
  date: string
  geometry: any
  area: number
  justification: string
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

    const calculateAreaHectares = (geometry: any): number => {
      try {
        const sqMeters = area(geometry)
        return Number.isFinite(sqMeters) ? Math.round((sqMeters * HECTARES_PER_SQUARE_METER) * 10) / 10 : 0
      } catch {
        return 0
      }
    }

    return paddocks.map((paddock: any) => {
      const paddockObservations = observations.filter(
        (o: any) => o.paddockExternalId === paddock.externalId
      )
      
      const latestObservation = paddockObservations.length > 0
        ? paddockObservations.reduce((latest: any, obs: any) => {
            if (!latest || new Date(obs.date) > new Date(latest.date)) {
              return obs
            }
            return latest
          }, null)
        : null

      const paddockGrazingEvents = grazingEvents.filter(
        (e: any) => e.paddockExternalId === paddock.externalId
      )
      
      const mostRecentEvent = paddockGrazingEvents.length > 0
        ? paddockGrazingEvents.reduce((latest: any, event: any) => {
            if (!latest || new Date(event.date) > new Date(latest.date)) {
              return event
            }
            return latest
          }, null)
        : null

      let restDays = 0
      if (mostRecentEvent?.date && latestObservation?.date) {
        try {
          const lastDate = new Date(mostRecentEvent.date)
          const obsDate = new Date(latestObservation.date)
          restDays = Math.max(0, Math.floor((obsDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)))
        } catch {
          restDays = 0
        }
      }

      const ndviMean = latestObservation?.ndviMean ?? paddock.ndvi ?? 0

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
      }
    }).sort((a: any, b: any) => b.ndviMean - a.ndviMean)
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

    const mostRecentGrazingEvent = grazingEvents.length > 0
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
    
    const latestObservation = paddockObservations.length > 0
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
        return Number.isFinite(sqMeters) ? Math.round((sqMeters * HECTARES_PER_SQUARE_METER) * 10) / 10 : 0
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

    const lastGrazed = mostRecentGrazingEvent?.date
    let restDays = 0
    if (lastGrazed && latestObservation) {
      try {
        const lastDate = new Date(lastGrazed)
        const obsDate = new Date(latestObservation.date)
        restDays = Math.max(0, Math.floor((obsDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)))
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
      latestObservation: latestObservation ? {
        date: latestObservation.date,
        ndviMean: latestObservation.ndviMean,
        ndviStd: latestObservation.ndviStd,
        cloudFreePct: latestObservation.cloudFreePct,
      } : null,
    }
  },
})

export const getPreviousSections = query({
  args: { farmExternalId: v.optional(v.string()), paddockId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<SectionWithJustification[]> => {
    const farmExternalId = args.farmExternalId ?? DEFAULT_FARM_EXTERNAL_ID
    
    const plans = await ctx.db
      .query('plans')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .collect()

    const targetPaddockId = args.paddockId

    const sectionsWithJustification: SectionWithJustification[] = []

    for (const plan of plans) {
      if (plan.sectionGeometry && plan.primaryPaddockExternalId === targetPaddockId) {
        sectionsWithJustification.push({
          id: plan._id.toString(),
          date: plan.date,
          geometry: plan.sectionGeometry,
          area: plan.sectionAreaHectares || 0,
          justification: plan.sectionJustification || 'No justification provided',
        })
      }
    }

    return sectionsWithJustification.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  },
})

export const getFarmSettings = query({
  args: { farmExternalId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const farmExternalId = args.farmExternalId ?? DEFAULT_FARM_EXTERNAL_ID
    
    const settings = await ctx.db
      .query('farmSettings')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .first()

    if (!settings) {
      return {
        minNDVIThreshold: 0.40,
        minRestPeriod: 21,
        defaultSectionPct: 0.20,
      }
    }

    return {
      minNDVIThreshold: settings.minNDVIThreshold,
      minRestPeriod: settings.minRestPeriod,
      defaultSectionPct: 0.20,
    }
  },
})

export const createPlanWithSection = mutation({
  args: {
    farmExternalId: v.string(),
    targetPaddockId: v.string(),
    sectionGeometry: v.optional(v.any()),
    sectionAreaHectares: v.optional(v.number()),
    sectionCentroid: v.optional(v.array(v.number())),
    sectionAvgNdvi: v.optional(v.number()),
    sectionJustification: v.string(),
    paddockGrazedPercentage: v.optional(v.number()),
    confidence: v.number(),
    reasoning: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    const existingPlan = await ctx.db
      .query('plans')
      .withIndex('by_farm_date', (q: any) => q.eq('farmExternalId', args.farmExternalId))
      .collect()

    const todayPlan = existingPlan.find((p: any) => p.date === today)

    if (todayPlan) {
      console.log('[savePlan] Patching existing plan:', todayPlan._id, 'with sectionGeometry:', !!args.sectionGeometry)
      await ctx.db.patch(todayPlan._id, {
        primaryPaddockExternalId: args.targetPaddockId,
        confidenceScore: args.confidence,
        reasoning: args.reasoning,
        sectionGeometry: args.sectionGeometry,
        sectionAreaHectares: args.sectionAreaHectares || 0,
        sectionCentroid: args.sectionCentroid,
        sectionAvgNdvi: args.sectionAvgNdvi,
        sectionJustification: args.sectionJustification,
        paddockGrazedPercentage: args.paddockGrazedPercentage,
        updatedAt: now,
      })
      return todayPlan._id
    }

    console.log('[savePlan] Creating NEW plan with sectionGeometry:', !!args.sectionGeometry)
    return await ctx.db.insert('plans', {
      farmExternalId: args.farmExternalId,
      date: today,
      primaryPaddockExternalId: args.targetPaddockId,
      alternativePaddockExternalIds: [],
      confidenceScore: args.confidence,
      reasoning: args.reasoning,
      status: 'pending',
      approvedAt: undefined,
      approvedBy: undefined,
      feedback: undefined,
      sectionGeometry: args.sectionGeometry,
      sectionAreaHectares: args.sectionAreaHectares || 0,
      sectionCentroid: args.sectionCentroid,
      sectionAvgNdvi: args.sectionAvgNdvi,
      sectionJustification: args.sectionJustification,
      paddockGrazedPercentage: args.paddockGrazedPercentage,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const finalizePlan = mutation({
  args: { farmExternalId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<string | null> => {
    const farmExternalId = args.farmExternalId ?? DEFAULT_FARM_EXTERNAL_ID
    const today = new Date().toISOString().split('T')[0]

    const plans = await ctx.db
      .query('plans')
      .withIndex('by_farm_date', (q: any) => q.eq('farmExternalId', farmExternalId))
      .collect()

    const todayPlan = plans.find((p: any) => p.date === today)

    if (!todayPlan) {
      return null
    }

    await ctx.db.patch(todayPlan._id, {
      status: 'pending',
      updatedAt: new Date().toISOString(),
    })

    return todayPlan._id.toString()
  },
})

export const calculatePaddockGrazedPercentage = query({
  args: { farmExternalId: v.optional(v.string()), paddockId: v.string() },
  handler: async (ctx, args): Promise<number> => {
    const farmExternalId = args.farmExternalId ?? DEFAULT_FARM_EXTERNAL_ID
    
    const farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q: any) => q.eq('externalId', farmExternalId))
      .first()

    if (!farm) return 0

    const paddock = await ctx.db
      .query('paddocks')
      .withIndex('by_farm_externalId', (q: any) => 
        q.eq('farmId', farm._id).eq('externalId', args.paddockId)
      )
      .first()

    if (!paddock) return 0

    const calculateAreaHectares = (geometry: any): number => {
      try {
        const sqMeters = area(geometry)
        return Number.isFinite(sqMeters) ? Math.round((sqMeters * HECTARES_PER_SQUARE_METER) * 10) / 10 : 0
      } catch {
        return 0
      }
    }

    const paddockArea = paddock.area || calculateAreaHectares(paddock.geometry)
    if (paddockArea === 0) return 0

    const plans = await ctx.db
      .query('plans')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .collect()

    let totalGrazedArea = 0
    for (const plan of plans) {
      if (
        plan.primaryPaddockExternalId === args.paddockId &&
        plan.sectionGeometry &&
        plan.status !== 'rejected'
      ) {
        totalGrazedArea += plan.sectionAreaHectares || calculateAreaHectares(plan.sectionGeometry)
      }
    }

    return Math.round((totalGrazedArea / paddockArea) * 100)
  },
})
