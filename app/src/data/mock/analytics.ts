import type { 
  FarmMetrics, 
  RotationEntry, 
  FarmNdviTrend, 
  RecommendationAccuracy,
  MovementMetrics,
  GrazingStock,
} from '@/lib/types'

export const farmMetrics: FarmMetrics = {
  grazingEventsCount: 12,
  grazingEventsTrend: 15,
  avgRestPeriod: 24,
  avgRestPeriodChange: -2,
  utilizationRate: 78,
  utilizationTrend: 5,
  healthScore: 'B+',
  healthTrend: 'stable',
}

// Section-level metrics
export interface SectionMetrics {
  totalSections: number
  avgSectionSize: number
  avgSectionsPerPaddock: number
  paddockUtilization: number // % of paddock area typically covered
}

export const sectionMetrics: SectionMetrics = {
  totalSections: 47,
  avgSectionSize: 3.8,
  avgSectionsPerPaddock: 4.2,
  paddockUtilization: 92, // 92% of paddock area covered before transition
}

// Extended rotation entry with section counts
export interface ExtendedRotationEntry extends RotationEntry {
  sectionCounts: number[] // Number of sections grazed per week (0 if not grazed)
}

// Weekly rotation data for the last 6 weeks with section granularity
export const rotationData: ExtendedRotationEntry[] = [
  {
    paddockId: 'p4',
    paddockName: 'East Ridge',
    weeklyData: [true, false, false, true, false, false],
    sectionCounts: [4, 0, 0, 3, 0, 0],
  },
  {
    paddockId: 'p2',
    paddockName: 'North Flat',
    weeklyData: [false, true, false, false, true, false],
    sectionCounts: [0, 4, 0, 0, 5, 0],
  },
  {
    paddockId: 'p5',
    paddockName: 'Creek Bend',
    weeklyData: [false, false, true, false, false, true],
    sectionCounts: [0, 0, 4, 0, 0, 4],
  },
  {
    paddockId: 'p1',
    paddockName: 'South Valley',
    weeklyData: [true, false, false, true, false, false],
    sectionCounts: [5, 0, 0, 4, 0, 0],
  },
  {
    paddockId: 'p6',
    paddockName: 'West Slope',
    weeklyData: [false, true, false, false, true, false],
    sectionCounts: [0, 5, 0, 0, 4, 0],
  },
  {
    paddockId: 'p3',
    paddockName: 'Top Block',
    weeklyData: [false, false, true, false, false, false],
    sectionCounts: [0, 0, 3, 0, 0, 0],
  },
  {
    paddockId: 'p7',
    paddockName: 'Creek Side',
    weeklyData: [false, false, false, true, false, true],
    sectionCounts: [0, 0, 0, 6, 0, 5],
  },
  {
    paddockId: 'p8',
    paddockName: 'Lower Paddock',
    weeklyData: [true, false, true, false, true, false],
    sectionCounts: [7, 0, 6, 0, 7, 0],
  },
]

// Paddock utilization rates (% of paddock covered before moving)
export interface PaddockUtilization {
  paddockId: string
  paddockName: string
  avgUtilization: number // percentage
  avgSections: number
  trend: 'up' | 'down' | 'stable'
}

export const paddockUtilization: PaddockUtilization[] = [
  { paddockId: 'p4', paddockName: 'East Ridge', avgUtilization: 95, avgSections: 4, trend: 'stable' },
  { paddockId: 'p2', paddockName: 'North Flat', avgUtilization: 88, avgSections: 4, trend: 'up' },
  { paddockId: 'p5', paddockName: 'Creek Bend', avgUtilization: 85, avgSections: 4, trend: 'down' },
  { paddockId: 'p1', paddockName: 'South Valley', avgUtilization: 92, avgSections: 5, trend: 'stable' },
  { paddockId: 'p6', paddockName: 'West Slope', avgUtilization: 90, avgSections: 5, trend: 'up' },
  { paddockId: 'p3', paddockName: 'Top Block', avgUtilization: 78, avgSections: 3, trend: 'down' },
  { paddockId: 'p7', paddockName: 'Creek Side', avgUtilization: 94, avgSections: 6, trend: 'up' },
  { paddockId: 'p8', paddockName: 'Lower Paddock', avgUtilization: 96, avgSections: 7, trend: 'stable' },
]

