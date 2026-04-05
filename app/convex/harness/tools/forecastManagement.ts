import { query, mutation } from '../../_generated/server'
import { v } from 'convex/values'
import type { Feature, Polygon } from 'geojson'
import { createLogger } from '../../lib/logger'
import {
  calculateSectionSize,
  DEFAULT_MIN_SECTION_PCT,
  DEFAULT_PASTURE_YIELD_KG_PER_HA,
  validateAgentSection,
  createRectangleSection,
  getPaddockContext,
  type StartingCorner,
} from '../../lib/sectionSizing'
import { mergeGrazingPrinciples } from '../../lib/grazingPrinciples'
import { getFeatureCentroid } from '../../lib/geoCompat'
import { findFarmByExternalId } from './_helpers'

const log = createLogger('forecastManagement')

/**
 * Get or create a paddock forecast for a paddock rotation.
 * Creates an empty forecast that the agent will fill in with sections.
 * The agent draws sections autonomously using drawSection tool.
 */
export const getOrCreateForecast = mutation({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.string(),
  },
  handler: async (ctx, args) => {
    const { farmExternalId, paddockExternalId } = args
    const now = new Date().toISOString()

    // Check for existing active forecast
    const existingForecast = await ctx.db
      .query('paddockForecasts')
      .withIndex('by_active', (q: any) =>
        q
          .eq('farmExternalId', farmExternalId)
          .eq('paddockExternalId', paddockExternalId)
          .eq('status', 'active')
      )
      .first()

    if (existingForecast) {
      log.debug('Found existing paddock forecast', {
        forecastId: existingForecast._id.toString(),
        activeSectionIndex: existingForecast.activeSectionIndex,
        totalSections: existingForecast.forecastedSections.length,
      })
      return existingForecast
    }

    // Get farm and paddock data
    const farm = await findFarmByExternalId(ctx, farmExternalId)
    if (!farm) {
      throw new Error(`Farm not found: ${farmExternalId}`)
    }

    const paddock = await ctx.db
      .query('paddocks')
      .withIndex('by_farm_externalId', (q: any) =>
        q.eq('farmId', farm._id).eq('externalId', paddockExternalId)
      )
      .first()

    if (!paddock) {
      const allPaddocks = await ctx.db
        .query('paddocks')
        .withIndex('by_farm', (q: any) => q.eq('farmId', farm._id))
        .collect()
      const paddockIds = allPaddocks.map((p: any) => p.externalId).join(', ')
      throw new Error(
        `Paddock not found: ${paddockExternalId}. ` +
          `Farm ${farmExternalId} has ${allPaddocks.length} paddocks: [${paddockIds}]`
      )
    }

    // Get farm settings
    const settings = await ctx.db
      .query('farmSettings')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .first()

    const progressionSettings = settings?.progressionSettings
    const livestockSettings = settings?.livestockSettings
    const rotationFrequency = settings?.rotationFrequency ?? 1

    // Get livestock for section sizing
    const livestockEntries = await ctx.db
      .query('livestock')
      .withIndex('by_farm', (q: any) => q.eq('farmId', farm._id))
      .collect()

    // Calculate total AU
    const cowAU = livestockSettings?.cowAU ?? 1.0
    const calfAU = livestockSettings?.calfAU ?? 0.5
    const sheepAU = livestockSettings?.sheepAU ?? 0.2
    const lambAU = livestockSettings?.lambAU ?? 0.1
    const dailyDMPerAU = livestockSettings?.dailyDMPerAU ?? 12
    const pastureYieldKgPerHa =
      livestockSettings?.pastureYieldKgPerHa ?? DEFAULT_PASTURE_YIELD_KG_PER_HA

    let totalAU = 0
    for (const entry of livestockEntries) {
      if (entry.animalType === 'cow') {
        totalAU += entry.adultCount * cowAU + entry.offspringCount * calfAU
      } else if (entry.animalType === 'sheep') {
        totalAU += entry.adultCount * sheepAU + entry.offspringCount * lambAU
      }
    }

    // Calculate section size
    const paddockArea = paddock.area || 1
    const sectionSizeResult = calculateSectionSize({
      totalAnimalUnits: totalAU,
      dailyDMPerAU,
      pastureYieldKgPerHa,
      rotationFrequency,
      paddockAreaHa: paddockArea,
      minSectionPct: settings?.minSectionPct ?? DEFAULT_MIN_SECTION_PCT,
    })

    // Determine progression settings
    const startingCorner: StartingCorner =
      progressionSettings?.defaultStartCorner !== 'auto'
        ? ((progressionSettings?.defaultStartCorner as StartingCorner) ?? 'NW')
        : 'NW'

    const progressionDirection =
      progressionSettings?.defaultDirection !== 'auto'
        ? (progressionSettings?.defaultDirection ?? 'horizontal')
        : 'horizontal'

    // Estimate total sections needed
    const estimatedSections = Math.ceil(paddockArea / sectionSizeResult.targetSectionHa)
    const estimatedTotalDays = estimatedSections * rotationFrequency

    // Create the forecast with empty sections - agent will draw them
    const forecastId = await ctx.db.insert('paddockForecasts', {
      farmExternalId,
      paddockExternalId,
      status: 'active',
      startingCorner,
      progressionDirection,
      targetSectionHa: sectionSizeResult.targetSectionHa,
      targetSectionPct: sectionSizeResult.targetSectionPct,
      forecastedSections: [], // Agent will fill this in via drawSection
      estimatedTotalDays,
      activeSectionIndex: 0,
      daysInActiveSection: 1,
      grazingHistory: [],
      createdAt: now,
      createdBy: 'agent', // Agent creates these forecasts
      updatedAt: now,
    })

    log.debug('Created new empty paddock forecast', {
      forecastId: forecastId.toString(),
      paddockExternalId,
      targetSectionHa: sectionSizeResult.targetSectionHa,
      estimatedSections,
      estimatedTotalDays,
      startingCorner,
      progressionDirection,
    })

    return await ctx.db.get(forecastId)
  },
})

