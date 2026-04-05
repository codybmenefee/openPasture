#!/usr/bin/env node
/**
 * OpenPasture MCP Server
 *
 * Exposes OpenPasture tool primitives to external AI agents via the
 * Model Context Protocol. Agents can read farm state, record observations,
 * and manage grazing plans.
 *
 * Usage:
 *   CONVEX_URL=https://your-deployment.convex.cloud npx openpasture-mcp
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../app/convex/_generated/api.js'

const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL
if (!convexUrl) {
  console.error('Error: CONVEX_URL environment variable is required.')
  process.exit(1)
}

const convex = new ConvexHttpClient(convexUrl)

const server = new McpServer({
  name: 'openpasture',
  version: '0.1.0',
})

// --- Read Tools ---

server.tool(
  'list_paddocks',
  'List all paddocks with current state including NDVI, rest days, and grazing status',
  { farmExternalId: z.string().optional().describe('Farm external ID') },
  async ({ farmExternalId }) => {
    const paddocks = await convex.query(
      api.harness.tools.grazingAgentTools.getAllPaddocksWithObservations,
      { farmExternalId }
    )
    return { content: [{ type: 'text' as const, text: JSON.stringify(paddocks, null, 2) }] }
  }
)

server.tool(
  'get_paddock_state',
  'Get detailed state for the active paddock on a farm, including observations and grazing history',
  {
    farmExternalId: z.string().optional().describe('Farm external ID'),
  },
  async ({ farmExternalId }) => {
    const data = await convex.query(
      api.harness.tools.grazingAgentTools.getPaddockData,
      { farmExternalId }
    )
    return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }
  }
)

server.tool(
  'get_paddock_context',
  'Get paddock context formatted for agent decision-making',
  {
    farmExternalId: z.string().describe('Farm external ID'),
    paddockExternalId: z.string().describe('Paddock external ID'),
  },
  async ({ farmExternalId, paddockExternalId }) => {
    const context = await convex.query(
      api.harness.tools.grazingAgentTools.getPaddockContextForAgent,
      { farmExternalId, paddockExternalId }
    )
    return { content: [{ type: 'text' as const, text: JSON.stringify(context, null, 2) }] }
  }
)

server.tool(
  'get_farm_settings',
  'Get farm configuration including NDVI thresholds, rest periods, and livestock settings',
  { farmExternalId: z.string().optional().describe('Farm external ID') },
  async ({ farmExternalId }) => {
    const settings = await convex.query(
      api.harness.tools.grazingAgentTools.getFarmSettings,
      { farmExternalId }
    )
    return { content: [{ type: 'text' as const, text: JSON.stringify(settings, null, 2) }] }
  }
)

server.tool(
  'get_livestock',
  'Get livestock context including animal units, daily consumption, and section size recommendation',
  {
    farmExternalId: z.string().describe('Farm external ID'),
    paddockAreaHa: z.number().describe('Paddock area in hectares (for section size calculation)'),
  },
  async ({ farmExternalId, paddockAreaHa }) => {
    const livestock = await convex.query(
      api.harness.tools.grazingAgentTools.getLivestockContextForAgent,
      { farmExternalId, paddockAreaHa }
    )
    return { content: [{ type: 'text' as const, text: JSON.stringify(livestock, null, 2) }] }
  }
)

server.tool(
  'get_grazing_principles',
  'Get grazing principles and custom farm rules that guide rotation decisions',
  { farmExternalId: z.string().describe('Farm external ID') },
  async ({ farmExternalId }) => {
    const principles = await convex.query(
      api.harness.tools.grazingAgentTools.getGrazingPrinciples,
      { farmExternalId }
    )
    return { content: [{ type: 'text' as const, text: JSON.stringify(principles, null, 2) }] }
  }
)

server.tool(
  'get_todays_plan',
  'Get the grazing plan for today',
  { farmExternalId: z.string().optional().describe('Farm external ID') },
  async ({ farmExternalId }) => {
    const plan = await convex.query(
      api.workflows.intelligence.getTodayPlan,
      { farmExternalId }
    )
    return {
      content: [{
        type: 'text' as const,
        text: plan ? JSON.stringify(plan, null, 2) : 'No plan for today.',
      }],
    }
  }
)

server.tool(
  'get_plan_history',
  'Get recent grazing plans for the farm',
  {
    farmExternalId: z.string().optional().describe('Farm external ID'),
    limit: z.number().optional().describe('Number of plans to return'),
  },
  async ({ farmExternalId, limit }) => {
    const plans = await convex.query(
      api.workflows.intelligence.getPlanHistory,
      { farmExternalId, limit }
    )
    return { content: [{ type: 'text' as const, text: JSON.stringify(plans, null, 2) }] }
  }
)

// --- Write Tools ---

server.tool(
  'record_note',
  'Record a text observation about a paddock or the farm',
  {
    farmExternalId: z.string().describe('Farm external ID'),
    paddockExternalId: z.string().optional().describe('Paddock external ID (omit for farm-level)'),
    content: z.string().describe('Observation text'),
    author: z.string().optional().describe('Author identifier'),
    tags: z.array(z.string()).optional().describe('Tags for categorization'),
  },
  async ({ farmExternalId, paddockExternalId, content, author, tags }) => {
    const id = await convex.mutation(
      api.harness.tools.recordObservation.recordNote,
      { farmExternalId, paddockExternalId, content, author, tags }
    )
    return { content: [{ type: 'text' as const, text: `Observation recorded: ${id}` }] }
  }
)

server.tool(
  'generate_plan',
  'Generate a new daily grazing plan using the AI agent',
  {
    farmExternalId: z.string().optional().describe('Farm external ID'),
    userId: z.string().optional().describe('User ID'),
  },
  async ({ farmExternalId, userId }) => {
    const planId = await convex.action(
      api.workflows.intelligenceActions.generateDailyPlan,
      { farmExternalId, userId }
    )
    if (planId) {
      const plan = await convex.query(
        api.workflows.intelligence.getPlanById,
        { planId }
      )
      return { content: [{ type: 'text' as const, text: JSON.stringify(plan, null, 2) }] }
    }
    return { content: [{ type: 'text' as const, text: 'No plan generated.' }] }
  }
)

server.tool(
  'approve_plan',
  'Approve a pending grazing plan',
  {
    planId: z.string().describe('Plan ID to approve'),
    feedback: z.string().optional().describe('Optional feedback'),
  },
  async ({ planId, feedback }) => {
    await convex.mutation(
      api.workflows.intelligence.approvePlan,
      { planId: planId as any, feedback }
    )
    return { content: [{ type: 'text' as const, text: `Plan ${planId} approved.` }] }
  }
)

// --- Resources ---

server.resource(
  'farm-status',
  'openpasture://farm/status',
  async () => ({
    contents: [{
      uri: 'openpasture://farm/status',
      text: 'Use the list_paddocks and get_todays_plan tools to get current farm status.',
      mimeType: 'text/plain',
    }],
  })
)

// --- Start ---

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(console.error)
