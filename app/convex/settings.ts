import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server'
import { v } from 'convex/values'
import { defaultFarmSettings } from './seedData'

const settingsShape = {
  minNDVIThreshold: v.number(),
  minRestPeriod: v.number(),
  cloudCoverTolerance: v.number(),
  dailyBriefTime: v.string(),
  emailNotifications: v.boolean(),
  pushNotifications: v.boolean(),
  virtualFenceProvider: v.optional(v.string()),
  apiKey: v.optional(v.string()),
}

export const getSettings = query({
  args: { farmId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('farmSettings')
      .withIndex('by_farm', (q) => q.eq('farmExternalId', args.farmId))
      .first()
  },
})

export const updateSettings = mutation({
  args: {
    farmId: v.string(),
    settings: v.object(settingsShape),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()
    const existing = await ctx.db
      .query('farmSettings')
      .withIndex('by_farm', (q) => q.eq('farmExternalId', args.farmId))
      .first()

    if (!existing) {
      const id = await ctx.db.insert('farmSettings', {
        farmExternalId: args.farmId,
        ...args.settings,
        createdAt: now,
        updatedAt: now,
      })
      return { id }
    }

    await ctx.db.patch(existing._id, {
      ...args.settings,
      updatedAt: now,
    })

    return { id: existing._id }
  },
})

export const resetSettings = mutation({
  args: { farmId: v.string() },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()
    const existing = await ctx.db
      .query('farmSettings')
      .withIndex('by_farm', (q) => q.eq('farmExternalId', args.farmId))
      .first()

    if (!existing) {
      const id = await ctx.db.insert('farmSettings', {
        farmExternalId: args.farmId,
        ...defaultFarmSettings,
        createdAt: now,
        updatedAt: now,
      })
      return { id }
    }

    await ctx.db.patch(existing._id, {
      ...defaultFarmSettings,
      updatedAt: now,
    })

    return { id: existing._id }
  },
})
