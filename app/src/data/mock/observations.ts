import type { ExtendedObservation } from '@/lib/types'

// Historical observations for paddock recovery tracking (21+ days for charts)
export const observations: ExtendedObservation[] = [
  // Paddock 1 (South Valley) - recovering
  { id: 'obs-p1-01', paddockId: 'p1', date: '2024-12-25', ndvi: 0.15, evi: 0.10, ndwi: -0.18, cloudCoverage: 8 },
  { id: 'obs-p1-02', paddockId: 'p1', date: '2024-12-27', ndvi: 0.16, evi: 0.11, ndwi: -0.17, cloudCoverage: 5 },
  { id: 'obs-p1-03', paddockId: 'p1', date: '2024-12-29', ndvi: 0.17, evi: 0.12, ndwi: -0.16, cloudCoverage: 12 },
  { id: 'obs-p1-04', paddockId: 'p1', date: '2024-12-31', ndvi: 0.18, evi: 0.12, ndwi: -0.15, cloudCoverage: 10 },
  { id: 'obs-p1-05', paddockId: 'p1', date: '2025-01-02', ndvi: 0.19, evi: 0.13, ndwi: -0.14, cloudCoverage: 5 },
  { id: 'obs-p1-06', paddockId: 'p1', date: '2025-01-04', ndvi: 0.20, evi: 0.14, ndwi: -0.13, cloudCoverage: 12 },
  { id: 'obs-p1-07', paddockId: 'p1', date: '2025-01-06', ndvi: 0.22, evi: 0.15, ndwi: -0.12, cloudCoverage: 8 },
  { id: 'obs-p1-08', paddockId: 'p1', date: '2025-01-08', ndvi: 0.24, evi: 0.17, ndwi: -0.11, cloudCoverage: 15 },
  { id: 'obs-p1-09', paddockId: 'p1', date: '2025-01-10', ndvi: 0.26, evi: 0.18, ndwi: -0.10, cloudCoverage: 3 },
  { id: 'obs-p1-10', paddockId: 'p1', date: '2025-01-12', ndvi: 0.28, evi: 0.20, ndwi: -0.09, cloudCoverage: 7 },
  { id: 'obs-p1-11', paddockId: 'p1', date: '2025-01-14', ndvi: 0.31, evi: 0.22, ndwi: -0.08, cloudCoverage: 12 },
  { id: 'obs-p1-12', paddockId: 'p1', date: '2025-01-16', ndvi: 0.33, evi: 0.24, ndwi: -0.07, cloudCoverage: 10 },

  // Paddock 2 (North Flat) - almost ready
  { id: 'obs-p2-01', paddockId: 'p2', date: '2024-12-25', ndvi: 0.32, evi: 0.24, ndwi: -0.10, cloudCoverage: 8 },
  { id: 'obs-p2-02', paddockId: 'p2', date: '2024-12-27', ndvi: 0.34, evi: 0.26, ndwi: -0.09, cloudCoverage: 5 },
  { id: 'obs-p2-03', paddockId: 'p2', date: '2024-12-29', ndvi: 0.36, evi: 0.28, ndwi: -0.08, cloudCoverage: 12 },
  { id: 'obs-p2-04', paddockId: 'p2', date: '2024-12-31', ndvi: 0.38, evi: 0.29, ndwi: -0.07, cloudCoverage: 10 },
  { id: 'obs-p2-05', paddockId: 'p2', date: '2025-01-02', ndvi: 0.40, evi: 0.31, ndwi: -0.06, cloudCoverage: 5 },
  { id: 'obs-p2-06', paddockId: 'p2', date: '2025-01-04', ndvi: 0.42, evi: 0.32, ndwi: -0.05, cloudCoverage: 12 },
  { id: 'obs-p2-07', paddockId: 'p2', date: '2025-01-06', ndvi: 0.43, evi: 0.33, ndwi: -0.04, cloudCoverage: 8 },
  { id: 'obs-p2-08', paddockId: 'p2', date: '2025-01-08', ndvi: 0.45, evi: 0.34, ndwi: -0.03, cloudCoverage: 15 },
  { id: 'obs-p2-09', paddockId: 'p2', date: '2025-01-10', ndvi: 0.46, evi: 0.35, ndwi: -0.02, cloudCoverage: 3 },
  { id: 'obs-p2-10', paddockId: 'p2', date: '2025-01-12', ndvi: 0.47, evi: 0.36, ndwi: -0.02, cloudCoverage: 7 },
  { id: 'obs-p2-11', paddockId: 'p2', date: '2025-01-14', ndvi: 0.48, evi: 0.37, ndwi: -0.01, cloudCoverage: 12 },
  { id: 'obs-p2-12', paddockId: 'p2', date: '2025-01-16', ndvi: 0.48, evi: 0.37, ndwi: -0.01, cloudCoverage: 10 },

  // Paddock 3 (Top Block) - recovering
  { id: 'obs-p3-01', paddockId: 'p3', date: '2024-12-25', ndvi: 0.25, evi: 0.18, ndwi: -0.14, cloudCoverage: 8 },
  { id: 'obs-p3-02', paddockId: 'p3', date: '2024-12-27', ndvi: 0.27, evi: 0.19, ndwi: -0.13, cloudCoverage: 5 },
  { id: 'obs-p3-03', paddockId: 'p3', date: '2024-12-29', ndvi: 0.29, evi: 0.21, ndwi: -0.12, cloudCoverage: 12 },
  { id: 'obs-p3-04', paddockId: 'p3', date: '2024-12-31', ndvi: 0.30, evi: 0.22, ndwi: -0.11, cloudCoverage: 10 },
  { id: 'obs-p3-05', paddockId: 'p3', date: '2025-01-02', ndvi: 0.32, evi: 0.23, ndwi: -0.10, cloudCoverage: 5 },
  { id: 'obs-p3-06', paddockId: 'p3', date: '2025-01-04', ndvi: 0.34, evi: 0.25, ndwi: -0.09, cloudCoverage: 12 },
  { id: 'obs-p3-07', paddockId: 'p3', date: '2025-01-06', ndvi: 0.35, evi: 0.26, ndwi: -0.08, cloudCoverage: 8 },
  { id: 'obs-p3-08', paddockId: 'p3', date: '2025-01-08', ndvi: 0.36, evi: 0.27, ndwi: -0.08, cloudCoverage: 15 },
  { id: 'obs-p3-09', paddockId: 'p3', date: '2025-01-10', ndvi: 0.37, evi: 0.28, ndwi: -0.07, cloudCoverage: 3 },
  { id: 'obs-p3-10', paddockId: 'p3', date: '2025-01-12', ndvi: 0.38, evi: 0.29, ndwi: -0.06, cloudCoverage: 7 },
  { id: 'obs-p3-11', paddockId: 'p3', date: '2025-01-14', ndvi: 0.39, evi: 0.30, ndwi: -0.06, cloudCoverage: 12 },
  { id: 'obs-p3-12', paddockId: 'p3', date: '2025-01-16', ndvi: 0.39, evi: 0.30, ndwi: -0.05, cloudCoverage: 10 },

  // Paddock 4 (East Ridge) - ready
  { id: 'obs-p4-01', paddockId: 'p4', date: '2024-12-25', ndvi: 0.32, evi: 0.24, ndwi: -0.14, cloudCoverage: 8 },
  { id: 'obs-p4-02', paddockId: 'p4', date: '2024-12-27', ndvi: 0.34, evi: 0.26, ndwi: -0.13, cloudCoverage: 5 },
  { id: 'obs-p4-03', paddockId: 'p4', date: '2024-12-29', ndvi: 0.36, evi: 0.28, ndwi: -0.12, cloudCoverage: 12 },
  { id: 'obs-p4-04', paddockId: 'p4', date: '2024-12-31', ndvi: 0.38, evi: 0.29, ndwi: -0.11, cloudCoverage: 10 },
  { id: 'obs-p4-05', paddockId: 'p4', date: '2025-01-02', ndvi: 0.40, evi: 0.31, ndwi: -0.10, cloudCoverage: 5 },
  { id: 'obs-p4-06', paddockId: 'p4', date: '2025-01-04', ndvi: 0.42, evi: 0.32, ndwi: -0.09, cloudCoverage: 12 },
  { id: 'obs-p4-07', paddockId: 'p4', date: '2025-01-06', ndvi: 0.44, evi: 0.34, ndwi: -0.08, cloudCoverage: 8 },
  { id: 'obs-p4-08', paddockId: 'p4', date: '2025-01-08', ndvi: 0.46, evi: 0.36, ndwi: -0.07, cloudCoverage: 15 },
  { id: 'obs-p4-09', paddockId: 'p4', date: '2025-01-10', ndvi: 0.48, evi: 0.38, ndwi: -0.06, cloudCoverage: 3 },
  { id: 'obs-p4-10', paddockId: 'p4', date: '2025-01-12', ndvi: 0.50, evi: 0.40, ndwi: -0.05, cloudCoverage: 7 },
  { id: 'obs-p4-11', paddockId: 'p4', date: '2025-01-14', ndvi: 0.52, evi: 0.42, ndwi: -0.04, cloudCoverage: 12 },
  { id: 'obs-p4-12', paddockId: 'p4', date: '2025-01-16', ndvi: 0.53, evi: 0.43, ndwi: -0.04, cloudCoverage: 10 },

  // Paddock 5 (Creek Bend) - grazed
  { id: 'obs-p5-01', paddockId: 'p5', date: '2024-12-25', ndvi: 0.50, evi: 0.40, ndwi: -0.06, cloudCoverage: 8 },
  { id: 'obs-p5-02', paddockId: 'p5', date: '2024-12-27', ndvi: 0.52, evi: 0.42, ndwi: -0.05, cloudCoverage: 5 },
  { id: 'obs-p5-03', paddockId: 'p5', date: '2024-12-29', ndvi: 0.53, evi: 0.43, ndwi: -0.04, cloudCoverage: 12 },
  { id: 'obs-p5-04', paddockId: 'p5', date: '2024-12-31', ndvi: 0.54, evi: 0.44, ndwi: -0.03, cloudCoverage: 10 },
  { id: 'obs-p5-05', paddockId: 'p5', date: '2025-01-02', ndvi: 0.55, evi: 0.45, ndwi: -0.02, cloudCoverage: 5 },
  { id: 'obs-p5-06', paddockId: 'p5', date: '2025-01-04', ndvi: 0.54, evi: 0.44, ndwi: -0.02, cloudCoverage: 12 },
  { id: 'obs-p5-07', paddockId: 'p5', date: '2025-01-06', ndvi: 0.52, evi: 0.42, ndwi: -0.03, cloudCoverage: 8 },
  { id: 'obs-p5-08', paddockId: 'p5', date: '2025-01-08', ndvi: 0.48, evi: 0.38, ndwi: -0.05, cloudCoverage: 15 },
  { id: 'obs-p5-09', paddockId: 'p5', date: '2025-01-10', ndvi: 0.40, evi: 0.30, ndwi: -0.08, cloudCoverage: 3 },
  { id: 'obs-p5-10', paddockId: 'p5', date: '2025-01-12', ndvi: 0.32, evi: 0.22, ndwi: -0.12, cloudCoverage: 7 },
  { id: 'obs-p5-11', paddockId: 'p5', date: '2025-01-14', ndvi: 0.25, evi: 0.16, ndwi: -0.15, cloudCoverage: 12 },
  { id: 'obs-p5-12', paddockId: 'p5', date: '2025-01-16', ndvi: 0.22, evi: 0.14, ndwi: -0.16, cloudCoverage: 10 },

  // Paddock 6 (West Slope) - recovering
  { id: 'obs-p6-01', paddockId: 'p6', date: '2024-12-25', ndvi: 0.48, evi: 0.38, ndwi: -0.06, cloudCoverage: 8 },
  { id: 'obs-p6-02', paddockId: 'p6', date: '2024-12-27', ndvi: 0.50, evi: 0.40, ndwi: -0.05, cloudCoverage: 5 },
  { id: 'obs-p6-03', paddockId: 'p6', date: '2024-12-29', ndvi: 0.51, evi: 0.41, ndwi: -0.04, cloudCoverage: 12 },
  { id: 'obs-p6-04', paddockId: 'p6', date: '2024-12-31', ndvi: 0.52, evi: 0.42, ndwi: -0.03, cloudCoverage: 10 },
  { id: 'obs-p6-05', paddockId: 'p6', date: '2025-01-02', ndvi: 0.50, evi: 0.40, ndwi: -0.04, cloudCoverage: 5 },
  { id: 'obs-p6-06', paddockId: 'p6', date: '2025-01-04', ndvi: 0.42, evi: 0.32, ndwi: -0.08, cloudCoverage: 12 },
  { id: 'obs-p6-07', paddockId: 'p6', date: '2025-01-06', ndvi: 0.35, evi: 0.25, ndwi: -0.12, cloudCoverage: 8 },
  { id: 'obs-p6-08', paddockId: 'p6', date: '2025-01-08', ndvi: 0.28, evi: 0.18, ndwi: -0.15, cloudCoverage: 15 },
  { id: 'obs-p6-09', paddockId: 'p6', date: '2025-01-10', ndvi: 0.30, evi: 0.20, ndwi: -0.14, cloudCoverage: 3 },
  { id: 'obs-p6-10', paddockId: 'p6', date: '2025-01-12', ndvi: 0.32, evi: 0.22, ndwi: -0.13, cloudCoverage: 7 },
  { id: 'obs-p6-11', paddockId: 'p6', date: '2025-01-14', ndvi: 0.34, evi: 0.24, ndwi: -0.12, cloudCoverage: 12 },
  { id: 'obs-p6-12', paddockId: 'p6', date: '2025-01-16', ndvi: 0.35, evi: 0.25, ndwi: -0.11, cloudCoverage: 10 },

  // Paddock 7 (Creek Side) - almost ready
  { id: 'obs-p7-01', paddockId: 'p7', date: '2024-12-25', ndvi: 0.28, evi: 0.20, ndwi: -0.12, cloudCoverage: 8 },
  { id: 'obs-p7-02', paddockId: 'p7', date: '2024-12-27', ndvi: 0.30, evi: 0.22, ndwi: -0.11, cloudCoverage: 5 },
  { id: 'obs-p7-03', paddockId: 'p7', date: '2024-12-29', ndvi: 0.32, evi: 0.24, ndwi: -0.10, cloudCoverage: 12 },
  { id: 'obs-p7-04', paddockId: 'p7', date: '2024-12-31', ndvi: 0.34, evi: 0.26, ndwi: -0.09, cloudCoverage: 10 },
  { id: 'obs-p7-05', paddockId: 'p7', date: '2025-01-02', ndvi: 0.36, evi: 0.28, ndwi: -0.08, cloudCoverage: 5 },
  { id: 'obs-p7-06', paddockId: 'p7', date: '2025-01-04', ndvi: 0.38, evi: 0.29, ndwi: -0.07, cloudCoverage: 12 },
  { id: 'obs-p7-07', paddockId: 'p7', date: '2025-01-06', ndvi: 0.39, evi: 0.30, ndwi: -0.06, cloudCoverage: 8 },
  { id: 'obs-p7-08', paddockId: 'p7', date: '2025-01-08', ndvi: 0.40, evi: 0.31, ndwi: -0.05, cloudCoverage: 15 },
  { id: 'obs-p7-09', paddockId: 'p7', date: '2025-01-10', ndvi: 0.41, evi: 0.32, ndwi: -0.04, cloudCoverage: 3 },
  { id: 'obs-p7-10', paddockId: 'p7', date: '2025-01-12', ndvi: 0.42, evi: 0.33, ndwi: -0.04, cloudCoverage: 7 },
  { id: 'obs-p7-11', paddockId: 'p7', date: '2025-01-14', ndvi: 0.43, evi: 0.34, ndwi: -0.03, cloudCoverage: 12 },
  { id: 'obs-p7-12', paddockId: 'p7', date: '2025-01-16', ndvi: 0.44, evi: 0.35, ndwi: -0.03, cloudCoverage: 10 },

  // Paddock 8 (Lower Paddock) - grazed
  { id: 'obs-p8-01', paddockId: 'p8', date: '2024-12-25', ndvi: 0.45, evi: 0.35, ndwi: -0.08, cloudCoverage: 8 },
  { id: 'obs-p8-02', paddockId: 'p8', date: '2024-12-27', ndvi: 0.47, evi: 0.37, ndwi: -0.07, cloudCoverage: 5 },
  { id: 'obs-p8-03', paddockId: 'p8', date: '2024-12-29', ndvi: 0.48, evi: 0.38, ndwi: -0.06, cloudCoverage: 12 },
  { id: 'obs-p8-04', paddockId: 'p8', date: '2024-12-31', ndvi: 0.50, evi: 0.40, ndwi: -0.05, cloudCoverage: 10 },
  { id: 'obs-p8-05', paddockId: 'p8', date: '2025-01-02', ndvi: 0.51, evi: 0.41, ndwi: -0.04, cloudCoverage: 5 },
  { id: 'obs-p8-06', paddockId: 'p8', date: '2025-01-04', ndvi: 0.52, evi: 0.42, ndwi: -0.03, cloudCoverage: 12 },
  { id: 'obs-p8-07', paddockId: 'p8', date: '2025-01-06', ndvi: 0.50, evi: 0.40, ndwi: -0.04, cloudCoverage: 8 },
  { id: 'obs-p8-08', paddockId: 'p8', date: '2025-01-08', ndvi: 0.45, evi: 0.35, ndwi: -0.06, cloudCoverage: 15 },
  { id: 'obs-p8-09', paddockId: 'p8', date: '2025-01-10', ndvi: 0.35, evi: 0.25, ndwi: -0.10, cloudCoverage: 3 },
  { id: 'obs-p8-10', paddockId: 'p8', date: '2025-01-12', ndvi: 0.25, evi: 0.16, ndwi: -0.14, cloudCoverage: 7 },
  { id: 'obs-p8-11', paddockId: 'p8', date: '2025-01-14', ndvi: 0.20, evi: 0.12, ndwi: -0.17, cloudCoverage: 12 },
  { id: 'obs-p8-12', paddockId: 'p8', date: '2025-01-16', ndvi: 0.19, evi: 0.11, ndwi: -0.18, cloudCoverage: 10 },
]

export function getObservationsForPaddock(paddockId: string): ExtendedObservation[] {
  return observations.filter(o => o.paddockId === paddockId).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
}

export function getLatestObservation(paddockId: string): ExtendedObservation | undefined {
  const paddockObs = getObservationsForPaddock(paddockId)
  return paddockObs[paddockObs.length - 1]
}

export function calculateNdviTrend(paddockId: string): number {
  const obs = getObservationsForPaddock(paddockId)
  if (obs.length < 2) return 0
  
  // Calculate weekly change (last 7 days vs previous 7 days)
  const recent = obs.slice(-3)
  const earlier = obs.slice(-6, -3)
  
  if (recent.length === 0 || earlier.length === 0) return 0
  
  const recentAvg = recent.reduce((sum, o) => sum + o.ndvi, 0) / recent.length
  const earlierAvg = earlier.reduce((sum, o) => sum + o.ndvi, 0) / earlier.length
  
  return Number((recentAvg - earlierAvg).toFixed(3))
}
