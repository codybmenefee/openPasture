/**
 * Grazing Agent - Autonomous Section Drawing
 *
 * This agent draws grazing sections like a farmer would - using spatial reasoning
 * rather than algorithmic grid generation.
 *
 * Two modes:
 * 1. Forecast Mode: Agent draws all sections for a paddock rotation
 * 2. Daily Mode: Agent recommends today's section (from forecast or freshly drawn)
 *
 * NOTE: This file uses Braintrust which requires Node.js APIs.
 * It's imported by an action with "use node", so it runs in Node.js context.
 */

import { anthropic } from "@ai-sdk/anthropic"
import { generateText, tool } from "ai"
import { api } from "./_generated/api"
import type { ActionCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { z } from "zod"
import { sanitizeForBraintrust } from "../lib/braintrustSanitize"
import { logLLMCall, logToolCall } from "../lib/braintrust"
import { createLogger } from "./lib/logger"
import {
  generatePaddockVisualization,
  type GrazedSection,
} from "./lib/paddockVisualization"
import {
  generateGrazingPrinciplesPrompt,
  type GrazingPrinciples,
} from "./lib/grazingPrinciples"
import type { Feature, Polygon } from "geojson"

const log = createLogger('grazingAgent')

type OTelTracer = any

const GRAZING_AGENT_MODEL = "claude-haiku-4-5"
const PROMPT_VERSION = "v6.0.0-autonomous-drawing"

/**
 * System prompt for the autonomous section-drawing agent
 */
const GRAZING_AGENT_SYSTEM_PROMPT = `You are a grazing management assistant that draws grazing sections like an experienced farmer would.

## YOUR ROLE

Draw practical grazing sections that a farmer could implement with temporary electric fencing. Think spatially - imagine you're standing in the paddock deciding where to put fence posts.

## SECTION DRAWING PRINCIPLES

### Shape Principles

**Comfortable Movement**: Animals need room to spread out while grazing.
- Good: Roughly square, wide rectangle, natural paddock-hugging shapes
- Bad: Skinny lanes, long narrow strips, L-shapes with tight corners

**Practical Fencing**: Imagine setting up temporary electric fencing.
- Prefer rectangular or trapezoidal shapes
- 4-6 corner posts are typical
- Curves are fine when following paddock boundary
- Avoid complex geometry (keep to 8 vertices or fewer)

### Progression Principles

**Start in a Corner**: Begin in the specified starting corner. This gives animals a defined space with two natural boundaries.

**Work Outward Systematically**: Progress through the paddock logically.
- Each new section should share an edge with previously grazed area OR paddock boundary
- Don't leave ungrazed "islands" surrounded by grazed sections
- Don't jump to disconnected areas

**Edge Awareness**: When a section is near the paddock boundary, extend it all the way to that boundary. Don't leave thin ungrazed strips along edges.

### Size Principles

**Target Size**: Aim for the target section size provided, but prioritize good shape over exact size. +/-30% from target is acceptable.

**Intentional Variation**: Sections don't need to be identical. A triangular corner of the paddock might need a triangular section.

## TOOLS

### drawSection
Draw a section by providing polygon coordinates directly or using the rectangle helper.

**Direct coordinates**: Provide [[lng, lat], [lng, lat], ...] array
- At least 3 points required
- Will be automatically closed
- Will be clipped to paddock boundary if needed

**Rectangle helper**: Specify corner, widthPct, heightPct
- Easier for simple rectangular sections
- Automatically clipped to paddock

### getUngrazedRemaining
Get the remaining ungrazed area. Use to:
- Understand what's left to graze
- Get geometry for the final "wrap-up" section

### createDailyPlan
Submit today's grazing recommendation.

## COORDINATE SYSTEM

Coordinates are [longitude, latitude] pairs (GeoJSON format).
- Longitude increases going EAST (positive = east)
- Latitude increases going NORTH (positive = north)

The paddock corners are labeled:
- NW: top-left (min longitude, max latitude)
- NE: top-right (max longitude, max latitude)
- SW: bottom-left (min longitude, min latitude)
- SE: bottom-right (max longitude, min latitude)

## CRITICAL RULES

1. When in forecast mode, draw ALL sections to cover the paddock
2. When in daily mode, ALWAYS call createDailyPlan with your recommendation
3. Sections must be inside the paddock boundary
4. Sections must connect to paddock boundary or previous sections
5. Keep total overlap with grazed areas under 20%`

interface PlanGenerationResult {
  success: boolean
  dailyPlanId?: Id<"dailyPlans">
  briefId?: Id<"dailyBriefs">
  planId?: Id<"plans">
  planCreated?: boolean
  error?: string
  decision?: 'MOVE' | 'STAY'
  recommendedSectionIndex?: number
}

interface ForecastGenerationResult {
  success: boolean
  forecastId?: Id<"paddockForecasts">
  sectionsDrawn?: number
  error?: string
}

/**
 * Main entry point: Run the grazing agent for daily planning
 */
export async function runGrazingAgent(
  ctx: ActionCtx,
  farmExternalId: string,
  farmName: string,
  activePaddockId: string | null,
  settings: { minNDVIThreshold: number; minRestPeriod: number },
  logger?: any,
  wrappedAnthropic?: any,
  tracer?: OTelTracer
): Promise<PlanGenerationResult> {
  const anthropicClient = wrappedAnthropic || anthropic

  if (!logger) {
    return await runDailyPlanningAgent(ctx, farmExternalId, farmName, activePaddockId, settings, anthropicClient, tracer)
  }

  return await logger.traced(async (rootSpan: any) => {
    rootSpan.log({
      input: sanitizeForBraintrust({
        farmExternalId,
        farmName,
        activePaddockId,
        settings,
      }),
      metadata: sanitizeForBraintrust({
        trigger: 'daily_planning',
        promptVersion: PROMPT_VERSION,
      }),
    })

    const result = await runDailyPlanningAgent(ctx, farmExternalId, farmName, activePaddockId, settings, anthropicClient, tracer)

    rootSpan.log({
      output: sanitizeForBraintrust({
        success: result.success,
        decision: result.decision,
        recommendedSectionIndex: result.recommendedSectionIndex,
        dailyPlanId: result.dailyPlanId ? String(result.dailyPlanId) : undefined,
      }),
    })

    return result
  }, { name: 'Grazing Agent - Daily', metadata: { farmExternalId, farmName, activePaddockId } })
}

/**
 * Run the daily planning agent
 */
async function runDailyPlanningAgent(
  ctx: ActionCtx,
  farmExternalId: string,
  farmName: string,
  activePaddockId: string | null,
  settings: { minNDVIThreshold: number; minRestPeriod: number },
  anthropicClient: any,
  tracer?: OTelTracer
): Promise<PlanGenerationResult> {
  log('START - Daily Planning Agent', {
    farmExternalId,
    farmName,
    activePaddockId,
    settings,
  })

  const today = new Date().toISOString().split('T')[0]

  // 1. IDENTIFY TARGET PADDOCK
  let targetPaddockId = activePaddockId

  if (!targetPaddockId) {
    const allPaddocks = await ctx.runQuery(api.grazingAgentTools.getAllPaddocksWithObservations, { farmExternalId })

    if (allPaddocks && allPaddocks.length > 0) {
      const suitable = allPaddocks.filter((p: any) => p.ndviMean >= settings.minNDVIThreshold)
      targetPaddockId = suitable.length > 0 ? suitable[0].externalId : allPaddocks[0].externalId

      log('Selected paddock (no active)', { targetPaddockId })
    } else {
      return { success: false, error: 'No paddocks found for farm' }
    }
  }

  // 2. GET OR CREATE FORECAST (empty if new)
  const forecast = await ctx.runMutation(api.grazingAgentTools.getOrCreateForecast, {
    farmExternalId,
    paddockExternalId: targetPaddockId,
  })

  if (!forecast) {
    return { success: false, error: 'Failed to get or create paddock forecast' }
  }

  // 3. IF FORECAST IS EMPTY, GENERATE SECTIONS FIRST
  if (forecast.forecastedSections.length === 0) {
    log('Forecast is empty - generating sections', { forecastId: forecast._id.toString() })

    const forecastResult = await generateForecastSections(
      ctx,
      farmExternalId,
      targetPaddockId,
      forecast._id,
      anthropicClient,
      tracer
    )

    if (!forecastResult.success) {
      return { success: false, error: forecastResult.error || 'Failed to generate forecast sections' }
    }

    // Refresh forecast after generation
    const updatedForecast = await ctx.runQuery(api.grazingAgentTools.getActiveForecast, {
      farmExternalId,
      paddockExternalId: targetPaddockId,
    })

    if (!updatedForecast || updatedForecast.forecastedSections.length === 0) {
      return { success: false, error: 'Forecast generation completed but no sections found' }
    }
  }

  // 4. GET GRAZING PRINCIPLES
  const principles = await ctx.runQuery(api.grazingAgentTools.getGrazingPrinciples, {
    farmExternalId,
  }) as GrazingPrinciples & { customRules: string[] }

  // 5. EVALUATE FORECAST CONTEXT
  const forecastContext = await ctx.runQuery(api.grazingAgentTools.evaluateForecastContext, {
    farmExternalId,
    paddockExternalId: targetPaddockId,
  })

  log('Forecast context', {
    hasActiveForecast: forecastContext.hasActiveForecast,
    activeSectionIndex: forecastContext.activeSectionIndex,
    daysInActiveSection: forecastContext.daysInActiveSection,
    estimatedForageRemainingPct: forecastContext.estimatedForageRemainingPct,
  })

  // 6. GET PADDOCK DATA FOR VISUALIZATION
  const allPaddocks = await ctx.runQuery(api.grazingAgentTools.getAllPaddocksWithObservations, { farmExternalId })
  const targetPaddock = allPaddocks?.find((p: any) => p.externalId === targetPaddockId)

  if (!targetPaddock) {
    return { success: false, error: `Paddock not found: ${targetPaddockId}` }
  }

  // Re-fetch forecast for visualization
  const currentForecast = await ctx.runQuery(api.grazingAgentTools.getActiveForecast, {
    farmExternalId,
    paddockExternalId: targetPaddockId,
  })

  if (!currentForecast) {
    return { success: false, error: 'Forecast not found after generation' }
  }

  // 7. GENERATE PADDOCK VISUALIZATION
  let paddockVisualizationPng: string | undefined

  if (targetPaddock.geometry) {
    try {
      const paddockGeometryFeature = targetPaddock.geometry as Feature<Polygon>

      // Build grazed sections from forecast history
      const grazedSections: GrazedSection[] = currentForecast.grazingHistory.map((h: any, index: number) => ({
        geometry: h.geometry as Polygon,
        dayNumber: index + 1,
        date: h.startedDate || h.endedDate || today,
      }))

      // Add current active section if exists
      if (currentForecast.forecastedSections[currentForecast.activeSectionIndex]) {
        const activeSection = currentForecast.forecastedSections[currentForecast.activeSectionIndex]
        grazedSections.push({
          geometry: activeSection.geometry as Polygon,
          dayNumber: grazedSections.length + 1,
          date: today,
        })
      }

      // Fetch NDVI grid
      let ndviGridValues: number[][] | undefined
      try {
        const ndviGrid = await ctx.runAction(api.ndviGrid.generateNDVIGrid, {
          farmExternalId,
          paddockExternalId: targetPaddockId,
        })
        if (ndviGrid.hasData) {
          ndviGridValues = ndviGrid.gridValues
        }
      } catch (e: any) {
        log.warn('NDVI grid fetch failed', { error: e.message })
      }

      const visualization = await generatePaddockVisualization(
        paddockGeometryFeature,
        grazedSections,
        ndviGridValues,
        {
          width: 512,
          height: 512,
          showNdviColors: !!ndviGridValues,
          showDayLabels: true,
          showCoordinateLabels: true,
          showScaleBar: true,
          showNorthArrow: true,
        }
      )

      paddockVisualizationPng = visualization.pngBase64
    } catch (vizError: any) {
      log.error('Visualization generation failed', { error: vizError.message })
    }
  }

  // 8. BUILD AGENT PROMPT
  const principlesPrompt = generateGrazingPrinciplesPrompt(principles, principles.customRules)

  const activeSection = currentForecast.forecastedSections[currentForecast.activeSectionIndex]

  const forecastSectionsSummary = currentForecast.forecastedSections.map((s: any) => {
    const status = s.index < currentForecast.activeSectionIndex ? 'COMPLETED'
      : s.index === currentForecast.activeSectionIndex ? 'ACTIVE'
      : 'UPCOMING'
    return `  Section ${s.index}: ${s.areaHa.toFixed(1)} ha, ${s.quadrant} quadrant [${status}]`
  }).join('\n')

  const textPrompt = `Create today's grazing plan for farm "${farmName}".

${principlesPrompt}

## PADDOCK: ${targetPaddock.name} (ID: ${targetPaddockId})
- Total Area: ${targetPaddock.area} ha
- Overall NDVI: ${targetPaddock.ndviMean}

## ROTATION FORECAST
This paddock has ${currentForecast.forecastedSections.length} sections drawn:
${forecastSectionsSummary}

Progress: ${currentForecast.grazingHistory.length} sections completed

## CURRENT SECTION STATUS
${activeSection ? `
- Section Index: ${currentForecast.activeSectionIndex}
- Days in section: ${currentForecast.daysInActiveSection}
- Section area: ${activeSection.areaHa} ha
- Quadrant: ${activeSection.quadrant}
- Estimated forage remaining: ${forecastContext.estimatedForageRemainingPct ?? 'unknown'}%
- Current NDVI: ${forecastContext.currentNdvi?.toFixed(2) ?? 'unknown'}
` : 'No active section - starting fresh rotation'}

## TIMING RULES
- Minimum days per section: ${forecastContext.minDaysPerSection}
- Maximum days per section: ${forecastContext.maxDaysPerSection}

## HINTS FROM SYSTEM
${forecastContext.reasoning?.join('\n- ') || 'No specific hints'}

${paddockVisualizationPng ? `
## PADDOCK MAP
The image shows:
- Green boundary = paddock edge
- Hatched areas = grazed sections (numbered by day)
- Colored areas = NDVI (green=high, yellow=medium, red=low)
` : ''}

## YOUR TASK

Decide whether livestock should STAY in the current section or MOVE to the next section.

Then call createDailyPlan with:
- action: 'STAY' or 'MOVE'
- sectionIndex: Which section (current for STAY, next for MOVE)
- reasoning: Array of reasons for your decision
- confidence: 'high', 'medium', or 'low'

Current section index: ${currentForecast.activeSectionIndex}
Next section index: ${Math.min(currentForecast.activeSectionIndex + 1, currentForecast.forecastedSections.length - 1)}`

  // Build messages
  type MessageContent = { type: 'image'; image: string; mimeType: 'image/png' } | { type: 'text'; text: string }
  const messageContent: MessageContent[] = []

  if (paddockVisualizationPng) {
    messageContent.push({
      type: 'image',
      image: paddockVisualizationPng,
      mimeType: 'image/png',
    })
  }

  messageContent.push({
    type: 'text',
    text: textPrompt,
  })

  // 9. RUN AGENT
  const result = await generateText({
    model: anthropicClient(GRAZING_AGENT_MODEL) as any,
    system: GRAZING_AGENT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: messageContent }],
    tools: {
      createDailyPlan: tool({
        description: "Submit today's grazing plan recommendation",
        inputSchema: z.object({
          action: z.enum(['STAY', 'MOVE']).describe("STAY in current section or MOVE to next"),
          sectionIndex: z.number().describe("Section index to graze today"),
          reasoning: z.array(z.string()).describe("Reasons for your decision"),
          confidence: z.enum(['high', 'medium', 'low']).describe("Confidence level"),
        }),
      }),
      getUngrazedRemaining: tool({
        description: "Get remaining ungrazed area info",
        inputSchema: z.object({}),
      }),
    },
    ...(tracer && {
      experimental_telemetry: {
        isEnabled: true,
        tracer,
        functionId: "runDailyPlanningAgent",
        recordInputs: true,
        recordOutputs: true,
        metadata: {
          farmExternalId,
          farmName,
          promptVersion: PROMPT_VERSION,
          model: GRAZING_AGENT_MODEL,
        },
      },
    }),
  })

  const toolCalls = (result as any).toolCalls || []
  const usage = (result as any).usage || (result as any).experimental_providerMetadata?.anthropic?.usage

  log('LLM response', {
    textLength: result.text?.length,
    toolCallsCount: toolCalls.length,
    toolNames: toolCalls.map((tc: any) => tc.toolName),
  })

  // Log LLM call
  const llmSpanId = logLLMCall({
    model: GRAZING_AGENT_MODEL,
    prompt: textPrompt,
    systemPrompt: GRAZING_AGENT_SYSTEM_PROMPT,
    response: result.text || '',
    toolCalls,
    usage: usage ? {
      promptTokens: usage.promptTokens || usage.input_tokens,
      completionTokens: usage.completionTokens || usage.output_tokens,
      totalTokens: usage.totalTokens || (usage.input_tokens + usage.output_tokens),
    } : undefined,
    metadata: { farmExternalId, farmName, promptVersion: PROMPT_VERSION },
  })

  // 10. PROCESS TOOL CALLS
  let planCreated = false
  let createdDailyPlanId: Id<'dailyPlans'> | undefined
  let createdBriefId: Id<'dailyBriefs'> | undefined
  let finalDecision: 'MOVE' | 'STAY' | undefined
  let recommendedSectionIndex: number | undefined

  for (const toolCall of toolCalls) {
    const args = (toolCall as any).args ?? (toolCall as any).input ?? {}
    const toolStartTime = Date.now()

    if (toolCall.toolName === 'getUngrazedRemaining') {
      try {
        const ungrazedResult = await ctx.runQuery(api.grazingAgentTools.getUngrazedRemaining, {
          forecastId: currentForecast._id,
        })

        logToolCall({
          parentSpanId: llmSpanId,
          toolName: toolCall.toolName,
          input: args,
          output: { areaHa: ungrazedResult.areaHa, percentOfPaddock: ungrazedResult.percentOfPaddock },
          durationMs: Date.now() - toolStartTime,
        })
      } catch (toolError: any) {
        logToolCall({
          parentSpanId: llmSpanId,
          toolName: toolCall.toolName,
          input: args,
          error: toolError.message,
          durationMs: Date.now() - toolStartTime,
        })
      }
    }

    if (toolCall.toolName === 'createDailyPlan') {
      try {
        finalDecision = args.action as 'MOVE' | 'STAY'
        recommendedSectionIndex = args.sectionIndex

        const section = currentForecast.forecastedSections[args.sectionIndex]
        if (!section) {
          throw new Error(`Invalid section index: ${args.sectionIndex}`)
        }

        const confidenceMap: Record<string, number> = { high: 85, medium: 70, low: 50 }
        const confidenceNum = confidenceMap[args.confidence] ?? 70

        // Create daily plan
        const dailyPlanId = await ctx.runMutation(api.grazingAgentTools.createDailyPlan, {
          farmExternalId,
          date: today,
          forecastId: currentForecast._id,
          paddockExternalId: targetPaddockId,
          recommendedSectionIndex: args.sectionIndex,
          sectionGeometry: section.geometry,
          sectionAreaHa: section.areaHa,
          sectionCentroid: section.centroid,
          daysInSection: args.sectionIndex === currentForecast.activeSectionIndex
            ? currentForecast.daysInActiveSection
            : 1,
          estimatedForageRemaining: forecastContext.estimatedForageRemainingPct,
          currentNdvi: forecastContext.currentNdvi,
          reasoning: args.reasoning || [],
          confidence: confidenceNum,
        })

        createdDailyPlanId = dailyPlanId
        planCreated = true

        // Create legacy daily brief
        createdBriefId = await ctx.runMutation(api.grazingAgentTools.createDailyBrief, {
          farmExternalId,
          date: today,
          decision: finalDecision,
          paddockExternalId: targetPaddockId,
          sectionGeometry: section.geometry,
          sectionAreaHa: section.areaHa,
          sectionCentroid: section.centroid,
          daysInCurrentSection: args.sectionIndex === currentForecast.activeSectionIndex
            ? currentForecast.daysInActiveSection
            : 1,
          estimatedForageRemaining: forecastContext.estimatedForageRemainingPct,
          currentNdvi: forecastContext.currentNdvi,
          reasoning: args.reasoning || [],
          confidence: confidenceNum,
          forecastId: currentForecast._id,
        })

        // Create legacy plan
        await createLegacyPlan(ctx, {
          farmExternalId,
          paddockExternalId: targetPaddockId,
          decision: finalDecision,
          reasoning: args.reasoning || [],
          confidence: confidenceNum / 100,
          sectionGeometry: section.geometry,
          sectionAreaHa: section.areaHa,
          sectionCentroid: section.centroid,
          grazedPercentage: Math.round((currentForecast.grazingHistory.length / currentForecast.forecastedSections.length) * 100),
        })

        logToolCall({
          parentSpanId: llmSpanId,
          toolName: toolCall.toolName,
          input: args,
          output: { dailyPlanId: dailyPlanId.toString(), decision: finalDecision },
          durationMs: Date.now() - toolStartTime,
        })

        log('Daily plan created', {
          dailyPlanId: dailyPlanId.toString(),
          decision: finalDecision,
          sectionIndex: args.sectionIndex,
        })
      } catch (toolError: any) {
        logToolCall({
          parentSpanId: llmSpanId,
          toolName: toolCall.toolName,
          input: args,
          error: toolError.message,
          durationMs: Date.now() - toolStartTime,
        })
        throw toolError
      }
    }
  }

  // Fallback if agent didn't create plan
  if (!planCreated) {
    log.warn('Agent did not create plan - using system recommendation')

    const sectionIndex = currentForecast.activeSectionIndex
    recommendedSectionIndex = sectionIndex
    finalDecision = 'STAY'

    const section = currentForecast.forecastedSections[sectionIndex]
    if (!section) {
      return { success: false, error: `Invalid section index: ${sectionIndex}` }
    }

    const dailyPlanId = await ctx.runMutation(api.grazingAgentTools.createDailyPlan, {
      farmExternalId,
      date: today,
      forecastId: currentForecast._id,
      paddockExternalId: targetPaddockId,
      recommendedSectionIndex: sectionIndex,
      sectionGeometry: section.geometry,
      sectionAreaHa: section.areaHa,
      sectionCentroid: section.centroid,
      daysInSection: currentForecast.daysInActiveSection,
      estimatedForageRemaining: forecastContext.estimatedForageRemainingPct,
      currentNdvi: forecastContext.currentNdvi,
      reasoning: ['System fallback - agent did not provide recommendation'],
      confidence: 50,
    })

    createdDailyPlanId = dailyPlanId
    planCreated = true
  }

  log('END - Daily Planning Agent', {
    success: true,
    decision: finalDecision,
    recommendedSectionIndex,
  })

  return {
    success: true,
    decision: finalDecision,
    recommendedSectionIndex,
    dailyPlanId: createdDailyPlanId,
    briefId: createdBriefId,
    planCreated,
  }
}

