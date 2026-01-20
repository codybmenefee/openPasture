import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server'
import { v } from 'convex/values'
import { DEFAULT_FARM_EXTERNAL_ID, sampleFarm, samplePaddocks } from './seedData'

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
  args: { farmId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const externalId = args.farmId ?? DEFAULT_FARM_EXTERNAL_ID
    const now = new Date().toISOString()

    let farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q) => q.eq('externalId', externalId))
      .first()

    if (!farm) {
      const farmId = await ctx.db.insert('farms', {
        ...sampleFarm,
        externalId,
        createdAt: now,
        updatedAt: now,
      })
      farm = await ctx.db.get(farmId)
    }

    if (!farm) {
      return { seeded: false, reason: 'Farm insert failed.' }
    }

    const existingPaddocks = await ctx.db
      .query('paddocks')
      .withIndex('by_farm', (q) => q.eq('farmId', farm._id))
      .collect()

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

      return { seeded: true, farmId: farm._id, paddockCount: samplePaddocks.length }
    }

    if (farm.paddockCount !== existingPaddocks.length) {
      await ctx.db.patch(farm._id, {
        paddockCount: existingPaddocks.length,
        updatedAt: now,
      })
    }

    return { seeded: false, farmId: farm._id, paddockCount: existingPaddocks.length }
  },
})
