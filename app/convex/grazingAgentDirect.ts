import { anthropic } from "@ai-sdk/anthropic"
import { generateText, tool } from "ai"
import { api } from "./_generated/api"
import type { ActionCtx } from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { z } from "zod"

const GRAZING_AGENT_MODEL = "claude-haiku-4-5"

const GRAZING_SYSTEM_PROMPT = `You are a grazing intelligence specialist. Your role is to recommend daily grazing sections based on satellite-derived vegetation data.

## YOUR TASK
Analyze the provided data and create a grazing plan by calling the tools.

## CRITICAL
You MUST call createPlanWithSection AND finalizePlan tools. The tools are your output mechanism - not text.

## RULES
- Never suggest sections that overlap with previously grazed areas
- Always output valid GeoJSON for section geometry
- Calculate section centroid as [lng, lat]`

interface PlanGenerationResult {
  success: boolean
  planId?: Id<"plans">
  error?: string
  planCreated?: boolean
}

export async function runGrazingAgent(
  ctx: ActionCtx,
  farmExternalId: string,
  farmName: string,
  activePaddockId: string | null,
  settings: { minNDVIThreshold: number; minRestPeriod: number }
): Promise<PlanGenerationResult> {
  // Fetch all data upfront in parallel
  const [allPaddocks, currentPaddock, previousSections, grazedPercentage] = await Promise.all([
    ctx.runQuery(api.grazingAgentTools.getAllPaddocksWithObservations, { farmExternalId }),
    ctx.runQuery(api.grazingAgentTools.getPaddockData, { farmExternalId }),
    ctx.runQuery(api.grazingAgentTools.getPreviousSections, { farmExternalId, paddockId: activePaddockId ?? undefined }),
    ctx.runQuery(api.grazingAgentTools.calculatePaddockGrazedPercentage, { farmExternalId, paddockId: activePaddockId || 'p1' }),
  ])

  console.log("All paddocks:", allPaddocks?.length)
  console.log("Current paddock:", currentPaddock?.externalId, "NDVI:", currentPaddock?.ndviMean)
  console.log("Previous sections:", previousSections?.length)

  const currentNdvi = currentPaddock?.ndviMean ?? 0
  const threshold = settings.minNDVIThreshold

  let targetPaddock: any = currentPaddock
  let recommendation = "graze"
  
  if (currentNdvi < threshold) {
    const alternatives = allPaddocks?.filter((p: any) => p.ndviMean >= threshold) ?? []
    if (alternatives.length > 0) {
      alternatives.sort((a: any, b: any) => {
        if (b.ndviMean !== a.ndviMean) return b.ndviMean - a.ndviMean
        return b.restDays - a.restDays
      })
      targetPaddock = alternatives[0]
      recommendation = "move"
      console.log("Moving to alternative:", targetPaddock?.externalId, "NDVI:", targetPaddock?.ndviMean)
    } else {
      recommendation = "rest"
      console.log("No alternatives found, recommending rest")
    }
  }

  const prompt = `Generate today's grazing plan for farm "${farmName}".

## All Paddocks (sorted by NDVI):
${JSON.stringify(allPaddocks, null, 2)}

## Current Paddock (${currentPaddock?.externalId}):
- Name: ${currentPaddock?.name}
- NDVI: ${currentNdvi} (threshold: ${threshold})
- Area: ${currentPaddock?.area} hectares
- Rest days: ${currentPaddock?.restDays}
- Grazed: ${grazedPercentage}%

## Target Paddock for Plan:
${recommendation === 'graze' 
  ? `Graze in ${targetPaddock?.externalId} (${targetPaddock?.name}) - NDVI ${targetPaddock?.ndviMean} meets threshold`
  : recommendation === 'move'
  ? `MOVE HERD to ${targetPaddock?.externalId} (${targetPaddock?.name}) - NDVI ${targetPaddock?.ndviMean} is the best available`
  : `REST - No paddocks meet the ${threshold} NDVI threshold`
}

## Previous Sections in Target Paddock:
${previousSections?.length === 0 ? "paddock is fresh" : JSON.stringify(previousSections)}

## Farm Settings:
- NDVI threshold: ${threshold}
- Rest period: ${settings.minRestPeriod} days
- Section size: 20%

## Your Task:
Create a grazing plan by calling createPlanWithSection then finalizePlan.

${recommendation === 'rest' ? `
Since no paddocks meet the NDVI threshold, recommend rest:
- targetPaddockId: ${targetPaddock?.externalId}
- confidence: 0.3
- reasoning: ["All paddocks below NDVI threshold", "Vegetation needs more recovery time"]
- sectionGeometry: null (no grazing section)
- sectionJustification: "All paddocks on the farm have NDVI below the ${threshold} threshold. The vegetation has not recovered sufficiently for grazing. Recommend continuing rest until satellite data shows improvement."
` : `
Create an optimal ~20% section in ${targetPaddock?.externalId}:
- targetPaddockId: ${targetPaddock?.externalId}
- confidence: ${recommendation === 'move' ? '0.55' : '0.75'}
- reasoning: Array with 2-3 technical factors
- sectionGeometry: Create a valid GeoJSON polygon (20% of paddock area = ${Math.round((targetPaddock?.area ?? 0) * 0.2 * 10) / 10} hectares)
- sectionJustification: 3-5 sentences explaining the section choice, NDVI range, and what to avoid
- sectionAreaHectares: ~20% of ${targetPaddock?.area} ha = ${Math.round((targetPaddock?.area ?? 0) * 0.2 * 10) / 10} ha
- sectionCentroid: [lng, lat] from the geometry
- sectionAvgNdvi: ${targetPaddock?.ndviMean}
`}

CRITICAL: You MUST call createPlanWithSection then finalizePlan. Use farmExternalId="${farmExternalId}".`

  const result = await generateText({
    model: anthropic(GRAZING_AGENT_MODEL) as any,
    system: GRAZING_SYSTEM_PROMPT,
    prompt,
    tools: {
      createPlanWithSection: tool({
        description: "Create or update a grazing plan with section geometry and justification",
        inputSchema: z.object({
          farmExternalId: z.string(),
          targetPaddockId: z.string(),
          sectionGeometry: z.any().optional(),
          sectionAreaHectares: z.number().optional(),
          sectionCentroid: z.array(z.number()).optional(),
          sectionAvgNdvi: z.number().optional(),
          sectionJustification: z.string(),
          paddockGrazedPercentage: z.number().optional(),
          confidence: z.number(),
          reasoning: z.array(z.string()),
        }),
      }),

      finalizePlan: tool({
        description: "Finalize the plan and set it to pending status for user approval",
        inputSchema: z.object({
          farmExternalId: z.string().optional(),
        }),
      }),
    },
  })

  const finalText = result.text
  const toolCalls = (result as any).toolCalls || []

  let planCreated = false
  let planFinalized = false
  
  if (toolCalls.length > 0) {
    for (const toolCall of toolCalls) {
      const args = (toolCall as any).args ?? (toolCall as any).input ?? {}
      
      try {
        if (toolCall.toolName === "createPlanWithSection") {
          const planId = await ctx.runMutation(api.grazingAgentTools.createPlanWithSection, args as any)
          console.log("createPlanWithSection result:", planId)
          planCreated = true
        } else if (toolCall.toolName === "finalizePlan") {
          const result = await ctx.runMutation(api.grazingAgentTools.finalizePlan, { 
            farmExternalId: (args.farmExternalId as string) ?? farmExternalId 
          })
          console.log("finalizePlan result:", result)
          planFinalized = true
        }
      } catch (toolError) {
        console.error(`Error executing ${toolCall.toolName}:`, toolError)
      }
    }
  }

  console.log("Grazing agent final response:", finalText)
  console.log("Plan creation status:", { planCreated, planFinalized })

  return { 
    success: true, 
    planCreated: planCreated && planFinalized 
  }
}
