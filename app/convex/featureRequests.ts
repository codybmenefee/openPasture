import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

const featureCategory = v.union(
  v.literal('grazing'),
  v.literal('map'),
  v.literal('satellite'),
  v.literal('livestock'),
  v.literal('analytics'),
  v.literal('integrations'),
  v.literal('mobile'),
  v.literal('other')
)

const featureContext = v.object({
  url: v.string(),
  userAgent: v.string(),
  screenSize: v.optional(v.string()),
  timestamp: v.string(),
})

/**
 * Insert a feature request into the database
 */
export const insertFeatureRequest = mutation({
  args: {
    userExternalId: v.optional(v.string()),
    farmExternalId: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    category: featureCategory,
    context: featureContext,
    githubIssueUrl: v.optional(v.string()),
    githubIssueNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString()
    return await ctx.db.insert('featureRequests', {
      userExternalId: args.userExternalId,
      farmExternalId: args.farmExternalId,
      title: args.title,
      description: args.description,
      category: args.category,
      context: args.context,
      githubIssueUrl: args.githubIssueUrl,
      githubIssueNumber: args.githubIssueNumber,
      createdAt: now,
      updatedAt: now,
    })
  },
})

/**
 * List feature requests for a user
 */
export const listByUser = query({
  args: {
    userExternalId: v.string(),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query('featureRequests')
      .withIndex('by_user', (q) => q.eq('userExternalId', args.userExternalId))
      .order('desc')
      .collect()
    return requests
  },
})
