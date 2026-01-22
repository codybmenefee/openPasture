import { action } from './_generated/server'
import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import { api } from './_generated/api'
import { DEFAULT_FARM_EXTERNAL_ID } from './seedData'
import { runGrazingAgent } from './grazingAgentDirect'

type PlanGenerationData = {
  existingPlanId: Id<'plans'> | null
  observations: any[] | null
  grazingEvents: any[] | null
  settings: any | null
  farm: any | null
  mostRecentGrazingEvent: any | null
  paddocks: any[] | null
}

export const generateDailyPlan = action({
  args: { farmExternalId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<Id<'plans'> | null> => {
    const farmExternalId = args.farmExternalId ?? DEFAULT_FARM_EXTERNAL_ID
    const today = new Date().toISOString().split('T')[0]

    const data = await ctx.runQuery(api.intelligence.getPlanGenerationData as any, {
      farmExternalId,
      date: today,
    }) as PlanGenerationData

    if (data.existingPlanId) {
      return data.existingPlanId
    }

    // Check if we have basic data to work with
    if (!data.paddocks || data.paddocks.length === 0) {
      console.log("No paddocks found for farm:", farmExternalId)
      return null
    }

    const activePaddockId = data.mostRecentGrazingEvent?.paddockExternalId || 
      (data.paddocks && data.paddocks.length > 0 ? data.paddocks[0].externalId : null)

    const settings = data.settings || {
      minNDVIThreshold: 0.40,
      minRestPeriod: 21,
    }

    const result = await runGrazingAgent(
      ctx,
      farmExternalId,
      data.farm?.name || farmExternalId,
      activePaddockId,
      settings
    )

    if (!result.success) {
      console.error("Agent failed:", result.error)
      return null
    }

    if (!result.planCreated) {
      console.log("Agent did not create a plan - skipping fallback generation")
      return null
    }

    const plans = await ctx.runQuery(api.intelligence.getTodayPlan as any, { farmExternalId })
    const todayPlan = plans as any

    return todayPlan?._id || null
  },
})

export const runDailyBriefGeneration = action({
  handler: async (ctx): Promise<Array<{ farmId: string; success: boolean; planId?: Id<'plans'>; error?: string }>> => {
    const farms = await ctx.runQuery(api.intelligence.getAllFarms as any) as any[]

    const results: Array<{ farmId: string; success: boolean; planId?: Id<'plans'>; error?: string }> = []

    for (const farm of farms) {
      try {
        const today = new Date().toISOString().split('T')[0]

        const data = await ctx.runQuery(api.intelligence.getPlanGenerationData as any, {
          farmExternalId: farm.externalId,
          date: today,
        }) as PlanGenerationData

        if (data.existingPlanId) {
          results.push({ farmId: farm.externalId, success: true, planId: data.existingPlanId })
          continue
        }

        // Skip farms without paddocks
        if (!data.paddocks || data.paddocks.length === 0) {
          console.log("No paddocks found for farm:", farm.externalId)
          results.push({ farmId: farm.externalId, success: true })
          continue
        }

        const activePaddockId = data.mostRecentGrazingEvent?.paddockExternalId || 
          (data.paddocks && data.paddocks.length > 0 ? data.paddocks[0].externalId : null)

        const settings = data.settings || {
          minNDVIThreshold: 0.40,
          minRestPeriod: 21,
        }

        const result = await runGrazingAgent(
          ctx,
          farm.externalId,
          data.farm?.name || farm.externalId,
          activePaddockId,
          settings
        )

        if (!result.success) {
          console.error(`Agent failed for farm ${farm.externalId}:`, result.error)
          results.push({ farmId: farm.externalId, success: false, error: result.error })
        } else if (!result.planCreated) {
          console.log(`Agent did not create plan for farm ${farm.externalId}`)
          results.push({ farmId: farm.externalId, success: true })
        } else {
          const plans = await ctx.runQuery(api.intelligence.getTodayPlan as any, { farmExternalId: farm.externalId })
          const todayPlan = plans as any
          results.push({ 
            farmId: farm.externalId, 
            success: true, 
            planId: todayPlan?._id as Id<'plans'> | undefined 
          })
        }
      } catch (error: any) {
        console.error(`Failed to generate plan for farm ${farm.externalId}:`, error.message)
        results.push({ farmId: farm.externalId, success: false, error: error.message })
      }
    }

    return results
  },
})


export const cleanupFallbackPlans = action({
  args: { farmExternalId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ deleted: number }> => {
    const farmExternalId = args.farmExternalId ?? DEFAULT_FARM_EXTERNAL_ID
    
    const result = await ctx.runMutation(api.intelligence.deleteAllFallbackPlans, {
      farmExternalId,
    })
    
    return result as { deleted: number }
  },
})
