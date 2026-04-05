import { query } from '../../_generated/server'
import { v } from 'convex/values'
import { DEFAULT_FARM_EXTERNAL_ID } from '../../seedData'
import {
  calculateSectionSize,
  DEFAULT_SECTION_PCT,
  DEFAULT_MIN_SECTION_PCT,
  DEFAULT_PASTURE_YIELD_KG_PER_HA,
} from '../../lib/sectionSizing'
import { DEFAULT_GRAZING_PRINCIPLES, mergeGrazingPrinciples } from '../../lib/grazingPrinciples'

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
        minNDVIThreshold: 0.4,
        minRestPeriod: 21,
        defaultSectionPct: 0.2,
      }
    }

    return {
      minNDVIThreshold: settings.minNDVIThreshold,
      minRestPeriod: settings.minRestPeriod,
      defaultSectionPct: 0.2,
    }
  },
})

/**
 * Get livestock context for agent section sizing.
 * Returns livestock counts, AU calculations, and computed section size recommendation.
 */
export const getLivestockContextForAgent = query({
  args: {
    farmExternalId: v.string(),
    paddockAreaHa: v.number(),
  },
  handler: async (ctx, args) => {
    const { farmExternalId, paddockAreaHa } = args

    // Get farm by external ID
    const farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q: any) => q.eq('externalId', farmExternalId))
      .first()

    if (!farm) {
      return {
        hasLivestockData: false,
        cows: 0,
        calves: 0,
        sheep: 0,
        lambs: 0,
        totalAnimalUnits: 0,
        dailyDMPerAU: 12,
        pastureYieldKgPerHa: DEFAULT_PASTURE_YIELD_KG_PER_HA,
        rotationFrequency: 1,
        sectionSizeResult: {
          targetSectionHa: paddockAreaHa * (DEFAULT_SECTION_PCT / 100),
          targetSectionPct: DEFAULT_SECTION_PCT,
          dailyHectaresNeeded: paddockAreaHa * (DEFAULT_SECTION_PCT / 100),
          reasoning: `No farm data. Using default ${DEFAULT_SECTION_PCT}% of paddock.`,
          isMinimumEnforced: false,
        },
      }
    }

    // Get farm settings
    const settings = await ctx.db
      .query('farmSettings')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .first()

    const livestockSettings = settings?.livestockSettings
    const rotationFrequency = settings?.rotationFrequency ?? 1
    const minSectionPct = settings?.minSectionPct ?? DEFAULT_MIN_SECTION_PCT

    // Get AU factors from settings or use defaults
    const cowAU = livestockSettings?.cowAU ?? 1.0
    const calfAU = livestockSettings?.calfAU ?? 0.5
    const sheepAU = livestockSettings?.sheepAU ?? 0.2
    const lambAU = livestockSettings?.lambAU ?? 0.1
    const dailyDMPerAU = livestockSettings?.dailyDMPerAU ?? 12
    const pastureYieldKgPerHa =
      livestockSettings?.pastureYieldKgPerHa ?? DEFAULT_PASTURE_YIELD_KG_PER_HA

    // Get livestock entries
    const entries = await ctx.db
      .query('livestock')
      .withIndex('by_farm', (q: any) => q.eq('farmId', farm._id))
      .collect()

    // Aggregate livestock counts
    let cows = 0
    let calves = 0
    let sheep = 0
    let lambs = 0

    for (const entry of entries) {
      if (entry.animalType === 'cow') {
        cows = entry.adultCount
        calves = entry.offspringCount
      } else if (entry.animalType === 'sheep') {
        sheep = entry.adultCount
        lambs = entry.offspringCount
      }
    }

    const hasLivestockData = cows > 0 || sheep > 0

    // Calculate total animal units
    const totalAnimalUnits = cows * cowAU + calves * calfAU + sheep * sheepAU + lambs * lambAU

    // Calculate section size using the utility
    const sectionSizeResult = calculateSectionSize({
      totalAnimalUnits,
      dailyDMPerAU,
      pastureYieldKgPerHa,
      rotationFrequency,
      paddockAreaHa,
      minSectionPct,
    })

    return {
      hasLivestockData,
      cows,
      calves,
      sheep,
      lambs,
      totalAnimalUnits: Math.round(totalAnimalUnits * 10) / 10,
      dailyDMPerAU,
      pastureYieldKgPerHa,
      rotationFrequency,
      sectionSizeResult,
    }
  },
})

/**
 * Get grazing principles for a farm (merged with global defaults)
 */
export const getGrazingPrinciples = query({
  args: {
    farmExternalId: v.string(),
  },
  handler: async (ctx, args) => {
    const farmPrinciples = await ctx.db
      .query('grazingPrinciples')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', args.farmExternalId))
      .first()

    if (!farmPrinciples) {
      return {
        ...DEFAULT_GRAZING_PRINCIPLES,
        customRules: [] as string[],
      }
    }

    const merged = mergeGrazingPrinciples({
      minDaysPerSection: farmPrinciples.minDaysPerSection,
      maxDaysPerSection: farmPrinciples.maxDaysPerSection,
      minNdviThreshold: farmPrinciples.minNdviThreshold,
      preferHighNdviAreas: farmPrinciples.preferHighNdviAreas,
      requireAdjacentSections: farmPrinciples.requireAdjacentSections,
      allowSectionOverlapPct: farmPrinciples.allowSectionOverlapPct,
    })

    return {
      ...merged,
      customRules: farmPrinciples.customRules ?? [],
    }
  },
})
