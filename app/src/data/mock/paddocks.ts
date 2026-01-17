import type { Paddock } from '@/lib/types'

// Canterbury, NZ area - realistic farm layout
const baseLng = 172.6362
const baseLat = -43.5321

function createPolygon(offsetLng: number, offsetLat: number, size: number): Paddock['geometry'] {
  const lng = baseLng + offsetLng
  const lat = baseLat + offsetLat
  const s = size * 0.005 // scale factor

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [lng, lat],
        [lng + s, lat],
        [lng + s, lat - s],
        [lng, lat - s],
        [lng, lat],
      ]],
    },
  }
}

export const paddocks: Paddock[] = [
  {
    id: 'p1',
    name: 'South Valley',
    status: 'recovering',
    ndvi: 0.31,
    restDays: 14,
    area: 18.2,
    waterAccess: 'Trough (north)',
    lastGrazed: 'Jan 2',
    geometry: createPolygon(0, 0, 1.2),
  },
  {
    id: 'p2',
    name: 'North Flat',
    status: 'almost_ready',
    ndvi: 0.48,
    restDays: 19,
    area: 15.8,
    waterAccess: 'Stream (west)',
    lastGrazed: 'Dec 28',
    geometry: createPolygon(-0.008, 0.006, 1.1),
  },
  {
    id: 'p3',
    name: 'Top Block',
    status: 'recovering',
    ndvi: 0.39,
    restDays: 16,
    area: 12.4,
    waterAccess: 'Trough (center)',
    lastGrazed: 'Dec 31',
    geometry: createPolygon(0.006, 0.008, 0.9),
  },
  {
    id: 'p4',
    name: 'East Ridge',
    status: 'ready',
    ndvi: 0.52,
    restDays: 24,
    area: 12.4,
    waterAccess: 'Creek (east)',
    lastGrazed: 'Dec 23',
    geometry: createPolygon(0.012, 0.004, 1.0),
  },
  {
    id: 'p5',
    name: 'Creek Bend',
    status: 'grazed',
    ndvi: 0.22,
    restDays: 3,
    area: 14.1,
    waterAccess: 'Creek (south)',
    lastGrazed: 'Jan 13',
    geometry: createPolygon(-0.006, -0.008, 1.0),
  },
  {
    id: 'p6',
    name: 'West Slope',
    status: 'recovering',
    ndvi: 0.35,
    restDays: 12,
    area: 16.5,
    waterAccess: 'Trough (west)',
    lastGrazed: 'Jan 4',
    geometry: createPolygon(0.004, -0.008, 1.1),
  },
  {
    id: 'p7',
    name: 'Creek Side',
    status: 'almost_ready',
    ndvi: 0.44,
    restDays: 28,
    area: 22.3,
    waterAccess: 'Creek (east)',
    lastGrazed: 'Dec 19',
    geometry: createPolygon(0.018, -0.004, 1.3),
  },
  {
    id: 'p8',
    name: 'Lower Paddock',
    status: 'grazed',
    ndvi: 0.19,
    restDays: 5,
    area: 30.3,
    waterAccess: 'Trough (south)',
    lastGrazed: 'Jan 11',
    geometry: createPolygon(0.020, -0.012, 1.4),
  },
]

export function getPaddockById(id: string): Paddock | undefined {
  return paddocks.find(p => p.id === id)
}

export function getPaddocksByStatus(status: Paddock['status']): Paddock[] {
  return paddocks.filter(p => p.status === status)
}

export function getStatusCounts(): Record<Paddock['status'], number> {
  return paddocks.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {} as Record<Paddock['status'], number>)
}
