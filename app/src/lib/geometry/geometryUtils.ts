import type { Feature, MultiPolygon, Polygon, Position } from 'geojson'
import area from '@turf/area'
import intersect from '@turf/intersect'
import { featureCollection, polygon } from '@turf/helpers'

const DEFAULT_TOLERANCE = 1e-8
const HECTARES_PER_SQUARE_METER = 1 / 10000
const AREA_DECIMALS = 1

export function calculateAreaHectares(feature: Feature<Polygon | MultiPolygon>, decimals = AREA_DECIMALS): number {
  if (!feature) return 0
  const squareMeters = area(feature)
  if (!Number.isFinite(squareMeters)) return 0
  const hectares = squareMeters * HECTARES_PER_SQUARE_METER
  const factor = Math.pow(10, decimals)
  return Math.round(hectares * factor) / factor
}

export interface TranslationDelta {
  deltaLng: number
  deltaLat: number
}

export function getTranslationDelta(
  previous: Feature<Polygon>,
  next: Feature<Polygon>,
  tolerance: number = DEFAULT_TOLERANCE
): TranslationDelta | null {
  const prevRing = previous.geometry.coordinates[0]
  const nextRing = next.geometry.coordinates[0]

  if (prevRing.length !== nextRing.length || prevRing.length === 0) {
    return null
  }

  const deltaLng = nextRing[0][0] - prevRing[0][0]
  const deltaLat = nextRing[0][1] - prevRing[0][1]

  for (let i = 0; i < prevRing.length; i += 1) {
    const [prevLng, prevLat] = prevRing[i]
    const [nextLng, nextLat] = nextRing[i]
    if (Math.abs(prevLng + deltaLng - nextLng) > tolerance || Math.abs(prevLat + deltaLat - nextLat) > tolerance) {
      return null
    }
  }

  return { deltaLng, deltaLat }
}

export function translatePolygon(
  feature: Feature<Polygon>,
  deltaLng: number,
  deltaLat: number
): Feature<Polygon> {
  const translatedCoordinates = feature.geometry.coordinates.map((ring) =>
    ring.map(([lng, lat]) => [lng + deltaLng, lat + deltaLat] as Position)
  )

  return {
    ...feature,
    geometry: {
      ...feature.geometry,
      coordinates: translatedCoordinates,
    },
  }
}

export function clipPolygonToPolygon(
  subject: Feature<Polygon>,
  boundary: Feature<Polygon>
): Feature<Polygon> | null {
  const result = intersect(featureCollection([subject, boundary]))

  if (!result) {
    console.log('[Sections] clipPolygonToPolygon: no intersection result')
    return null
  }

  if (result.geometry.type === 'Polygon') {
    return result as Feature<Polygon>
  }

  if (result.geometry.type === 'MultiPolygon') {
    const multi = result.geometry as MultiPolygon
    let bestPolygon: Position[][] | null = null
    let bestArea = -Infinity

    multi.coordinates.forEach((coordinates) => {
      const candidate = polygon(coordinates)
      const candidateArea = area(candidate)
      if (candidateArea > bestArea) {
        bestArea = candidateArea
        bestPolygon = coordinates
      }
    })

    if (!bestPolygon) {
      console.log('[Sections] clipPolygonToPolygon: no best polygon found in MultiPolygon')
      return null
    }

    return {
      ...result,
      geometry: {
        type: 'Polygon',
        coordinates: bestPolygon,
      },
    }
  }

  console.log('[Sections] clipPolygonToPolygon: unexpected geometry type:', result.geometry.type)
  return null
}
