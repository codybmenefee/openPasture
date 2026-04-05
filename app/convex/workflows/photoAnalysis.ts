"use node"

import { action } from '../_generated/server'
import { v } from 'convex/values'
import { api } from '../_generated/api'
import { createLogger } from '../lib/logger'

const log = createLogger('photoAnalysis')

/**
 * Analyze a photo using a vision model and record it as an observation.
 *
 * This is the ingest-time analysis pipeline for photo observations (Decision 4: Option B).
 * It extracts structured perception data (greenness, height, density, growth stage)
 * from the photo and stores it alongside the raw media reference.
 *
 * The agent at decision time reads the normalized visualState rather than
 * re-analyzing photos, keeping the decision loop fast.
 */
export const analyzeAndRecordPhoto = action({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.optional(v.string()),
    mediaStorageId: v.string(),
    mediaLocation: v.optional(v.object({
      type: v.literal('Feature'),
      properties: v.optional(v.any()),
      geometry: v.object({
        type: v.literal('Point'),
        coordinates: v.array(v.number()),
      }),
    })),
    sourceType: v.optional(v.union(v.literal('photo'), v.literal('fieldcam'), v.literal('drone'))),
    author: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ observationId: string; analysis: Record<string, unknown> }> => {
    const source = args.sourceType ?? 'photo'
    log.debug('Analyzing photo', {
      farm: args.farmExternalId,
      paddock: args.paddockExternalId,
      source,
    })

    const analysis = await analyzePhotoWithVision(args.mediaStorageId)

    const observationId: string = await ctx.runMutation(
      api.harness.tools.recordObservation.recordObservation,
      {
        farmExternalId: args.farmExternalId,
        paddockExternalId: args.paddockExternalId,
        date: new Date().toISOString().split('T')[0],
        sourceType: source,
        gisCapability: 'point_visual',
        visualState: analysis.visualState,
        confidence: analysis.confidence,
        mediaStorageId: args.mediaStorageId,
        mediaLocation: args.mediaLocation,
        mediaAnalysis: JSON.stringify(analysis.rawAnalysis),
      }
    )

    log.debug('Photo observation recorded', { observationId })
    return { observationId, analysis: analysis.rawAnalysis }
  },
})

interface PhotoAnalysisResult {
  visualState: {
    greenness: number
    estimatedHeightCm?: number
    density?: 'sparse' | 'moderate' | 'dense' | 'lush'
    growthStage?: 'dormant' | 'emerging' | 'vegetative' | 'reproductive' | 'senescent'
    condition?: string
  }
  confidence: number
  rawAnalysis: Record<string, unknown>
}

/**
 * Analyze a pasture photo using a vision model.
 *
 * Currently uses a structured prompt to extract perception data.
 * The model is called with the photo and asked to estimate:
 * - Greenness (0-1 scale)
 * - Grass height in cm
 * - Vegetation density
 * - Growth stage
 * - Overall condition description
 *
 * This function is designed to be swappable -- when better vision models
 * become available, only this function needs to change.
 */
async function analyzePhotoWithVision(
  _mediaStorageId: string
): Promise<PhotoAnalysisResult> {
  // TODO: Integrate with vision model (e.g., Claude vision, GPT-4V)
  // For now, return a placeholder that indicates analysis is pending.
  // When integrated, this will:
  // 1. Fetch the image from Convex storage
  // 2. Send to vision model with structured prompt
  // 3. Parse the response into visualState fields
  //
  // The prompt should ask:
  // "Analyze this pasture photo. Estimate:
  //  - Overall greenness (0.0 to 1.0)
  //  - Approximate grass height in cm
  //  - Vegetation density: sparse, moderate, dense, or lush
  //  - Growth stage: dormant, emerging, vegetative, reproductive, or senescent
  //  - Brief condition description (1-2 sentences)"

  return {
    visualState: {
      greenness: 0.5,
      condition: 'Photo analysis pending - vision model integration required',
    },
    confidence: 0.3,
    rawAnalysis: {
      status: 'placeholder',
      message: 'Vision model integration not yet configured. Set ANTHROPIC_API_KEY and enable photo analysis.',
    },
  }
}
