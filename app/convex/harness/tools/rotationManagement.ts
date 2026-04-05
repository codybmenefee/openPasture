import { query, mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { DEFAULT_FARM_EXTERNAL_ID } from '../../seedData'
import area from '@turf/area'
import difference from '@turf/difference'
import { featureCollection } from '@turf/helpers'
import type { Feature, MultiPolygon, Polygon } from 'geojson'
import { HECTARES_PER_SQUARE_METER } from '../../lib/areaConstants'
import { createLogger } from '../../lib/logger'
import { computeUngrazedRemaining } from '../../lib/sectionSizing'

const log = createLogger('rotationManagement')

/**
 * Get the currently active rotation for a paddock
 */
export const getActiveRotation = query({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('paddockRotations')
      .withIndex('by_active', (q: any) =>
        q
          .eq('farmExternalId', args.farmExternalId)
          .eq('paddockExternalId', args.paddockExternalId)
          .eq('status', 'active')
      )
      .first()
  },
})

/**
 * Get all sections grazed in a rotation
 */
export const getRotationSections = query({
  args: { rotationId: v.id('paddockRotations') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('sectionGrazingEvents')
      .withIndex('by_rotation', (q: any) => q.eq('rotationId', args.rotationId))
      .collect()
  },
})

/**
 * Get the most recent completed rotation for a paddock (for ungrazed areas)
 */
export const getPreviousRotation = query({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.string(),
  },
  handler: async (ctx, args) => {
    const rotations = await ctx.db
      .query('paddockRotations')
      .withIndex('by_paddock', (q: any) =>
        q.eq('farmExternalId', args.farmExternalId).eq('paddockExternalId', args.paddockExternalId)
      )
      .collect()

    // Sort by startDate descending and find most recent completed/interrupted
    const sorted = rotations
      .filter((r: any) => r.status !== 'active')
      .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

    return sorted[0] ?? null
  },
})

/**
 * Initialize a new rotation for a paddock
 */