/**
 * Get the active forecast for a paddock
 */
export const getActiveForecast = query({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('paddockForecasts')
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
 * Delete an active forecast to allow regeneration with new algorithm.
 * Used for testing/development when section generation logic changes.
 */
export const deleteForecast = mutation({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.string(),
  },
  handler: async (ctx, args) => {
    const forecast = await ctx.db
      .query('paddockForecasts')
      .withIndex('by_active', (q: any) =>
        q
          .eq('farmExternalId', args.farmExternalId)
          .eq('paddockExternalId', args.paddockExternalId)
          .eq('status', 'active')
      )
      .first()

    if (!forecast) {
      return { deleted: false, message: 'No active forecast found' }
    }

    await ctx.db.delete(forecast._id)
    return {
      deleted: true,
      message: `Deleted forecast with ${forecast.forecastedSections.length} sections`,
      forecastId: forecast._id.toString(),
    }
  },
})

/**
 * Evaluate the forecast context for the agent to make a daily plan recommendation
 */
export const evaluateForecastContext = query({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.string(),
  },
  handler: async (ctx, args) => {
    const { farmExternalId, paddockExternalId } = args

    // Get farm settings
    const settings = await ctx.db
      .query('farmSettings')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .first()

    // Get grazing principles
    const principles = await ctx.db
      .query('grazingPrinciples')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .first()

    const merged = mergeGrazingPrinciples({
      minDaysPerSection: principles?.minDaysPerSection,
      maxDaysPerSection: principles?.maxDaysPerSection,
      minNdviThreshold: principles?.minNdviThreshold ?? settings?.minNDVIThreshold,
    })

    // Get active forecast
    const forecast = await ctx.db
      .query('paddockForecasts')
      .withIndex('by_active', (q: any) =>
        q
          .eq('farmExternalId', farmExternalId)
          .eq('paddockExternalId', paddockExternalId)
          .eq('status', 'active')
      )
      .first()

    if (!forecast) {
      return {
        hasActiveForecast: false,
        shouldMoveToNextSection: true,
        reasoning: ['No active forecast - need to create one'],
        activeSectionIndex: 0,
        daysInActiveSection: 0,
      }
    }

    const activeSection = forecast.forecastedSections[forecast.activeSectionIndex]
    if (!activeSection) {
      // We've completed all sections
      return {
        hasActiveForecast: true,
        shouldMoveToNextSection: false,
        reasoning: ['All sections in forecast have been completed'],
        activeSectionIndex: forecast.activeSectionIndex,
        daysInActiveSection: forecast.daysInActiveSection,
        forecastComplete: true,
      }
    }

    // Get farm for livestock
    const farm = await findFarmByExternalId(ctx, farmExternalId)

    // Get livestock for forage calculation
    let totalAU = 0
    if (farm) {
      const livestockEntries = await ctx.db
        .query('livestock')
        .withIndex('by_farm', (q: any) => q.eq('farmId', farm._id))
        .collect()

      const livestockSettings = settings?.livestockSettings
      const cowAU = livestockSettings?.cowAU ?? 1.0
      const calfAU = livestockSettings?.calfAU ?? 0.5
      const sheepAU = livestockSettings?.sheepAU ?? 0.2
      const lambAU = livestockSettings?.lambAU ?? 0.1

      for (const entry of livestockEntries) {
        if (entry.animalType === 'cow') {
          totalAU += entry.adultCount * cowAU + entry.offspringCount * calfAU
        } else if (entry.animalType === 'sheep') {
          totalAU += entry.adultCount * sheepAU + entry.offspringCount * lambAU
        }
      }
    }

    // Estimate forage remaining
    const dailyDMPerAU = settings?.livestockSettings?.dailyDMPerAU ?? 12
    const pastureYieldKgPerHa =
      settings?.livestockSettings?.pastureYieldKgPerHa ?? DEFAULT_PASTURE_YIELD_KG_PER_HA
    const initialForageKg = activeSection.areaHa * pastureYieldKgPerHa
    const consumedForageKg = totalAU * dailyDMPerAU * forecast.daysInActiveSection
    const remainingForageKg = Math.max(0, initialForageKg - consumedForageKg)
    const remainingForagePct = initialForageKg > 0 ? (remainingForageKg / initialForageKg) * 100 : 0

    // Get current NDVI
    const latestObs = await ctx.db
      .query('observations')
      .withIndex('by_paddock_date', (q: any) => q.eq('paddockExternalId', paddockExternalId))
      .order('desc')
      .first()

    const currentNdvi = latestObs?.ndviMean ?? 0.5

    // Build reasoning hints for agent (not a decision - agent decides)
    const reasoning: string[] = []

    // Timing hints
    if (forecast.daysInActiveSection < merged.minDaysPerSection) {
      reasoning.push(
        `Day ${forecast.daysInActiveSection} of minimum ${merged.minDaysPerSection} - consider staying unless forage depleted`
      )
    } else if (forecast.daysInActiveSection >= merged.maxDaysPerSection) {
      reasoning.push(`Reached maximum ${merged.maxDaysPerSection} days - consider moving`)
    } else {
      reasoning.push(
        `Day ${forecast.daysInActiveSection} meets minimum ${merged.minDaysPerSection} days`
      )
    }

    // Forage hints
    if (remainingForagePct < 20) {
      reasoning.push(`Forage low (~${Math.round(remainingForagePct)}% remaining) - consider moving`)
    } else if (remainingForagePct < 40) {
      reasoning.push(`Forage moderate (~${Math.round(remainingForagePct)}% remaining)`)
    } else {
      reasoning.push(`Forage adequate (~${Math.round(remainingForagePct)}% remaining)`)
    }

    // NDVI hints
    if (currentNdvi < merged.minNdviThreshold * 0.8) {
      reasoning.push(`Section NDVI (${currentNdvi.toFixed(2)}) dropped below threshold`)
    }

    // Calculate progress through forecast
    const completedSections = forecast.grazingHistory.length
    const totalSections = forecast.forecastedSections.length
    const progressPct =
      totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0

    return {
      hasActiveForecast: true,
      forecastId: forecast._id,
      reasoning, // Hints for agent, not a decision
      activeSectionIndex: forecast.activeSectionIndex,
      daysInActiveSection: forecast.daysInActiveSection,
      estimatedForageRemainingPct: Math.round(remainingForagePct),
      currentNdvi,
      activeSection,
      nextSection: forecast.forecastedSections[forecast.activeSectionIndex + 1] ?? null,
      forecastProgress: {
        completedSections,
        totalSections,
        progressPct,
        estimatedDaysRemaining:
          forecast.estimatedTotalDays - completedSections * (settings?.rotationFrequency ?? 1),
      },
      // Provide context for agent's autonomous decision
      minDaysPerSection: merged.minDaysPerSection,
      maxDaysPerSection: merged.maxDaysPerSection,
      minNdviThreshold: merged.minNdviThreshold,
    }
  },
})

