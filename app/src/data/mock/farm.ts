import type { Farm, DataStatus } from '@/lib/types'

export const farm: Farm = {
  id: 'farm-1',
  name: 'Hillcrest Station',
  location: 'Canterbury, NZ',
  totalArea: 142,
  paddockCount: 8,
  coordinates: [172.6362, -43.5321], // Canterbury, NZ
}

export const dataStatus: DataStatus = {
  lastSatellitePass: '2 days ago',
  cloudCoverage: 12,
  observationQuality: 'good',
  nextExpectedPass: 'Tomorrow',
}
