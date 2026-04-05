/**
 * Shared helper utilities for grazing agent tools.
 */

/**
 * Look up a farm by external ID.
 * Shared across modules that need farm resolution.
 */
export async function findFarmByExternalId(ctx: any, farmExternalId: string) {
  return await ctx.db
    .query('farms')
    .withIndex('by_externalId', (q: any) => q.eq('externalId', farmExternalId))
    .first()
}