/**
 * Generate forecast sections - agent draws all sections for the paddock
 */
async function generateForecastSections(
  ctx: ActionCtx,
  farmExternalId: string,
  paddockExternalId: string,
  forecastId: Id<"paddockForecasts">,
  anthropicClient: any,
  tracer?: OTelTracer
): Promise<ForecastGenerationResult> {
  log('START - Forecast Section Generation', { farmExternalId, paddockExternalId, forecastId })

  // Get paddock context
  const paddockContext = await ctx.runQuery(api.grazingAgentTools.getPaddockContextForAgent, {
    farmExternalId,
    paddockExternalId,
  })

  // Get forecast details
  const forecast = await ctx.runQuery(api.grazingAgentTools.getActiveForecast, {
    farmExternalId,
    paddockExternalId,
  })

  if (!forecast) {
    return { success: false, error: 'Forecast not found' }
  }

  // Get principles
  const principles = await ctx.runQuery(api.grazingAgentTools.getGrazingPrinciples, {
    farmExternalId,
  }) as GrazingPrinciples & { customRules: string[] }

  const principlesPrompt = generateGrazingPrinciplesPrompt(principles, principles.customRules)

  // Build prompt for forecast generation
  const forecastPrompt = `Draw grazing sections for this paddock rotation.

${principlesPrompt}

## PADDOCK GEOMETRY

Boundary coordinates (closed polygon):
${JSON.stringify(paddockContext.boundary.slice(0, 10), null, 2)}${paddockContext.boundary.length > 10 ? '\n... (truncated)' : ''}

Corners:
- NW (top-left): [${paddockContext.corners.NW[0].toFixed(6)}, ${paddockContext.corners.NW[1].toFixed(6)}]
- NE (top-right): [${paddockContext.corners.NE[0].toFixed(6)}, ${paddockContext.corners.NE[1].toFixed(6)}]
- SW (bottom-left): [${paddockContext.corners.SW[0].toFixed(6)}, ${paddockContext.corners.SW[1].toFixed(6)}]
- SE (bottom-right): [${paddockContext.corners.SE[0].toFixed(6)}, ${paddockContext.corners.SE[1].toFixed(6)}]

Bounds:
- Longitude: ${paddockContext.bounds.minLng.toFixed(6)} to ${paddockContext.bounds.maxLng.toFixed(6)}
- Latitude: ${paddockContext.bounds.minLat.toFixed(6)} to ${paddockContext.bounds.maxLat.toFixed(6)}

Total Area: ${paddockContext.totalAreaHa} ha
Aspect Ratio: ${paddockContext.aspectRatio} (width/height)

## TARGET SECTION SIZE

- Target: ${forecast.targetSectionHa} ha (${forecast.targetSectionPct}% of paddock)
- Estimated sections needed: ${Math.ceil(paddockContext.totalAreaHa / forecast.targetSectionHa)}

## STARTING CORNER

Start in the ${forecast.startingCorner} corner and work ${forecast.progressionDirection === 'horizontal' ? 'in rows (east-west)' : 'in columns (north-south)'}.

## YOUR TASK

Draw ${Math.ceil(paddockContext.totalAreaHa / forecast.targetSectionHa)}-${Math.ceil(paddockContext.totalAreaHa / forecast.targetSectionHa) + 2} sections to cover the entire paddock.

For each section, call drawSection with EITHER:
1. rectangle: { corner, widthPct, heightPct } for simple rectangles
2. coordinates: [[lng, lat], ...] for custom shapes

Start from the ${forecast.startingCorner} corner and progress systematically.

IMPORTANT:
- Draw sections one at a time
- Each section should connect to previous sections or paddock boundary
- Cover the entire paddock with minimal gaps
- Final section can use remaining area`

  // Track sections drawn across all tool calls
  let sectionsDrawn = 0

  // Define schemas for type inference
  const drawSectionSchema = z.object({
    coordinates: z.array(z.array(z.number())).optional().describe("Polygon coordinates [[lng, lat], ...]"),
    rectangle: z.object({
      corner: z.enum(['NW', 'NE', 'SW', 'SE']).describe("Corner to anchor the rectangle"),
      widthPct: z.number().min(5).max(100).describe("Width as percentage of paddock"),
      heightPct: z.number().min(5).max(100).describe("Height as percentage of paddock"),
    }).optional().describe("Rectangle helper for simple shapes"),
    reasoning: z.string().describe("Why this section shape and placement"),
  })

  const emptySchema = z.object({})

  // Run agent to draw sections
  // Tools have execute handlers so maxSteps loop works correctly
  await generateText({
    model: anthropicClient(GRAZING_AGENT_MODEL) as any,
    system: GRAZING_AGENT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: forecastPrompt }],
    maxSteps: 15, // Allow multiple tool calls
    tools: {
      drawSection: tool({
        description: "Draw a grazing section. Use rectangle helper for simple shapes or provide coordinates directly.",
        inputSchema: drawSectionSchema,
        execute: async (args) => {
          try {
            const drawResult = await ctx.runMutation(api.grazingAgentTools.drawSection, {
              forecastId,
              coordinates: args.coordinates,
              rectangle: args.rectangle,
              reasoning: args.reasoning || 'Agent-drawn section',
            })

            if (drawResult.success) {
              sectionsDrawn++
              log('Section drawn', {
                sectionIndex: drawResult.sectionIndex,
                areaHa: drawResult.areaHa,
                warnings: drawResult.warnings,
              })
              return {
                success: true,
                sectionIndex: drawResult.sectionIndex,
                areaHa: drawResult.areaHa,
                message: `Section ${drawResult.sectionIndex} created (${drawResult.areaHa?.toFixed(2)} ha)`,
              }
            } else {
              log.warn('Section draw failed', { errors: drawResult.errors })
              return {
                success: false,
                errors: drawResult.errors,
                message: 'Section validation failed - try different coordinates',
              }
            }
          } catch (drawError: any) {
            log.error('drawSection error', { error: drawError.message })
            return {
              success: false,
              error: drawError.message,
              message: `Error: ${drawError.message}`,
            }
          }
        },
      }),
      getUngrazedRemaining: tool({
        description: "Get remaining ungrazed area to help plan final sections",
        inputSchema: emptySchema,
        execute: async () => {
          try {
            const remaining = await ctx.runQuery(api.grazingAgentTools.getUngrazedRemaining, {
              forecastId,
            })
            log('Ungrazed remaining', {
              areaHa: remaining.areaHa,
              percentOfPaddock: remaining.percentOfPaddock,
              approximateLocation: remaining.approximateLocation,
            })
            return {
              areaHa: remaining.areaHa,
              percentOfPaddock: remaining.percentOfPaddock,
              approximateLocation: remaining.approximateLocation,
              geometry: remaining.geometry,
              message: `${remaining.areaHa?.toFixed(2)} ha remaining (${remaining.percentOfPaddock?.toFixed(0)}% of paddock) in ${remaining.approximateLocation}`,
            }
          } catch (e: any) {
            log.error('getUngrazedRemaining error', { error: e.message })
            return {
              error: e.message,
              message: `Error getting ungrazed area: ${e.message}`,
            }
          }
        },
      }),
    },
    ...(tracer && {
      experimental_telemetry: {
        isEnabled: true,
        tracer,
        functionId: "generateForecastSections",
        recordInputs: true,
        recordOutputs: true,
        metadata: {
          farmExternalId,
          paddockExternalId,
          promptVersion: PROMPT_VERSION,
        },
      },
    }),
  })

  log('END - Forecast Section Generation', { sectionsDrawn })

  return {
    success: sectionsDrawn > 0,
    forecastId,
    sectionsDrawn,
  }
}

