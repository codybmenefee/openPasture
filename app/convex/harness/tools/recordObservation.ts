import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { createLogger } from '../../lib/logger'

const log = createLogger('recordObservation')

/**
 * Record a new observation of any type into the unified observation store.
 *
 * This is the canonical ingestion endpoint for all observation types.
 * Each source type normalizes its data into the common fields (sourceType,
 * gisCapability, visualState, confidence) plus source-specific fields.
 */
export const recordObservation = mutation({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.optional(v.string()),
    date: v.string(),
    sourceType: v.union(
      v.literal('sentinel2'),
      v.literal('planetscope'),
      v.literal('drone'),
      v.literal('photo'),
      v.literal('fieldcam'),
      v.literal('note'),
      v.literal('weather'),
      v.literal('manual'),
    ),
    gisCapability: v.union(
      v.literal('spectral_raster'),
      v.literal('point_visual'),
      v.literal('none'),
    ),

    // Normalized visual state
    visualState: v.optional(v.object({
      greenness: v.number(),
      estimatedHeightCm: v.optional(v.number()),
      density: v.optional(v.union(
        v.literal('sparse'), v.literal('moderate'),
        v.literal('dense'), v.literal('lush'),
      )),
      growthStage: v.optional(v.union(
        v.literal('dormant'), v.literal('emerging'),
        v.literal('vegetative'), v.literal('reproductive'),
        v.literal('senescent'),
      )),
      condition: v.optional(v.string()),
    })),
    confidence: v.optional(v.number()),

    // Satellite-specific
    ndviMean: v.optional(v.number()),
    ndviMin: v.optional(v.number()),
    ndviMax: v.optional(v.number()),
    ndviStd: v.optional(v.number()),
    eviMean: v.optional(v.number()),
    ndwiMean: v.optional(v.number()),
    cloudFreePct: v.optional(v.number()),
    pixelCount: v.optional(v.number()),
    isValid: v.optional(v.boolean()),
    sourceProvider: v.optional(v.string()),
    resolutionMeters: v.optional(v.number()),

    // Photo/visual media
    mediaStorageId: v.optional(v.string()),
    mediaLocation: v.optional(v.object({
      type: v.literal('Feature'),
      properties: v.optional(v.any()),
      geometry: v.object({
        type: v.literal('Point'),
        coordinates: v.array(v.number()),
      }),
    })),
    mediaAnalysis: v.optional(v.string()),

    // Text observations
    noteContent: v.optional(v.string()),
    noteAuthor: v.optional(v.string()),
    noteTags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    log.debug('Recording observation', {
      farm: args.farmExternalId,
      paddock: args.paddockExternalId,
      source: args.sourceType,
    })

    const id = await ctx.db.insert('observations', {
      farmExternalId: args.farmExternalId,
      paddockExternalId: args.paddockExternalId,
      date: args.date,
      sourceType: args.sourceType,
      gisCapability: args.gisCapability,
      visualState: args.visualState,
      confidence: args.confidence,
      ndviMean: args.ndviMean,
      ndviMin: args.ndviMin,
      ndviMax: args.ndviMax,
      ndviStd: args.ndviStd,
      eviMean: args.eviMean,
      ndwiMean: args.ndwiMean,
      cloudFreePct: args.cloudFreePct,
      pixelCount: args.pixelCount,
      isValid: args.isValid,
      sourceProvider: args.sourceProvider,
      resolutionMeters: args.resolutionMeters,
      mediaStorageId: args.mediaStorageId,
      mediaLocation: args.mediaLocation,
      mediaAnalysis: args.mediaAnalysis,
      noteContent: args.noteContent,
      noteAuthor: args.noteAuthor,
      noteTags: args.noteTags,
      createdAt: new Date().toISOString(),
    })

    return id
  },
})

/**
 * Record a text note observation. Convenience wrapper around recordObservation
 * for the common case of a farmer adding a note about a paddock.
 */
export const recordNote = mutation({
  args: {
    farmExternalId: v.string(),
    paddockExternalId: v.optional(v.string()),
    content: v.string(),
    author: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('observations', {
      farmExternalId: args.farmExternalId,
      paddockExternalId: args.paddockExternalId,
      date: new Date().toISOString().split('T')[0],
      sourceType: 'note',
      gisCapability: 'none',
      confidence: 0.8,
      noteContent: args.content,
      noteAuthor: args.author ?? 'farmer',
      noteTags: args.tags,
      createdAt: new Date().toISOString(),
    })
  },
})
