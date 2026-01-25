import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const polygonFeature = v.object({
  type: v.literal('Feature'),
  properties: v.optional(v.any()),
  geometry: v.object({
    type: v.literal('Polygon'),
    coordinates: v.array(v.array(v.array(v.number()))),
  }),
})

/**
 * List all no-graze zones for a farm.
 */
export const list = query({
  args: {
    farmId: v.id('farms'),
  },
  handler: async (ctx, args) => {
    const zones = await ctx.db
      .query('noGrazeZones')
      .withIndex('by_farm', (q) => q.eq('farmId', args.farmId))
      .collect()
    return zones
  },
})

/**
 * Create a new no-graze zone.
 */
export const create = mutation({
  args: {
    farmId: v.id('farms'),
    name: v.string(),
    geometry: polygonFeature,
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()
    const zoneId = await ctx.db.insert('noGrazeZones', {
      farmId: args.farmId,
      name: args.name,
      geometry: args.geometry,
      createdAt: now,
      updatedAt: now,
    })
    return zoneId
  },
})

/**
 * Update a no-graze zone.
 */
export const update = mutation({
  args: {
    id: v.id('noGrazeZones'),
    name: v.optional(v.string()),
    geometry: v.optional(polygonFeature),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id)
    if (!existing) {
      throw new Error('No-graze zone not found')
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }
    if (args.name !== undefined) updates.name = args.name
    if (args.geometry !== undefined) updates.geometry = args.geometry

    await ctx.db.patch(args.id, updates)
    return args.id
  },
})

/**
 * Delete a no-graze zone.
 */
export const remove = mutation({
  args: {
    id: v.id('noGrazeZones'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
    return { success: true }
  },
})
