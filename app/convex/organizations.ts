import { mutationGeneric as mutation, queryGeneric as query } from 'convex/server'
import { v } from 'convex/values'

/**
 * Get farms by Clerk organization IDs.
 * Used to populate the farm selector with available farms.
 */
export const getFarmsByOrgIds = query({
  args: { orgIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    if (args.orgIds.length === 0) {
      return []
    }

    const farms = await Promise.all(
      args.orgIds.map(async (orgId) => {
        // First try to find by externalId (new Clerk org ID)
        let farm = await ctx.db
          .query('farms')
          .withIndex('by_externalId', (q) => q.eq('externalId', orgId))
          .first()

        // If not found, try legacy ID mapping
        if (!farm) {
          farm = await ctx.db
            .query('farms')
            .withIndex('by_legacyExternalId', (q: any) => q.eq('legacyExternalId', orgId))
            .first()
        }

        return farm
      })
    )

    // Filter out nulls
    return farms.filter((farm): farm is NonNullable<typeof farm> => farm !== null)
  },
})

/**
 * Create a farm when a Clerk organization is created.
 */
export const createFarmFromOrg = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()

    // Check if farm already exists
    const existingFarm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.clerkOrgId))
      .first()

    if (existingFarm) {
      return { farmId: existingFarm._id, created: false }
    }

    // Create a new farm with default values
    // In a real implementation, you'd want to collect more info from the user
    const farmId = await ctx.db.insert('farms', {
      externalId: args.clerkOrgId,
      clerkOrgSlug: args.slug,
      name: args.name,
      location: 'Not specified',
      totalArea: 0,
      paddockCount: 0,
      coordinates: [0, 0], // Default coordinates
      geometry: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]],
        },
      },
      createdAt: now,
      updatedAt: now,
    })

    return { farmId, created: true }
  },
})

/**
 * Update user's active farm preference.
 * This is used when switching between farms in the UI.
 */
export const setActiveFarm = mutation({
  args: {
    userExternalId: v.string(),
    farmExternalId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()

    const user = await ctx.db
      .query('users')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.userExternalId))
      .first()

    if (!user) {
      throw new Error(`User not found: ${args.userExternalId}`)
    }

    await ctx.db.patch(user._id, {
      activeFarmExternalId: args.farmExternalId,
      updatedAt: now,
    })

    return { success: true }
  },
})

/**
 * Delete a farm and all associated data.
 * Called after deleting the Clerk organization.
 */
export const deleteFarm = mutation({
  args: { farmExternalId: v.string() },
  handler: async (ctx, args) => {
    // Find the farm
    const farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.farmExternalId))
      .first()

    if (!farm) {
      // Farm may not exist yet if org was just created
      return { deleted: false, reason: 'not_found' }
    }

    // Delete all paddocks
    const paddocks = await ctx.db
      .query('paddocks')
      .withIndex('by_farm', (q) => q.eq('farmId', farm._id))
      .collect()

    for (const paddock of paddocks) {
      await ctx.db.delete(paddock._id)
    }

    // Delete all observations
    const observations = await ctx.db
      .query('observations')
      .withIndex('by_farm', (q) => q.eq('farmExternalId', args.farmExternalId))
      .collect()

    for (const obs of observations) {
      await ctx.db.delete(obs._id)
    }

    // Delete all grazing events
    const grazingEvents = await ctx.db
      .query('grazingEvents')
      .withIndex('by_farm', (q) => q.eq('farmExternalId', args.farmExternalId))
      .collect()

    for (const event of grazingEvents) {
      await ctx.db.delete(event._id)
    }

    // Delete all plans
    const plans = await ctx.db
      .query('plans')
      .withIndex('by_farm', (q) => q.eq('farmExternalId', args.farmExternalId))
      .collect()

    for (const plan of plans) {
      await ctx.db.delete(plan._id)
    }

    // Delete farm settings
    const settings = await ctx.db
      .query('farmSettings')
      .withIndex('by_farm', (q) => q.eq('farmExternalId', args.farmExternalId))
      .first()

    if (settings) {
      await ctx.db.delete(settings._id)
    }

    // Delete farmer observations
    const farmerObs = await ctx.db
      .query('farmerObservations')
      .withIndex('by_farm', (q) => q.eq('farmId', farm._id))
      .collect()

    for (const obs of farmerObs) {
      await ctx.db.delete(obs._id)
    }

    // Finally delete the farm
    await ctx.db.delete(farm._id)

    return { deleted: true }
  },
})

/**
 * Get farms that match either Clerk org IDs or legacy farm IDs.
 * This helps during the migration period where we support both ID formats.
 */
export const getFarmByIdOrLegacy = query({
  args: { farmId: v.string() },
  handler: async (ctx, args) => {
    // First try to find by externalId (could be Clerk org ID or legacy ID)
    let farm = await ctx.db
      .query('farms')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.farmId))
      .first()

    // If not found, try legacy ID mapping
    if (!farm) {
      farm = await ctx.db
        .query('farms')
        .withIndex('by_legacyExternalId', (q: any) => q.eq('legacyExternalId', args.farmId))
        .first()
    }

    return farm
  },
})