export const initializeRotation = mutation({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.string(),
    entryNdviMean: v.number(),
    startingCorner: v.optional(
      v.union(v.literal('NW'), v.literal('NE'), v.literal('SW'), v.literal('SE'))
    ),
    progressionDirection: v.optional(v.union(v.literal('horizontal'), v.literal('vertical'))),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()
    const today = now.split('T')[0]

    // Mark any existing active rotation for this paddock as interrupted
    const existingActive = await ctx.db
      .query('paddockRotations')
      .withIndex('by_active', (q: any) =>
        q
          .eq('farmExternalId', args.farmExternalId)
          .eq('paddockExternalId', args.paddockExternalId)
          .eq('status', 'active')
      )
      .first()

    if (existingActive) {
      const daysInRotation = Math.floor(
        (new Date(today).getTime() - new Date(existingActive.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      await ctx.db.patch(existingActive._id, {
        status: 'interrupted',
        endDate: today,
        daysInRotation,
        updatedAt: now,
      })
      log.debug('Marked existing rotation as interrupted', {
        rotationId: existingActive._id.toString(),
        daysInRotation,
      })
    }

    // Check for previous rotation's ungrazed areas
    const previousRotation = await ctx.db
      .query('paddockRotations')
      .withIndex('by_paddock', (q: any) =>
        q.eq('farmExternalId', args.farmExternalId).eq('paddockExternalId', args.paddockExternalId)
      )
      .order('desc')
      .first()

    // Get farm settings for default progression settings
    const settings = await ctx.db
      .query('farmSettings')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', args.farmExternalId))
      .first()

    const progressionSettings = settings?.progressionSettings
    const defaultCorner =
      args.startingCorner ??
      (progressionSettings?.defaultStartCorner !== 'auto'
        ? progressionSettings?.defaultStartCorner
        : undefined) ??
      'NW'
    const defaultDirection =
      args.progressionDirection ??
      (progressionSettings?.defaultDirection !== 'auto'
        ? progressionSettings?.defaultDirection
        : undefined) ??
      'horizontal'

    const rotationId = await ctx.db.insert('paddockRotations', {
      farmExternalId: args.farmExternalId,
      paddockExternalId: args.paddockExternalId,
      status: 'active',
      startDate: today,
      entryNdviMean: args.entryNdviMean,
      startingCorner: defaultCorner as 'NW' | 'NE' | 'SW' | 'SE',
      progressionDirection: defaultDirection as 'horizontal' | 'vertical',
      totalSectionsGrazed: 0,
      totalAreaGrazedHa: 0,
      grazedPercentage: 0,
      // Carry forward ungrazed areas from last rotation
      ungrazedAreas: previousRotation?.ungrazedAreas,
      createdAt: now,
      updatedAt: now,
    })

    log.debug('Initialized new rotation', {
      rotationId: rotationId.toString(),
      paddockExternalId: args.paddockExternalId,
      startingCorner: defaultCorner,
      progressionDirection: defaultDirection,
      hasCarriedUngrazedAreas: !!previousRotation?.ungrazedAreas?.length,
    })

    return rotationId
  },
})

/**
 * Record a section that has been grazed
 */
export const recordSectionGrazed = mutation({
  args: {
    rotationId: v.id('paddockRotations'),
    planId: v.id('plans'),
    sectionGeometry: v.any(),
    sectionAreaHa: v.number(),
    centroid: v.array(v.number()),
    sectionNdviMean: v.number(),
    progressionQuadrant: v.string(),
    adjacentToPrevious: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()
    const today = now.split('T')[0]

    const rotation = await ctx.db.get(args.rotationId)
    if (!rotation) throw new Error('Rotation not found')

    const previousSections = await ctx.db
      .query('sectionGrazingEvents')
      .withIndex('by_rotation', (q: any) => q.eq('rotationId', args.rotationId))
      .collect()

    const sequenceNumber = previousSections.length + 1
    const cumulativeAreaGrazedHa = rotation.totalAreaGrazedHa + args.sectionAreaHa

    // Get paddock for percentage calc
    const farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q: any) => q.eq('externalId', rotation.farmExternalId))
      .first()

    let paddockArea = 1
    if (farm) {
      const paddock = await ctx.db
        .query('paddocks')
        .withIndex('by_farm_externalId', (q: any) =>
          q.eq('farmId', farm._id).eq('externalId', rotation.paddockExternalId)
        )
        .first()
      if (paddock) {
        paddockArea = paddock.area || 1
      }
    }

    const cumulativeGrazedPct = Math.min(100, (cumulativeAreaGrazedHa / paddockArea) * 100)

    // Record section event
    const sectionEventId = await ctx.db.insert('sectionGrazingEvents', {
      farmExternalId: rotation.farmExternalId,
      paddockExternalId: rotation.paddockExternalId,
      rotationId: args.rotationId,
      planId: args.planId,
      date: today,
      sequenceNumber,
      sectionGeometry: args.sectionGeometry,
      sectionAreaHa: args.sectionAreaHa,
      centroid: args.centroid,
      sectionNdviMean: args.sectionNdviMean,
      progressionQuadrant: args.progressionQuadrant,
      adjacentToPrevious: args.adjacentToPrevious,
      cumulativeAreaGrazedHa,
      cumulativeGrazedPct,
      createdAt: now,
    })

    // Update rotation totals
    await ctx.db.patch(args.rotationId, {
      totalSectionsGrazed: sequenceNumber,
      totalAreaGrazedHa: cumulativeAreaGrazedHa,
      grazedPercentage: cumulativeGrazedPct,
      updatedAt: now,
    })

    log.debug('Recorded section grazed', {
      sectionEventId: sectionEventId.toString(),
      sequenceNumber,
      cumulativeAreaGrazedHa,
      cumulativeGrazedPct,
      progressionQuadrant: args.progressionQuadrant,
    })

    return sectionEventId
  },
})

/**
 * Record an area that was skipped due to poor NDVI
 */
