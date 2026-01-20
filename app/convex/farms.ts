import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server'
import { v } from 'convex/values'
import {
  DEFAULT_FARM_EXTERNAL_ID,
  DEFAULT_USER_EXTERNAL_ID,
  defaultFarmSettings,
  sampleFarm,
  samplePaddocks,
} from './seedData'

export const getFarm = query({
  args: { farmId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const externalId = args.farmId ?? DEFAULT_FARM_EXTERNAL_ID
    const farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q) => q.eq('externalId', externalId))
      .first()

    if (farm) {
      return farm
    }

    return ctx.db.query('farms').first()
  },
})

export const seedSampleFarm = mutation({
  args: {
    farmId: v.optional(v.string()),
    seedUser: v.optional(v.boolean()),
    userExternalId: v.optional(v.string()),
    seedSettings: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const externalId = args.farmId ?? DEFAULT_FARM_EXTERNAL_ID
    const now = new Date().toISOString()

    let farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q) => q.eq('externalId', externalId))
      .first()

    let farmSeeded = false
    if (!farm) {
      const farmId = await ctx.db.insert('farms', {
        ...sampleFarm,
        externalId,
        createdAt: now,
        updatedAt: now,
      })
      farm = await ctx.db.get(farmId)
      farmSeeded = true
    }

    if (!farm) {
      return { seeded: false, reason: 'Farm insert failed.' }
    }

    const existingPaddocks = await ctx.db
      .query('paddocks')
      .withIndex('by_farm', (q) => q.eq('farmId', farm._id))
      .collect()

    let paddocksSeeded = false
    if (existingPaddocks.length === 0) {
      for (const paddock of samplePaddocks) {
        await ctx.db.insert('paddocks', {
          farmId: farm._id,
          externalId: paddock.externalId,
          name: paddock.name,
          status: paddock.status,
          ndvi: paddock.ndvi,
          restDays: paddock.restDays,
          area: paddock.area,
          waterAccess: paddock.waterAccess,
          lastGrazed: paddock.lastGrazed,
          geometry: paddock.geometry,
          createdAt: now,
          updatedAt: now,
        })
      }

      await ctx.db.patch(farm._id, {
        paddockCount: samplePaddocks.length,
        updatedAt: now,
      })

      paddocksSeeded = true

    }

    if (!paddocksSeeded && farm.paddockCount !== existingPaddocks.length) {
      await ctx.db.patch(farm._id, {
        paddockCount: existingPaddocks.length,
        updatedAt: now,
      })
    }

    const paddockCount = paddocksSeeded ? samplePaddocks.length : existingPaddocks.length

    let userSeeded = false
    if (args.seedUser) {
      const userExternalId = args.userExternalId ?? DEFAULT_USER_EXTERNAL_ID
      const existingUser = await ctx.db
        .query('users')
        .withIndex('by_externalId', (q) => q.eq('externalId', userExternalId))
        .first()

      if (!existingUser) {
        await ctx.db.insert('users', {
          externalId: userExternalId,
          farmExternalId: externalId,
          createdAt: now,
          updatedAt: now,
        })
        userSeeded = true
      }
    }

    let settingsSeeded = false
    if (args.seedSettings) {
      const existingSettings = await ctx.db
        .query('farmSettings')
        .withIndex('by_farm', (q) => q.eq('farmExternalId', externalId))
        .first()

      if (!existingSettings) {
        await ctx.db.insert('farmSettings', {
          farmExternalId: externalId,
          ...defaultFarmSettings,
          createdAt: now,
          updatedAt: now,
        })
        settingsSeeded = true
      }
    }

    return {
      farmId: farm._id,
      farmExternalId: externalId,
      paddockCount,
      seededFarm: farmSeeded,
      seededPaddocks: paddocksSeeded,
      seededUser: userSeeded,
      seededSettings: settingsSeeded,
    }
  },
})
