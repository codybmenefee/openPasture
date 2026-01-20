import type { Feature, Polygon } from 'geojson'
import type { Farm, Paddock } from '@/lib/types'

export interface FarmDoc {
  _id: string
  externalId: string
  name: string
  location: string
  totalArea: number
  paddockCount: number
  coordinates: number[]
  geometry: Feature<Polygon>
}

export interface PaddockDoc {
  _id: string
  externalId: string
  name: string
  status: Paddock['status']
  ndvi: number
  restDays: number
  area: number
  waterAccess: string
  lastGrazed: string
  geometry: Feature<Polygon>
}

export function mapFarmDoc(doc: FarmDoc): Farm {
  return {
    id: doc.externalId,
    name: doc.name,
    location: doc.location,
    totalArea: doc.totalArea,
    paddockCount: doc.paddockCount,
    coordinates: [doc.coordinates[0], doc.coordinates[1]],
    geometry: doc.geometry,
  }
}

export function mapPaddockDoc(doc: PaddockDoc): Paddock {
  return {
    id: doc.externalId,
    name: doc.name,
    status: doc.status,
    ndvi: doc.ndvi,
    restDays: doc.restDays,
    area: doc.area,
    waterAccess: doc.waterAccess,
    lastGrazed: doc.lastGrazed,
    geometry: doc.geometry,
  }
}