// Farm-wide NDVI trend over time (monthly averages)
export const farmNdviTrend: FarmNdviTrend[] = [
  { date: '2024-10-01', ndvi: 0.32 },
  { date: '2024-10-15', ndvi: 0.35 },
  { date: '2024-11-01', ndvi: 0.38 },
  { date: '2024-11-15', ndvi: 0.42 },
  { date: '2024-12-01', ndvi: 0.45 },
  { date: '2024-12-15', ndvi: 0.44 },
  { date: '2025-01-01', ndvi: 0.46 },
  { date: '2025-01-16', ndvi: 0.48 },
]

export const recommendationAccuracy: RecommendationAccuracy = {
  approvedAsIs: 85,
  modified: 12,
  rejected: 3,
}

export function getWeekLabels(): string[] {
  const labels: string[] = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (i * 7))
    labels.push(`Wk ${6 - i}`)
  }
  
  return labels
}

// Movement metrics (section rotations + paddock transitions)
export const movementMetrics: MovementMetrics = {
  ytd: 47, // Total movements since Jan 1
  ytdTrend: 12, // 12% more than same period last year
  mtd: 8, // Movements this month
  mtdTrend: -5, // 5% fewer than same period last month
  currentPaddock: 3, // Day 3 in current paddock
  currentPaddockTotal: 5, // 5 days planned total
}

// Grazing Stock (Pasture Savings Account)
export const grazingStock: GrazingStock = {
  farmTotalDays: 42,
  farmCapacityPercent: 70,
  farmStatus: 'healthy',
  farmTrend: 'stable',
  lastUpdated: '2026-01-16',
  assumptionNote: 'Assumes zero precipitation and growth stall from today',
  byPaddock: [
    {
      paddockId: 'p4',
      paddockName: 'East Ridge',
      reserveDays: 12,
      status: 'abundant',
      trend: 'up',
      biomassEstimate: 2400, // kg/ha
      dailyConsumption: 200, // kg/ha per day
    },
    {
      paddockId: 'p2',
      paddockName: 'North Flat',
      reserveDays: 8,
      status: 'healthy',
      trend: 'stable',
      biomassEstimate: 1600,
      dailyConsumption: 200,
    },
    {
      paddockId: 'p5',
      paddockName: 'Creek Bend',
      reserveDays: 4,
      status: 'low',
      trend: 'down',
      biomassEstimate: 800,
      dailyConsumption: 200,
    },
    {
      paddockId: 'p1',
      paddockName: 'South Valley',
      reserveDays: 6,
      status: 'healthy',
      trend: 'stable',
      biomassEstimate: 1200,
      dailyConsumption: 200,
    },
    {
      paddockId: 'p6',
      paddockName: 'West Slope',
      reserveDays: 3,
      status: 'critical',
      trend: 'down',
      biomassEstimate: 600,
      dailyConsumption: 200,
    },
    {
      paddockId: 'p3',
      paddockName: 'Top Block',
      reserveDays: 5,
      status: 'low',
      trend: 'stable',
      biomassEstimate: 1000,
      dailyConsumption: 200,
    },
    {
      paddockId: 'p7',
      paddockName: 'Creek Side',
      reserveDays: 2,
      status: 'critical',
      trend: 'down',
      biomassEstimate: 400,
      dailyConsumption: 200,
    },
    {
      paddockId: 'p8',
      paddockName: 'Lower Paddock',
      reserveDays: 2,
      status: 'critical',
      trend: 'stable',
      biomassEstimate: 400,
      dailyConsumption: 200,
    },
  ],
}
