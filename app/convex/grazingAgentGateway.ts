/**
 * Agent Gateway - Primary Entry Point for Agent Invocations
 *
 * This is the ONLY public entry point for agent operations.
 * All agent calls should route through this gateway.
 *
 * The gateway:
 * - Fetches farm context and assembles data
 * - Routes to appropriate agent implementation (currently uses runGrazingAgent internally)
 * - Handles trigger-specific logic (morning_brief, observation_refresh, plan_execution)
 * - Provides unified error handling and response format
 * - TODO: Add Braintrust logging for observability
 *
 * Usage:
 *   await ctx.runAction(api.grazingAgentGateway.agentGateway, {
 *     trigger: 'morning_brief',
 *     farmId: farm._id,
 *     farmExternalId: 'farm-1',
 *     userId: 'user-123',
 *   })
 *
 * NOTE: runGrazingAgent in grazingAgentDirect.ts is legacy/internal implementation.
 * It should only be called by this gateway, not directly.
 */

import { query, mutation, action } from './_generated/server'
import { v } from 'convex/values'
import { api } from './_generated/api'
import type { ActionCtx } from './_generated/server'
// Internal: Legacy agent implementation - only used by this gateway
import { runGrazingAgent } from './grazingAgentDirect'

/**
 * Get complete farm context for agent prompts.
 */
export const getFarmContext = query({
  args: {
    farmId: v.id('farms'),
  },
  handler: async (ctx, args) => {
    const farm = await ctx.db.get(args.farmId)
    if (!farm) {
      throw new Error(`Farm not found: ${args.farmId}`)
    }

    const [settings, paddocks, observations, farmerObservations, plans] =
      await Promise.all([
        ctx.db
          .query('farmSettings')
          .withIndex('by_farm', (q) => q.eq('farmExternalId', farm.externalId))
          .first(),
        ctx.db
          .query('paddocks')
          .withIndex('by_farm', (q) => q.eq('farmId', args.farmId))
          .collect(),
        ctx.db
          .query('observations')
          .withIndex('by_farm', (q) => q.eq('farmExternalId', farm.externalId))
          .collect(),
        ctx.db
          .query('farmerObservations')
          .withIndex('by_farm', (q) => q.eq('farmId', args.farmId))
          .order('desc')
          .take(5),
        ctx.db
          .query('plans')
          .withIndex('by_farm', (q) => q.eq('farmExternalId', farm.externalId))
          .order('desc')
          .take(5),
      ])

    return {
      farm,
      settings,
      paddocks,
      observations,
      farmerObservations,
      plans,
    }
  },
})

/**
 * Get recent plans for a farm.
 */
export const getRecentPlans = query({
  args: {
    farmExternalId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5
    const plans = await ctx.db
      .query('plans')
      .withIndex('by_farm', (q) => q.eq('farmExternalId', args.farmExternalId))
      .order('desc')
      .take(limit)
    return plans
  },
})

/**
 * PRIMARY ENTRY POINT: Agent Gateway Action
 * 
 * This is the public API for all agent operations.
 * All external code should call this, not runGrazingAgent directly.
 * 
 * For plan generation (morning_brief trigger), this gateway:
 * 1. Fetches farm context via getFarmContext query
 * 2. Gets plan generation data to determine active paddock
 * 3. Delegates to runGrazingAgent (internal/legacy implementation)
 * 4. Returns standardized result format
 * 
 * TODO: Add Braintrust logging for observability
 * TODO: Use trigger-specific prompts from lib/agent/triggers.ts
 * TODO: Migrate runGrazingAgent logic fully into gateway for better control
 */
export const agentGateway = action({
  args: {
    trigger: v.union(
      v.literal('morning_brief'),
      v.literal('observation_refresh'),
      v.literal('plan_execution')
    ),
    farmId: v.id('farms'),
    farmExternalId: v.string(),
    userId: v.string(),
    additionalContext: v.optional(v.any()),
  },
  handler: async (ctx: ActionCtx, args): Promise<{
    success: boolean
    trigger: 'morning_brief' | 'observation_refresh' | 'plan_execution'
    planId?: string
    error?: string
    message: string
  }> => {
    // Fetch farm context
    const context = await ctx.runQuery(api.grazingAgentGateway.getFarmContext, {
      farmId: args.farmId,
    })

    // For morning_brief trigger, generate a daily plan
    if (args.trigger === 'morning_brief') {
      // Get plan generation data to determine active paddock
      const today = new Date().toISOString().split('T')[0]
      const planData = await ctx.runQuery(api.intelligence.getPlanGenerationData as any, {
        farmExternalId: args.farmExternalId,
        date: today,
      }) as any

      if (planData.existingPlanId) {
        return {
          success: true,
          trigger: args.trigger,
          planId: planData.existingPlanId.toString(),
          message: 'Plan already exists for today',
        }
      }

      if (!planData.paddocks || planData.paddocks.length === 0) {
        return {
          success: false,
          trigger: args.trigger,
          error: 'No paddocks found for farm',
          message: 'Cannot generate plan: farm has no paddocks',
        }
      }

      const activePaddockId = planData.mostRecentGrazingEvent?.paddockExternalId || 
        (planData.paddocks && planData.paddocks.length > 0 ? planData.paddocks[0].externalId : null)

      const settings = planData.settings || {
        minNDVIThreshold: 0.40,
        minRestPeriod: 21,
      }

      console.log('[agentGateway] Calling runGrazingAgent with:', {
        farmExternalId: args.farmExternalId,
        farmName: context.farm?.name || args.farmExternalId,
        activePaddockId,
        settings,
        today,
      })

      // Call the grazing agent through the gateway
      const result = await runGrazingAgent(
        ctx,
        args.farmExternalId,
        context.farm?.name || args.farmExternalId,
        activePaddockId,
        settings
      )

      console.log('[agentGateway] runGrazingAgent result:', {
        success: result.success,
        planCreated: result.planCreated,
        planId: result.planId,
        error: result.error,
      })

      if (!result.success) {
        return {
          success: false,
          trigger: args.trigger,
          error: result.error || 'Agent execution failed',
          message: 'Failed to generate plan',
        }
      }

      if (!result.planCreated) {
        return {
          success: false,
          trigger: args.trigger,
          error: 'Agent did not create a plan',
          message: 'Plan generation completed but no plan was created',
        }
      }

      // Fetch the created plan
      const todayPlan = await ctx.runQuery(api.intelligence.getTodayPlan as any, { 
        farmExternalId: args.farmExternalId 
      }) as any

      return {
        success: true,
        trigger: args.trigger,
        planId: todayPlan?._id?.toString(),
        message: 'Plan generated successfully',
      }
    }

    // For other triggers, return context (to be implemented)
    return {
      success: true,
      trigger: args.trigger,
      message: `Trigger ${args.trigger} not yet fully implemented - returning context only`,
    }
  },
})