export const recordUngrazedArea = mutation({
  args: {
    rotationId: v.id('paddockRotations'),
    centroid: v.array(v.number()),
    approximateAreaHa: v.number(),
    reason: v.string(),
    ndviAtSkip: v.number(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()

    const rotation = await ctx.db.get(args.rotationId)
    if (!rotation) throw new Error('Rotation not found')

    const ungrazedAreas = rotation.ungrazedAreas ?? []
    ungrazedAreas.push({
      approximateCentroid: args.centroid,
      approximateAreaHa: args.approximateAreaHa,
      reason: args.reason,
      ndviAtSkip: args.ndviAtSkip,
    })

    await ctx.db.patch(args.rotationId, {
      ungrazedAreas,
      updatedAt: now,
    })

    log.debug('Recorded ungrazed area', {
      rotationId: args.rotationId.toString(),
      centroid: args.centroid,
      approximateAreaHa: args.approximateAreaHa,
      reason: args.reason,
    })
  },
})

/**
 * Complete a rotation (mark as completed)
 */
export const completeRotation = mutation({
  args: {
    rotationId: v.id('paddockRotations'),
    exitNdviMean: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()
    const today = now.split('T')[0]

    const rotation = await ctx.db.get(args.rotationId)
    if (!rotation) throw new Error('Rotation not found')

    const daysInRotation = Math.floor(
      (new Date(today).getTime() - new Date(rotation.startDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    await ctx.db.patch(args.rotationId, {
      status: 'completed',
      endDate: today,
      exitNdviMean: args.exitNdviMean,
      daysInRotation,
      updatedAt: now,
    })

    log.debug('Completed rotation', {
      rotationId: args.rotationId.toString(),
      daysInRotation,
      exitNdviMean: args.exitNdviMean,
      totalSectionsGrazed: rotation.totalSectionsGrazed,
      grazedPercentage: rotation.grazedPercentage,
    })
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
        return Number.isFinite(sqMeters)
          ? Math.round(sqMeters * HECTARES_PER_SQUARE_METER * 10) / 10
          : 0
      } catch {
        return 0
      }
    }

    const paddockArea = paddock.area || calculateAreaHectares(paddock.geometry)
    if (paddockArea === 0) return 0

    const today = new Date().toISOString().split('T')[0]
    const plans = await ctx.db
      .query('plans')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .collect()

    let totalGrazedArea = 0
    for (const plan of plans) {
      // Only count sections from previous days (exclude today's plan which may be regenerated)
      // Also exclude rejected plans as they weren't executed
      if (
        plan.primaryPaddockExternalId === args.paddockId &&
        plan.sectionGeometry &&
        plan.date !== today &&
        plan.status !== 'rejected'
      ) {
        totalGrazedArea += plan.sectionAreaHectares || calculateAreaHectares(plan.sectionGeometry)
      }
    }

    return Math.round((totalGrazedArea / paddockArea) * 100)
  },
})

/**
 * Compute the ungrazed geometry for a paddock in the current rotation.
 * Returns paddock geometry MINUS all grazed sections = remaining ungrazed area.
 * Used for visual reasoning validation and section placement.
 */
export const computeUngrazedGeometry = query({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    ungrazedGeometry: Polygon | MultiPolygon | null
    ungrazedAreaHa: number
    paddockAreaHa: number
    grazedPercentage: number
    grazedSections: Array<{
      date: string
      geometry: Polygon
      areaHa: number
      dayNumber: number
    }>
  }> => {
    const { farmExternalId, paddockExternalId } = args

    // Get farm
    const farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q: any) => q.eq('externalId', farmExternalId))
      .first()

    if (!farm) {
      return {
        ungrazedGeometry: null,
        ungrazedAreaHa: 0,
        paddockAreaHa: 0,
        grazedPercentage: 0,
        grazedSections: [],
      }
    }

    // Get paddock
    const paddock = await ctx.db
      .query('paddocks')
      .withIndex('by_farm_externalId', (q: any) =>
        q.eq('farmId', farm._id).eq('externalId', paddockExternalId)
      )
      .first()

    if (!paddock || !paddock.geometry) {
      return {
        ungrazedGeometry: null,
        ungrazedAreaHa: 0,
        paddockAreaHa: 0,
        grazedPercentage: 0,
        grazedSections: [],
      }
    }

    const paddockFeature = paddock.geometry as Feature<Polygon>
    const paddockAreaSqM = area(paddockFeature)
    const paddockAreaHa = paddockAreaSqM * HECTARES_PER_SQUARE_METER

    // Get active rotation for this paddock
    const activeRotation = await ctx.db
      .query('paddockRotations')
      .withIndex('by_active', (q: any) =>
        q
          .eq('farmExternalId', farmExternalId)
          .eq('paddockExternalId', paddockExternalId)
          .eq('status', 'active')
      )
      .first()

    // Get grazed sections from current rotation
    let grazedSections: Array<{
      date: string
      geometry: Polygon
      areaHa: number
      dayNumber: number
    }> = []

    if (activeRotation) {
      const sectionEvents = await ctx.db
        .query('sectionGrazingEvents')
        .withIndex('by_rotation', (q: any) => q.eq('rotationId', activeRotation._id))
        .collect()

      grazedSections = sectionEvents
        .filter((s: any) => s.sectionGeometry)
        .map((s: any) => ({
          date: s.date,
          geometry: s.sectionGeometry as Polygon,
          areaHa: s.sectionAreaHa || 0,
          dayNumber: s.sequenceNumber || 1,
        }))
        .sort((a: any, b: any) => a.dayNumber - b.dayNumber)
    } else {
      // Fall back to approved plans if no active rotation
      const today = new Date().toISOString().split('T')[0]
      const plans = await ctx.db
        .query('plans')
        .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
        .collect()

      const approvedPlans = plans
        .filter(
          (p: any) =>
            p.primaryPaddockExternalId === paddockExternalId &&
            p.sectionGeometry &&
            p.date !== today &&
            (p.status === 'approved' || p.status === 'pending')
        )
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

      grazedSections = approvedPlans.map((p: any, index: number) => ({
        date: p.date,
        geometry: p.sectionGeometry as Polygon,
        areaHa: p.sectionAreaHectares || 0,
        dayNumber: index + 1,
      }))
    }

    // If no grazed sections, return full paddock as ungrazed
    if (grazedSections.length === 0) {
      return {
        ungrazedGeometry: paddockFeature.geometry,
        ungrazedAreaHa: paddockAreaHa,
        paddockAreaHa,
        grazedPercentage: 0,
        grazedSections: [],
      }
    }

    // Sequentially subtract each grazed section from paddock geometry.
    let remainingFeature: Feature<Polygon | MultiPolygon> | null = paddockFeature

    for (const section of grazedSections) {
      if (!remainingFeature) {
        break
      }

      const sectionFeature: Feature<Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: section.geometry,
      }

      const diff = difference(featureCollection([remainingFeature, sectionFeature]))
      if (diff && diff.geometry) {
        remainingFeature = diff as Feature<Polygon | MultiPolygon>
      } else {
        remainingFeature = null
      }
    }

    let ungrazedGeometry: Polygon | MultiPolygon | null = null
    let ungrazedAreaHa = 0

    if (remainingFeature?.geometry) {
      ungrazedGeometry = remainingFeature.geometry as Polygon | MultiPolygon
      const ungrazedAreaSqM = area(remainingFeature)
      ungrazedAreaHa = ungrazedAreaSqM * HECTARES_PER_SQUARE_METER
    }

    const grazedPercentage = Math.round(((paddockAreaHa - ungrazedAreaHa) / paddockAreaHa) * 100)

    log.debug('computeUngrazedGeometry result', {
      paddockExternalId,
      paddockAreaHa: paddockAreaHa.toFixed(2),
      ungrazedAreaHa: ungrazedAreaHa.toFixed(2),
      grazedPercentage,
      grazedSectionsCount: grazedSections.length,
    })

    return {
      ungrazedGeometry,
      ungrazedAreaHa: Math.round(ungrazedAreaHa * 100) / 100,
      paddockAreaHa: Math.round(paddockAreaHa * 100) / 100,
      grazedPercentage,
      grazedSections,
    }
  },
})