/**
 * Create legacy plan for backward compatibility
 */
async function createLegacyPlan(
  ctx: ActionCtx,
  params: {
    farmExternalId: string
    paddockExternalId: string
    decision: 'MOVE' | 'STAY'
    reasoning: string[]
    confidence: number
    sectionGeometry: any
    sectionAreaHa?: number
    sectionCentroid?: number[]
    grazedPercentage: number
  }
) {
  const {
    farmExternalId,
    paddockExternalId,
    decision,
    reasoning,
    confidence,
    sectionGeometry,
    sectionAreaHa,
    sectionCentroid,
    grazedPercentage,
  } = params

  const decisionPrefix = decision === 'MOVE'
    ? 'MOVE to new section: '
    : 'STAY in current section: '
  const justification = decisionPrefix + (reasoning[0] || 'Based on grazing forecast')

  await ctx.runMutation(api.grazingAgentTools.createPlanWithSection, {
    farmExternalId,
    targetPaddockId: paddockExternalId,
    sectionGeometry,
    sectionAreaHectares: sectionAreaHa,
    sectionCentroid,
    sectionJustification: justification,
    paddockGrazedPercentage: grazedPercentage,
    confidence: Math.round(confidence * 100),
    reasoning: [`Decision: ${decision}`, ...reasoning],
    skipOverlapValidation: true,
  })

  await ctx.runMutation(api.grazingAgentTools.finalizePlan, {
    farmExternalId,
  })
}
