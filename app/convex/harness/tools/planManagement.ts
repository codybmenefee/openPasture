import { query, mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { DEFAULT_FARM_EXTERNAL_ID } from '../../seedData'
import area from '@turf/area'
import difference from '@turf/difference'
import intersect from '@turf/intersect'
import { featureCollection } from '@turf/helpers'
import type { Feature, MultiPolygon, Polygon } from 'geojson'
import { createLogger } from '../../lib/logger'
// NOTE: Braintrust logging is done at the action level (grazingAgentDirect.ts)
// Mutations cannot use Node.js APIs, so we don't import Braintrust here

const log = createLogger('planManagement')

interface SectionWithJustification {
  id: string
  date: string
  geometry: any
  area: number
  justification: string
}

export const getPreviousSections = query({
  args: { farmExternalId: v.optional(v.string()), paddockId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<SectionWithJustification[]> => {
    const farmExternalId = args.farmExternalId ?? DEFAULT_FARM_EXTERNAL_ID
    const today = new Date().toISOString().split('T')[0]

    const plans = await ctx.db
      .query('plans')
      .withIndex('by_farm', (q: any) => q.eq('farmExternalId', farmExternalId))
      .collect()

    const targetPaddockId = args.paddockId

    const sectionsWithJustification: SectionWithJustification[] = []

    for (const plan of plans) {
      // Only include sections from previous days (exclude today to avoid overlap with current plan being generated)
      // Also exclude rejected plans as they weren't executed
      if (
        plan.sectionGeometry &&
        plan.primaryPaddockExternalId === targetPaddockId &&
        plan.date !== today &&
        plan.status !== 'rejected'
      ) {
        sectionsWithJustification.push({
          id: plan._id.toString(),
          date: plan.date,
          geometry: plan.sectionGeometry,
          area: plan.sectionAreaHectares || 0,
          justification: plan.sectionJustification || 'No justification provided',
        })
      }
    }

    return sectionsWithJustification.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  },
})

export const createPlanWithSection = mutation({
  args: {
    farmExternalId: v.string(),
    targetPaddockId: v.string(),
    sectionGeometry: v.optional(v.any()),
    sectionAreaHectares: v.optional(v.number()),
    sectionCentroid: v.optional(v.array(v.number())),
    sectionAvgNdvi: v.optional(v.number()),
    sectionJustification: v.string(),
    paddockGrazedPercentage: v.optional(v.number()),
    // LLM tool calls occasionally omit this field or embed it in sectionJustification.
    // Keep this optional and recover it in the handler to avoid hard failures.
    confidence: v.optional(v.number()),
    reasoning: v.array(v.string()),
    // Progressive grazing fields
    progressionQuadrant: v.optional(
      v.union(v.literal('NW'), v.literal('NE'), v.literal('SW'), v.literal('SE'))
    ),
    adjacentToPrevious: v.optional(v.boolean()),
    skippedArea: v.optional(
      v.object({
        centroid: v.array(v.number()),
        approximateAreaHa: v.number(),
        reason: v.string(),
        ndviValue: v.number(),
      })
    ),
    // Skip overlap validation (used when creating plans from forecast system)
    skipOverlapValidation: v.optional(v.boolean()),
    // Forecast linkage fields (set when plan is generated from a paddock forecast)
    forecastId: v.optional(v.id('paddockForecasts')),
    decision: v.optional(v.union(v.literal('MOVE'), v.literal('STAY'))),
    recommendedSectionIndex: v.optional(v.number()),
    daysInSection: v.optional(v.number()),
    estimatedForageRemaining: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    log.debug('createPlanWithSection START', {
      farmExternalId: args.farmExternalId,
      targetPaddockId: args.targetPaddockId,
      hasSectionGeometry: !!args.sectionGeometry,
      sectionAreaHectares: args.sectionAreaHectares,
      confidence: args.confidence,
      today,
    })

    // CRITICAL: Animals must eat somewhere - sectionGeometry is required
    if (!args.sectionGeometry) {
      throw new Error(
        'sectionGeometry is REQUIRED. Animals must graze somewhere every day. The agent must always create a section, even if conditions are not ideal. Please ensure the agent creates a section geometry in the target paddock.'
      )
    }

    const extractConfidenceFromJustification = (
      justification: string
    ): { confidence?: number; justification: string } => {
      // Common failure mode: the model appends something like:
      // </sectionJustification>\n<parameter name="confidence">0.55
      const match = justification.match(
        /<parameter\s+name=["']confidence["']>\s*([0-9]*\.?[0-9]+)/i
      )
      if (!match) {
        return { justification }
      }

      const extracted = Number.parseFloat(match[1] ?? '')
      const cleaned = justification
        .replace(/<\/sectionJustification>/gi, '')
        .replace(/<parameter\s+name=["']confidence["'][\s\S]*$/i, '')
        .trim()

      return {
        confidence: Number.isFinite(extracted) ? extracted : undefined,
        justification: cleaned,
      }
    }

    const normalizeConfidenceScore = (value: number | undefined): number => {
      // App currently treats confidence as a 0-100 score (e.g. LOW_CONFIDENCE_THRESHOLD = 70).
      // The agent often produces 0-1 floats; convert to percent when appropriate.
      if (value === undefined || !Number.isFinite(value)) return 50
      if (value >= 0 && value <= 1) return Math.round(value * 100)
      return value
    }

    const extracted = extractConfidenceFromJustification(args.sectionJustification)
    const confidenceScore = normalizeConfidenceScore(args.confidence ?? extracted.confidence)
    const sectionJustification = extracted.justification

    // Validate and clip section geometry if provided
    let finalSectionGeometry = args.sectionGeometry
    if (args.sectionGeometry) {
      // Get paddock to validate section is within bounds
      const farm = await ctx.db
        .query('farms')
        .withIndex('by_externalId', (q: any) => q.eq('externalId', args.farmExternalId))
        .first()

      if (!farm) {
        throw new Error(`Farm not found: ${args.farmExternalId}`)
      }

      const paddock = await ctx.db
        .query('paddocks')
        .withIndex('by_farm_externalId', (q: any) =>
          q.eq('farmId', farm._id).eq('externalId', args.targetPaddockId)
        )
        .first()

      if (!paddock) {
        throw new Error(`Paddock not found: ${args.targetPaddockId}`)
      }

      // Validate and normalize section geometry
      // Ensure coordinates are properly structured as a closed ring
      let sectionGeometry = args.sectionGeometry as Polygon
      if (!sectionGeometry.coordinates || !sectionGeometry.coordinates[0]) {
        throw new Error('Invalid section geometry: missing coordinates')
      }

      // Ensure the polygon ring is closed (first point = last point)
      const ring = sectionGeometry.coordinates[0]
      if (ring.length < 4) {
        throw new Error(
          `Invalid section geometry: polygon ring has only ${ring.length} points (need at least 4)`
        )
      }
      const firstPoint = ring[0]
      const lastPoint = ring[ring.length - 1]
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        log.debug('Closing unclosed polygon ring', {
          first: firstPoint,
          last: lastPoint,
        })
        // Close the ring by adding the first point at the end
        sectionGeometry = {
          type: 'Polygon',
          coordinates: [[...ring, firstPoint]],
        }
      }

      // Normalize section geometry to Feature<Polygon>
      const sectionFeature: Feature<Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: sectionGeometry,
      }

      // Normalize paddock geometry to Feature<Polygon>
      // Paddock geometry is stored as Feature<Polygon>, but let's handle both cases
      const rawPaddockGeom = paddock.geometry as any
      let paddockGeometry: Polygon
      if (rawPaddockGeom.type === 'Feature') {
        paddockGeometry = rawPaddockGeom.geometry as Polygon
      } else if (rawPaddockGeom.type === 'Polygon') {
        paddockGeometry = rawPaddockGeom as Polygon
      } else {
        log.warn('Unexpected paddock geometry structure', { type: rawPaddockGeom.type })
        paddockGeometry = (rawPaddockGeom.geometry || rawPaddockGeom) as Polygon
      }

      // Ensure paddock polygon ring is closed
      if (paddockGeometry.coordinates && paddockGeometry.coordinates[0]) {
        const paddockRing = paddockGeometry.coordinates[0]
        const firstPt = paddockRing[0]
        const lastPt = paddockRing[paddockRing.length - 1]
        if (firstPt[0] !== lastPt[0] || firstPt[1] !== lastPt[1]) {
          log.debug('Closing unclosed paddock polygon ring')
          paddockGeometry = {
            type: 'Polygon',
            coordinates: [[...paddockRing, firstPt]],
          }
        }
      }

      const paddockFeature: Feature<Polygon> = {
        type: 'Feature',
        properties: {},
        geometry: paddockGeometry,
      }

      log.debug('Geometry structures after normalization', {
        sectionType: sectionGeometry.type,
        sectionCoordsRings: sectionGeometry.coordinates?.length,
        sectionFirstRingLength: sectionGeometry.coordinates?.[0]?.length,
        paddockType: paddockGeometry.type,
        paddockCoordsRings: paddockGeometry.coordinates?.length,
        paddockFirstRingLength: paddockGeometry.coordinates?.[0]?.length,
      })

      // Log section and paddock bounds for debugging
      const sectionBbox = (() => {
        try {
          const coords = args.sectionGeometry.coordinates?.[0] || []
          if (coords.length === 0) return null
          let minLng = Infinity,
            maxLng = -Infinity,
            minLat = Infinity,
            maxLat = -Infinity
          for (const [lng, lat] of coords) {
            minLng = Math.min(minLng, lng)
            maxLng = Math.max(maxLng, lng)
            minLat = Math.min(minLat, lat)
            maxLat = Math.max(maxLat, lat)
          }
          return { minLng, maxLng, minLat, maxLat }
        } catch {
          return null
        }
      })()

      const paddockBbox = (() => {
        try {
          const geom = paddockFeature.geometry || paddockFeature
          const coords = geom.coordinates?.[0] || []
          if (coords.length === 0) return null
          let minLng = Infinity,
            maxLng = -Infinity,
            minLat = Infinity,
            maxLat = -Infinity
          for (const [lng, lat] of coords) {
            minLng = Math.min(minLng, lng)
            maxLng = Math.max(maxLng, lng)
            minLat = Math.min(minLat, lat)
            maxLat = Math.max(maxLat, lat)
          }
          return { minLng, maxLng, minLat, maxLat }
        } catch {
          return null
        }
      })()

      log.debug('Section validation - comparing bounds', {
        sectionBbox,
        paddockBbox,
        sectionCoords: args.sectionGeometry.coordinates?.[0]?.slice(0, 3), // First 3 coords
      })

      // Pre-check: Do bounding boxes even overlap?
      const bboxOverlaps =
        sectionBbox &&
        paddockBbox &&
        sectionBbox.minLng <= paddockBbox.maxLng &&
        sectionBbox.maxLng >= paddockBbox.minLng &&
        sectionBbox.minLat <= paddockBbox.maxLat &&
        sectionBbox.maxLat >= paddockBbox.minLat

      log.debug('Bbox overlap check', {
        bboxOverlaps,
        sectionBbox,
        paddockBbox,
      })

      // Log the actual features being passed to intersect
      log.debug('Features for intersection', {
        sectionFeatureType: sectionFeature.type,
        sectionGeomType: sectionFeature.geometry?.type,
        sectionCoordsLength: sectionFeature.geometry?.coordinates?.[0]?.length,
        paddockFeatureType: paddockFeature.type,
        paddockGeomType: paddockFeature.geometry?.type,
        paddockCoordsLength: paddockFeature.geometry?.coordinates?.[0]?.length,
      })

      // Validate: Section must be within paddock bounds
      // Check by intersecting section with paddock - if intersection area equals section area, it's fully within
      // Note: turf v7 intersect takes a FeatureCollection
      let intersection: Feature<Polygon | MultiPolygon> | null = null
      try {
        intersection = intersect(featureCollection([sectionFeature, paddockFeature]))
        log.debug('Intersection result', {
          hasIntersection: !!intersection,
          intersectionType: intersection?.geometry?.type,
        })
      } catch (intersectError: any) {
        log.error('Intersect function threw error', { error: intersectError.message })
        // If intersect fails but bboxes overlap, try to continue with the section as-is
        if (bboxOverlaps) {
          log.warn('Bboxes overlap but intersect failed - using section as-is with warning')
          intersection = sectionFeature as Feature<Polygon | MultiPolygon>
        }
      }

      if (!intersection) {
        if (bboxOverlaps) {
          // Bboxes overlap but intersect failed - likely a turf geometry structure issue
          // Since bboxes overlap, the section is at least partially within paddock bounds
          // Use the section as-is but clamp coordinates to paddock bounds
          log.warn(
            'Bboxes overlap but intersect returned null - clamping section to paddock bounds',
            {
              sectionBbox,
              paddockBbox,
            }
          )

          // Clamp section coordinates to paddock bounds
          if (sectionBbox && paddockBbox) {
            const clampedCoords = sectionGeometry.coordinates[0].map((coord) => {
              const lng = coord[0]
              const lat = coord[1]
              return [
                Math.max(paddockBbox.minLng, Math.min(paddockBbox.maxLng, lng)),
                Math.max(paddockBbox.minLat, Math.min(paddockBbox.maxLat, lat)),
              ]
            })
            // Ensure closed ring
            if (
              clampedCoords[0][0] !== clampedCoords[clampedCoords.length - 1][0] ||
              clampedCoords[0][1] !== clampedCoords[clampedCoords.length - 1][1]
            ) {
              clampedCoords.push([...clampedCoords[0]])
            }
            sectionGeometry = {
              type: 'Polygon',
              coordinates: [clampedCoords],
            }
            // Update sectionFeature with clamped geometry
            sectionFeature.geometry = sectionGeometry
            log.debug('Clamped section geometry to paddock bounds')
          }
          // Continue with the clamped section
        } else {
          // Bboxes don't overlap - section is genuinely outside paddock
          log.error('Section completely outside paddock - bboxes do not overlap', {
            sectionBbox,
            paddockBbox,
            sectionGeometry: JSON.stringify(args.sectionGeometry).slice(0, 500),
          })
          throw new Error(
            `Section geometry is completely outside paddock ${args.targetPaddockId} boundaries. Bounding boxes do NOT overlap. Section bounds: lng [${sectionBbox?.minLng.toFixed(5)}, ${sectionBbox?.maxLng.toFixed(5)}], lat [${sectionBbox?.minLat.toFixed(5)}, ${sectionBbox?.maxLat.toFixed(5)}]. Paddock bounds: lng [${paddockBbox?.minLng.toFixed(5)}, ${paddockBbox?.maxLng.toFixed(5)}], lat [${paddockBbox?.minLat.toFixed(5)}, ${paddockBbox?.maxLat.toFixed(5)}]`
          )
        }
      }

      // If intersection exists, check area ratio and clip if needed
      // If intersection is null but bboxes overlap, we've already clamped the section above
      if (intersection) {
        const sectionArea = area(sectionFeature)
        const intersectionArea = area(intersection as Feature<Polygon>)
        const areaRatio = intersectionArea / sectionArea

        // If section extends outside paddock, clip it to paddock boundary
        // This handles LLM imprecision in coordinate generation
        if (areaRatio < 0.99) {
          const intersectionFeature = intersection as Feature<Polygon>
          const intersectionGeometry = intersectionFeature?.geometry

          if (
            intersectionGeometry &&
            intersectionGeometry.coordinates &&
            intersectionGeometry.coordinates.length > 0
          ) {
            // Use the intersection geometry as the clipped section
            finalSectionGeometry = intersectionGeometry as Polygon
            log.debug(
              `Clipped section geometry: ${Math.round(areaRatio * 100)}% was within paddock, using intersection`,
              { geometryType: intersectionGeometry.type }
            )
          } else {
            throw new Error(
              `Section geometry extends outside paddock ${args.targetPaddockId} boundaries (${Math.round(areaRatio * 100)}% within paddock) and cannot be clipped - intersection has no valid geometry`
            )
          }
        }
      } else {
        // No intersection but we clamped above - use the clamped sectionGeometry
        finalSectionGeometry = sectionGeometry
        log.debug('Using clamped section geometry (intersection was null but bboxes overlapped)')
      }

      // Helper function to pick largest polygon from MultiPolygon
      const pickLargestPolygon = (geometry: Polygon | MultiPolygon): Polygon | null => {
        if (geometry.type === 'Polygon') {
          return geometry
        }
        if (!geometry.coordinates || geometry.coordinates.length === 0) {
          return null
        }
        let best: Polygon | null = null
        let bestArea = 0
        for (const coords of geometry.coordinates) {
          const candidate: Polygon = { type: 'Polygon', coordinates: coords }
          const candidateArea = area({
            type: 'Feature',
            properties: {},
            geometry: candidate,
          })
          if (candidateArea > bestArea) {
            bestArea = candidateArea
            best = candidate
          }
        }
        return best
      }

      // Validate: Section must not overlap with previous sections
      // Skip validation when creating legacy plans from forecast system (sections are pre-validated)
      if (!args.skipOverlapValidation) {
        // Fetch previous sections directly (can't call query from mutation)
        const allPlans = await ctx.db
          .query('plans')
          .withIndex('by_farm', (q: any) => q.eq('farmExternalId', args.farmExternalId))
          .collect()

        const previousSections = allPlans
          .filter(
            (plan: any) =>
              plan.sectionGeometry &&
              plan.primaryPaddockExternalId === args.targetPaddockId &&
              plan.date !== today &&
              plan.status !== 'rejected'
          )
          .map((plan: any) => ({
            date: plan.date,
            geometry: plan.sectionGeometry,
          }))

        let adjustedSectionGeometry = finalSectionGeometry as Polygon
        let overlapAdjusted = false

        for (const prevSection of previousSections) {
          const currentFeature: Feature<Polygon> = {
            type: 'Feature',
            properties: {},
            geometry: adjustedSectionGeometry,
          }
          const prevFeature: Feature<Polygon> = {
            type: 'Feature',
            properties: {},
            geometry: prevSection.geometry,
          }

          const overlap = intersect(featureCollection([currentFeature, prevFeature]))
          if (overlap) {
            const overlapArea = area(overlap as Feature<Polygon>)
            const currentArea = area(currentFeature)
            const overlapPercent = (overlapArea / currentArea) * 100

            // Allow small overlaps due to LLM coordinate imprecision (<= 5%)
            const ALLOWED_OVERLAP_PERCENT = 5
            if (overlapPercent > ALLOWED_OVERLAP_PERCENT) {
              const differenceResult = difference(featureCollection([currentFeature, prevFeature]))
              const differenceGeometry = differenceResult?.geometry as
                | Polygon
                | MultiPolygon
                | undefined
              const largestPolygon = differenceGeometry
                ? pickLargestPolygon(differenceGeometry)
                : null

              if (!largestPolygon) {
                throw new Error(
                  `Section geometry overlaps with previous section from ${prevSection.date} (${Math.round(overlapPercent)}% overlap) and could not be adjusted`
                )
              }

              const adjustedArea = area({
                type: 'Feature',
                properties: {},
                geometry: largestPolygon,
              })

              if (!Number.isFinite(adjustedArea) || adjustedArea === 0) {
                throw new Error(
                  `Section geometry overlaps with previous section from ${prevSection.date} (${Math.round(overlapPercent)}% overlap) and produced an invalid adjusted section`
                )
              }

              adjustedSectionGeometry = largestPolygon
              overlapAdjusted = true
            } else if (overlapPercent > 0) {
              // Log allowed overlap for debugging
              log.debug(
                `Allowing ${overlapPercent.toFixed(1)}% overlap (within ${ALLOWED_OVERLAP_PERCENT}% tolerance)`
              )
            }
          }
        }

        finalSectionGeometry = adjustedSectionGeometry

        log.debug('Section validation passed', {
          withinPaddock: true,
          noOverlaps: true,
          previousSectionsCount: previousSections.length,
          overlapAdjusted,
        })
      } else {
        log.debug('Skipped overlap validation (skipOverlapValidation=true)')
      }
    }

    const existingPlan = await ctx.db
      .query('plans')
      .withIndex('by_farm_date', (q: any) => q.eq('farmExternalId', args.farmExternalId))
      .collect()

    const todayPlan = existingPlan.find((p: any) => p.date === today)

    if (todayPlan) {
      log.debug('Patching existing plan', {
        planId: todayPlan._id.toString(),
        date: todayPlan.date,
        currentStatus: todayPlan.status,
        hasSectionGeometry: !!args.sectionGeometry,
        targetPaddockId: args.targetPaddockId,
        confidenceScore,
      })

      // Build patch object, only including optional fields when they have values
      const patchData: any = {
        primaryPaddockExternalId: args.targetPaddockId,
        confidenceScore,
        reasoning: args.reasoning,
        sectionAreaHectares: args.sectionAreaHectares || 0,
        updatedAt: now,
      }

      // Only include sectionGeometry if it's defined (not null/undefined)
      // Use finalSectionGeometry (may be clipped version)
      if (finalSectionGeometry) {
        patchData.sectionGeometry = finalSectionGeometry
      }
      if (args.sectionCentroid) {
        patchData.sectionCentroid = args.sectionCentroid
      }
      if (args.sectionAvgNdvi !== undefined && args.sectionAvgNdvi !== null) {
        patchData.sectionAvgNdvi = args.sectionAvgNdvi
      }
      if (sectionJustification) {
        patchData.sectionJustification = sectionJustification
      }
      if (args.paddockGrazedPercentage !== undefined && args.paddockGrazedPercentage !== null) {
        patchData.paddockGrazedPercentage = args.paddockGrazedPercentage
      }

      // Forecast linkage fields
      if (args.forecastId) {
        patchData.forecastId = args.forecastId
      }
      if (args.decision) {
        patchData.decision = args.decision
      }
      if (args.recommendedSectionIndex !== undefined) {
        patchData.recommendedSectionIndex = args.recommendedSectionIndex
      }
      if (args.daysInSection !== undefined) {
        patchData.daysInSection = args.daysInSection
      }
      if (args.estimatedForageRemaining !== undefined) {
        patchData.estimatedForageRemaining = args.estimatedForageRemaining
      }

      // Build progression context if we have an active rotation
      if (args.progressionQuadrant) {
        const activeRotation = await ctx.db
          .query('paddockRotations')
          .withIndex('by_active', (q: any) =>
            q
              .eq('farmExternalId', args.farmExternalId)
              .eq('paddockExternalId', args.targetPaddockId)
              .eq('status', 'active')
          )
          .first()

        if (activeRotation) {
          const rotationSections = await ctx.db
            .query('sectionGrazingEvents')
            .withIndex('by_rotation', (q: any) => q.eq('rotationId', activeRotation._id))
            .collect()

          patchData.progressionContext = {
            rotationId: activeRotation._id,
            sequenceNumber: rotationSections.length + 1,
            progressionQuadrant: args.progressionQuadrant,
            wasUngrazedAreaReturn: false,
          }
        }
      }

      await ctx.db.patch(todayPlan._id, patchData)

      // Record skipped area if reported
      if (args.skippedArea) {
        const activeRotationForSkip = await ctx.db
          .query('paddockRotations')
          .withIndex('by_active', (q: any) =>
            q
              .eq('farmExternalId', args.farmExternalId)
              .eq('paddockExternalId', args.targetPaddockId)
              .eq('status', 'active')
          )
          .first()

        if (activeRotationForSkip) {
          const ungrazedAreas = activeRotationForSkip.ungrazedAreas ?? []
          ungrazedAreas.push({
            approximateCentroid: args.skippedArea.centroid,
            approximateAreaHa: args.skippedArea.approximateAreaHa,
            reason: args.skippedArea.reason,
            ndviAtSkip: args.skippedArea.ndviValue,
          })

          await ctx.db.patch(activeRotationForSkip._id, {
            ungrazedAreas,
            updatedAt: now,
          })

          log.debug('Recorded skipped area (patch)', {
            rotationId: activeRotationForSkip._id.toString(),
            centroid: args.skippedArea.centroid,
            reason: args.skippedArea.reason,
          })
        }
      }

      log.debug('Plan patched successfully', { planId: todayPlan._id.toString() })
      return todayPlan._id
    }

    log.debug('Creating NEW plan', {
      hasSectionGeometry: !!args.sectionGeometry,
      targetPaddockId: args.targetPaddockId,
      confidenceScore,
      sectionAreaHectares: args.sectionAreaHectares,
    })

    // Build insert object, only including optional fields when they have values
    const insertData: any = {
      farmExternalId: args.farmExternalId,
      date: today,
      primaryPaddockExternalId: args.targetPaddockId,
      alternativePaddockExternalIds: [],
      confidenceScore,
      reasoning: args.reasoning,
      status: 'pending',
      sectionAreaHectares: args.sectionAreaHectares || 0,
      createdAt: now,
      updatedAt: now,
    }

    // Only include optional fields if they have values (not null/undefined)
    // Use finalSectionGeometry (may be clipped version)
    if (finalSectionGeometry) {
      insertData.sectionGeometry = finalSectionGeometry
    }
    if (args.sectionCentroid) {
      insertData.sectionCentroid = args.sectionCentroid
    }
    if (args.sectionAvgNdvi !== undefined && args.sectionAvgNdvi !== null) {
      insertData.sectionAvgNdvi = args.sectionAvgNdvi
    }
    if (sectionJustification) {
      insertData.sectionJustification = sectionJustification
    }
    if (args.paddockGrazedPercentage !== undefined && args.paddockGrazedPercentage !== null) {
      insertData.paddockGrazedPercentage = args.paddockGrazedPercentage
    }

    // Forecast linkage fields
    if (args.forecastId) {
      insertData.forecastId = args.forecastId
    }
    if (args.decision) {
      insertData.decision = args.decision
    }
    if (args.recommendedSectionIndex !== undefined) {
      insertData.recommendedSectionIndex = args.recommendedSectionIndex
    }
    if (args.daysInSection !== undefined) {
      insertData.daysInSection = args.daysInSection
    }
    if (args.estimatedForageRemaining !== undefined) {
      insertData.estimatedForageRemaining = args.estimatedForageRemaining
    }

    // Build progression context if we have an active rotation
    if (args.progressionQuadrant) {
      const activeRotation = await ctx.db
        .query('paddockRotations')
        .withIndex('by_active', (q: any) =>
          q
            .eq('farmExternalId', args.farmExternalId)
            .eq('paddockExternalId', args.targetPaddockId)
            .eq('status', 'active')
        )
        .first()

      if (activeRotation) {
        const rotationSections = await ctx.db
          .query('sectionGrazingEvents')
          .withIndex('by_rotation', (q: any) => q.eq('rotationId', activeRotation._id))
          .collect()

        insertData.progressionContext = {
          rotationId: activeRotation._id,
          sequenceNumber: rotationSections.length + 1,
          progressionQuadrant: args.progressionQuadrant,
          wasUngrazedAreaReturn: false,
        }
      }
    }

    const newPlanId = await ctx.db.insert('plans', insertData)

    // Record skipped area if reported
    if (args.skippedArea) {
      const activeRotation = await ctx.db
        .query('paddockRotations')
        .withIndex('by_active', (q: any) =>
          q
            .eq('farmExternalId', args.farmExternalId)
            .eq('paddockExternalId', args.targetPaddockId)
            .eq('status', 'active')
        )
        .first()

      if (activeRotation) {
        const ungrazedAreas = activeRotation.ungrazedAreas ?? []
        ungrazedAreas.push({
          approximateCentroid: args.skippedArea.centroid,
          approximateAreaHa: args.skippedArea.approximateAreaHa,
          reason: args.skippedArea.reason,
          ndviAtSkip: args.skippedArea.ndviValue,
        })

        await ctx.db.patch(activeRotation._id, {
          ungrazedAreas,
          updatedAt: now,
        })

        log.debug('Recorded skipped area', {
          rotationId: activeRotation._id.toString(),
          centroid: args.skippedArea.centroid,
          reason: args.skippedArea.reason,
        })
      }
    }

    log.debug('Plan created successfully', {
      planId: newPlanId.toString(),
      date: today,
      hasSectionGeometry: !!args.sectionGeometry,
      targetPaddockId: args.targetPaddockId,
    })
    return newPlanId
  },
})

export const finalizePlan = mutation({
  args: { farmExternalId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<string | null> => {
    const farmExternalId = args.farmExternalId ?? DEFAULT_FARM_EXTERNAL_ID
    const today = new Date().toISOString().split('T')[0]

    const plans = await ctx.db
      .query('plans')
      .withIndex('by_farm_date', (q: any) => q.eq('farmExternalId', farmExternalId))
      .collect()

    const todayPlan = plans.find((p: any) => p.date === today)

    if (!todayPlan) {
      return null
    }

    await ctx.db.patch(todayPlan._id, {
      status: 'pending',
      updatedAt: new Date().toISOString(),
    })

    return todayPlan._id.toString()
  },
})
