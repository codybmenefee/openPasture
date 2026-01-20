import { queryGeneric as query } from 'convex/server'
import { v } from 'convex/values'

export const getUserByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('users')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.externalId))
      .first()
  },
})