/**
 * Draw a section for the forecast.
 * Agent provides polygon coordinates directly or uses rectangle helper.
 * Validates: inside paddock, no major overlaps, reasonable connectivity.
 */
export const drawSection = mutation({
  args: {
    forecastId: v.id('paddockForecasts'),
    // Option 1: Direct polygon coordinates [[lng, lat], ...]
    coordinates: v.optional(v.array(v.array(v.number()))),
    // Option 2: Rectangle helper
    rectangle: v.optional(
      v.object({
        corner: v.union(v.literal('NW'), v.literal('NE'), v.literal('SW'), v.literal('SE')),
        widthPct: v.number(),
        heightPct: v.number(),
      })
    ),
    reasoning: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()

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

    // Get grazed sections for validation
    const grazedSections: Polygon[] = forecast.grazingHistory.map((entry) => entry.geometry)

    let sectionCoords: number[][]

    // Option 2: Rectangle helper
    if (args.rectangle) {
      const result = createRectangleSection({
        paddockGeometry: paddockFeature,
        corner: args.rectangle.corner,
        widthPct: args.rectangle.widthPct,
        heightPct: args.rectangle.heightPct,
      })

      // Store result and return early since rectangle is pre-validated
      const sectionIndex = forecast.forecastedSections.length
      const newSection = {
        index: sectionIndex,
        geometry: result.geometry,
        centroid: result.centroid,
        areaHa: result.areaHa,
        quadrant: args.rectangle.corner,
        estimatedDays: 1, // Will be updated based on actual usage
      }

      await ctx.db.patch(args.forecastId, {
        forecastedSections: [...forecast.forecastedSections, newSection],
        createdBy: 'agent',
        updatedAt: now,
      })

      log.info('Drew rectangle section', {
        forecastId: args.forecastId,
        sectionIndex,
        corner: args.rectangle.corner,
        widthPct: args.rectangle.widthPct,
        heightPct: args.rectangle.heightPct,
        areaHa: result.areaHa,
      })

      return {
        success: true,
        sectionIndex,
        geometry: result.geometry,
        centroid: result.centroid,
        areaHa: result.areaHa,
        warnings: [],
      }
    }

    // Option 1: Direct coordinates
    if (!args.coordinates || args.coordinates.length < 3) {
      throw new Error('Must provide either coordinates (at least 3 points) or rectangle helper')
    }

    sectionCoords = args.coordinates

    // Validate the section
    const validation = validateAgentSection(
      sectionCoords,
      paddockFeature,
      grazedSections,
      forecast.targetSectionHa
    )

    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      }
    }

    // Use the (possibly clipped) geometry
    const finalGeometry = validation.clippedGeometry!

    // Calculate centroid
    const sectionCentroid = getFeatureCentroid({
      type: 'Feature',
      properties: {},
      geometry: finalGeometry,
    })

    // Determine quadrant
    const paddockContext = getPaddockContext(paddockFeature)
    const centerLng = (paddockContext.bounds.minLng + paddockContext.bounds.maxLng) / 2
    const centerLat = (paddockContext.bounds.minLat + paddockContext.bounds.maxLat) / 2
    const isNorth = sectionCentroid[1] > centerLat
    const isWest = sectionCentroid[0] < centerLng
    const quadrant = `${isNorth ? 'N' : 'S'}${isWest ? 'W' : 'E'}`

    // Add section to forecast
    const sectionIndex = forecast.forecastedSections.length
    const newSection = {
      index: sectionIndex,
      geometry: finalGeometry,
      centroid: sectionCentroid,
      areaHa: validation.areaHa,
      quadrant,
      estimatedDays: 1,
    }

    await ctx.db.patch(args.forecastId, {
      forecastedSections: [...forecast.forecastedSections, newSection],
      createdBy: 'agent',
      updatedAt: now,
    })

    log.info('Drew section from coordinates', {
      forecastId: args.forecastId,
      sectionIndex,
      areaHa: validation.areaHa,
      quadrant,
      warnings: validation.warnings,
    })

    return {
      success: true,
      sectionIndex,
      geometry: finalGeometry,
      centroid: sectionCentroid,
      areaHa: validation.areaHa,
      warnings: validation.warnings,
    }
  },
})

/**
 * Clear all sections from a forecast to allow re-drawing.
 * Used when agent wants to start fresh.
 */
export const clearForecastSections = mutation({
  args: {
    forecastId: v.id('paddockForecasts'),
  },
  handler: async (ctx, args) => {
    const forecast = await ctx.db.get(args.forecastId)
    if (!forecast) {
      throw new Error('Forecast not found')
    }

    await ctx.db.patch(args.forecastId, {
      forecastedSections: [],
      activeSectionIndex: 0,
      daysInActiveSection: 1,
      grazingHistory: [],
      createdBy: 'agent',
      updatedAt: new Date().toISOString(),
    })

    log.info('Cleared forecast sections', {
      forecastId: args.forecastId,
      previousSectionsCount: forecast.forecastedSections.length,
    })

    return { success: true }
  },
})