/**
 * Get the remaining ungrazed area.
 * Agent calls this to understand what's left to graze.
 */
export const getUngrazedRemaining = query({
  args: {
    forecastId: v.id('paddockForecasts'),
  },
  handler: async (ctx, args) => {
    const forecast = await ctx.db.get(args.forecastId)
    if (!forecast) {
      throw new Error('Forecast not found')
    }

    // Get paddock geometry
    const farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q: any) => q.eq('externalId', forecast.farmExternalId))
      .first()

    if (!farm) {
      throw new Error('Farm not found')
    }

    const paddock = await ctx.db
      .query('paddocks')
      .withIndex('by_farm_externalId', (q: any) =>
        q.eq('farmId', farm._id).eq('externalId', forecast.paddockExternalId)
      )
      .first()

    if (!paddock) {
      throw new Error('Paddock not found')
    }

    const paddockFeature = paddock.geometry as Feature<Polygon>

    // Get all grazed sections from history
    const grazedSections: Polygon[] = forecast.grazingHistory.map((entry) => entry.geometry)

    // Compute remaining area
    const result = computeUngrazedRemaining({
      paddockGeometry: paddockFeature,
      grazedSections,
    })

    log.info('Computed ungrazed remaining area', {
      forecastId: args.forecastId,
      grazedSectionsCount: grazedSections.length,
      remainingAreaHa: result.areaHa,
      remainingPct: result.percentOfPaddock,
      shape: result.shape,
      approximateLocation: result.approximateLocation,
    })

    return {
      geometry: result.geometry,
      centroid: result.centroid,
      areaHa: result.areaHa,
      percentOfPaddock: result.percentOfPaddock,
      shape: result.shape,
      approximateLocation: result.approximateLocation,
    }
  },
})
