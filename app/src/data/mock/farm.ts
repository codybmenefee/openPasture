import type { Farm, DataStatus } from '@/lib/types'

export const farm: Farm = {
  id: 'farm-1',
  name: 'Hillcrest Station',
  location: '943 Riverview Ln, Columbia, TN 38401',
  totalArea: 142,
  paddockCount: 8,
  coordinates: [-87.0403892, 35.6389946], // Columbia, TN
}

export const dataStatus: DataStatus = {
  lastSatellitePass: '2 days ago',
  cloudCoverage: 12,
  observationQuality: 'good',
  nextExpectedPass: 'Tomorrow',
}
