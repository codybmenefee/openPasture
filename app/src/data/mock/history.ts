import type { HistoryEntry, PaddockPerformance } from '@/lib/types'
import { getPaddockById } from './paddocks'
import { generateSection } from '@/lib/sectionGenerator'

// Generate a history entry with section data
function createHistoryEntry(
  id: string,
  date: string,
  paddockId: string,
  paddockName: string,
  planStatus: 'pending' | 'approved' | 'modified',
  confidence: number,
  reasoning: string,
  wasModified: boolean,
  eventType: 'section_rotation' | 'paddock_transition',
  dayInPaddock?: number,
  totalDaysInPaddock?: number,
  fromPaddockId?: string,
  fromPaddockName?: string,
  userFeedback?: string
): HistoryEntry {
  const paddock = getPaddockById(paddockId)
  let sectionArea = paddock ? paddock.area / (totalDaysInPaddock || 4) : 3.5
  
  // Generate section geometry if this is a section rotation
  let sectionGeometry
  let sectionId
  if (eventType === 'section_rotation' && paddock && dayInPaddock && totalDaysInPaddock) {
    const section = generateSection({
      paddock,
      dayIndex: dayInPaddock - 1,
      totalDays: totalDaysInPaddock,
      seed: parseInt(id.replace(/\D/g, '')) || 1,
    })
    sectionGeometry = section.geometry
    sectionId = section.id
    sectionArea = section.targetArea
  }
  
  return {
    id,
    date,
    paddockId,
    paddockName,
    planStatus,
    confidence,
    reasoning,
    wasModified,
    userFeedback,
    eventType,
    sectionId,
    sectionArea,
    sectionGeometry,
    fromPaddockId,
    fromPaddockName,
    dayInPaddock,
    totalDaysInPaddock,
  }
}

// Past daily plans with section-level detail
export const historyEntries: HistoryEntry[] = [
  // ===== JANUARY 2026 (This Week / This Month) =====
  
  // Current paddock stay in East Ridge (p4) - day 2
  createHistoryEntry(
    'hist-016', '2026-01-16', 'p4', 'East Ridge',
    'pending', 87, 'Day 2 of 4 - Northern section with highest NDVI',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-015', '2026-01-15', 'p4', 'East Ridge',
    'approved', 82, 'Day 1 of 4 - Starting rotation in eastern zone',
    false, 'section_rotation', 1, 4
  ),
  
  // Transition from Creek Bend to East Ridge
  createHistoryEntry(
    'hist-014', '2026-01-14', 'p4', 'East Ridge',
    'approved', 85, 'Transitioning from Creek Bend after 4-day rotation',
    false, 'paddock_transition', undefined, undefined, 'p5', 'Creek Bend'
  ),
  
  // Creek Bend rotation (p5)
  createHistoryEntry(
    'hist-013', '2026-01-13', 'p5', 'Creek Bend',
    'approved', 91, 'Day 4 of 4 - Final section completing paddock coverage',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-012', '2026-01-12', 'p5', 'Creek Bend',
    'approved', 84, 'Day 3 of 4 - Southwest corner near water',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-011', '2026-01-11', 'p5', 'Creek Bend',
    'approved', 79, 'Day 2 of 4 - Central section',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-010', '2026-01-10', 'p5', 'Creek Bend',
    'modified', 72, 'Day 1 of 4 - User adjusted section boundary',
    true, 'section_rotation', 1, 4, undefined, undefined,
    'Ground too wet near creek edge'
  ),
  
  // Transition from West Slope to Creek Bend
  createHistoryEntry(
    'hist-009', '2026-01-09', 'p5', 'Creek Bend',
    'approved', 88, 'Transitioning from West Slope',
    false, 'paddock_transition', undefined, undefined, 'p6', 'West Slope'
  ),
  
  // West Slope rotation (p6) - Jan 4-8
  createHistoryEntry(
    'hist-008', '2026-01-08', 'p6', 'West Slope',
    'approved', 85, 'Day 5 of 5 - Completing rotation',
    false, 'section_rotation', 5, 5
  ),
  createHistoryEntry(
    'hist-007', '2026-01-07', 'p6', 'West Slope',
    'approved', 80, 'Day 4 of 5 - Upper slope section',
    false, 'section_rotation', 4, 5
  ),
  createHistoryEntry(
    'hist-006', '2026-01-06', 'p6', 'West Slope',
    'approved', 78, 'Day 3 of 5 - Mid-slope grazing',
    false, 'section_rotation', 3, 5
  ),
  createHistoryEntry(
    'hist-005', '2026-01-05', 'p6', 'West Slope',
    'approved', 75, 'Day 2 of 5 - Lower terrace',
    false, 'section_rotation', 2, 5
  ),
  createHistoryEntry(
    'hist-004', '2026-01-04', 'p6', 'West Slope',
    'approved', 82, 'Day 1 of 5 - Starting fresh rotation',
    false, 'section_rotation', 1, 5
  ),
  
  // Transition from South Valley to West Slope
  createHistoryEntry(
    'hist-003', '2026-01-03', 'p6', 'West Slope',
    'approved', 86, 'Moving herd to West Slope for winter grazing',
    false, 'paddock_transition', undefined, undefined, 'p1', 'South Valley'
  ),
  
  // South Valley (p1) - Jan 1-2
  createHistoryEntry(
    'hist-002', '2026-01-02', 'p1', 'South Valley',
    'approved', 83, 'Day 4 of 4 - Completing paddock',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-001', '2026-01-01', 'p1', 'South Valley',
    'approved', 81, 'Day 3 of 4 - New Year grazing continues',
    false, 'section_rotation', 3, 4
  ),

  // ===== DECEMBER 2025 (This Month continued) =====
  
  createHistoryEntry(
    'hist-d31', '2025-12-31', 'p1', 'South Valley',
    'approved', 79, 'Day 2 of 4 - Southern section',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-d30', '2025-12-30', 'p1', 'South Valley',
    'approved', 84, 'Day 1 of 4 - Starting end-of-year rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-d29', '2025-12-29', 'p1', 'South Valley',
    'approved', 88, 'Transitioning from North Flat',
    false, 'paddock_transition', undefined, undefined, 'p2', 'North Flat'
  ),
  
  // North Flat (p2) - Dec 25-28
  createHistoryEntry(
    'hist-d28', '2025-12-28', 'p2', 'North Flat',
    'approved', 86, 'Day 4 of 4 - Final section',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-d27', '2025-12-27', 'p2', 'North Flat',
    'approved', 82, 'Day 3 of 4 - Holiday grazing',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-d26', '2025-12-26', 'p2', 'North Flat',
    'modified', 68, 'Day 2 of 4 - Adjusted for holiday schedule',
    true, 'section_rotation', 2, 4, undefined, undefined,
    'Delayed move due to holiday'
  ),
  createHistoryEntry(
    'hist-d25', '2025-12-25', 'p2', 'North Flat',
    'approved', 77, 'Day 1 of 4 - Christmas rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-d24', '2025-12-24', 'p2', 'North Flat',
    'approved', 85, 'Transitioning from Top Block',
    false, 'paddock_transition', undefined, undefined, 'p3', 'Top Block'
  ),
  
  // Top Block (p3) - Dec 20-23
  createHistoryEntry(
    'hist-d23', '2025-12-23', 'p3', 'Top Block',
    'approved', 89, 'Day 4 of 4 - Completing block',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-d22', '2025-12-22', 'p3', 'Top Block',
    'approved', 84, 'Day 3 of 4 - Northern section',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-d21', '2025-12-21', 'p3', 'Top Block',
    'approved', 80, 'Day 2 of 4 - Winter solstice grazing',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-d20', '2025-12-20', 'p3', 'Top Block',
    'approved', 83, 'Day 1 of 4 - Starting Top Block rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-d19', '2025-12-19', 'p3', 'Top Block',
    'approved', 87, 'Transitioning from Creek Side',
    false, 'paddock_transition', undefined, undefined, 'p7', 'Creek Side'
  ),
  
  // Creek Side (p7) - Dec 15-18
  createHistoryEntry(
    'hist-d18', '2025-12-18', 'p7', 'Creek Side',
    'approved', 91, 'Day 4 of 4 - Excellent grazing conditions',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-d17', '2025-12-17', 'p7', 'Creek Side',
    'approved', 88, 'Day 3 of 4 - Near water access',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-d16', '2025-12-16', 'p7', 'Creek Side',
    'modified', 70, 'Day 2 of 4 - Adjusted for wet conditions',
    true, 'section_rotation', 2, 4, undefined, undefined,
    'Recent rain made lower section too muddy'
  ),
  createHistoryEntry(
    'hist-d15', '2025-12-15', 'p7', 'Creek Side',
    'approved', 78, 'Day 1 of 4 - Starting creek rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-d14', '2025-12-14', 'p7', 'Creek Side',
    'approved', 84, 'Transitioning from Lower Paddock',
    false, 'paddock_transition', undefined, undefined, 'p8', 'Lower Paddock'
  ),
  
  // Lower Paddock (p8) - Dec 10-13
  createHistoryEntry(
    'hist-d13', '2025-12-13', 'p8', 'Lower Paddock',
    'approved', 82, 'Day 4 of 4 - Completing rotation',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-d12', '2025-12-12', 'p8', 'Lower Paddock',
    'approved', 79, 'Day 3 of 4 - Southern strip',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-d11', '2025-12-11', 'p8', 'Lower Paddock',
    'approved', 76, 'Day 2 of 4 - Mid section',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-d10', '2025-12-10', 'p8', 'Lower Paddock',
    'approved', 80, 'Day 1 of 4 - Starting rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-d09', '2025-12-09', 'p8', 'Lower Paddock',
    'approved', 86, 'Transitioning from East Ridge',
    false, 'paddock_transition', undefined, undefined, 'p4', 'East Ridge'
  ),
  
  // East Ridge (p4) - Dec 5-8
  createHistoryEntry(
    'hist-d08', '2025-12-08', 'p4', 'East Ridge',
    'approved', 88, 'Day 4 of 4 - Final section',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-d07', '2025-12-07', 'p4', 'East Ridge',
    'approved', 85, 'Day 3 of 4 - Ridge line grazing',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-d06', '2025-12-06', 'p4', 'East Ridge',
    'approved', 81, 'Day 2 of 4 - Eastern slope',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-d05', '2025-12-05', 'p4', 'East Ridge',
    'approved', 83, 'Day 1 of 4 - Starting rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-d04', '2025-12-04', 'p4', 'East Ridge',
    'approved', 87, 'Transitioning from Creek Bend',
    false, 'paddock_transition', undefined, undefined, 'p5', 'Creek Bend'
  ),
  
  // Creek Bend (p5) - Dec 1-3
  createHistoryEntry(
    'hist-d03', '2025-12-03', 'p5', 'Creek Bend',
    'approved', 84, 'Day 3 of 3 - Quick rotation',
    false, 'section_rotation', 3, 3
  ),
  createHistoryEntry(
    'hist-d02', '2025-12-02', 'p5', 'Creek Bend',
    'approved', 80, 'Day 2 of 3 - Central area',
    false, 'section_rotation', 2, 3
  ),
  createHistoryEntry(
    'hist-d01', '2025-12-01', 'p5', 'Creek Bend',
    'approved', 82, 'Day 1 of 3 - Starting December rotation',
    false, 'section_rotation', 1, 3
  ),

  // ===== NOVEMBER 2025 (Last 3 Months) =====
  
  createHistoryEntry(
    'hist-n30', '2025-11-30', 'p5', 'Creek Bend',
    'approved', 85, 'Transitioning from West Slope',
    false, 'paddock_transition', undefined, undefined, 'p6', 'West Slope'
  ),
  
  // West Slope (p6) - Nov 26-29
  createHistoryEntry(
    'hist-n29', '2025-11-29', 'p6', 'West Slope',
    'approved', 87, 'Day 4 of 4 - Final section',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-n28', '2025-11-28', 'p6', 'West Slope',
    'modified', 65, 'Day 3 of 4 - Thanksgiving delay',
    true, 'section_rotation', 3, 4, undefined, undefined,
    'Delayed for holiday - combined with previous section'
  ),
  createHistoryEntry(
    'hist-n27', '2025-11-27', 'p6', 'West Slope',
    'approved', 79, 'Day 2 of 4 - Pre-holiday grazing',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-n26', '2025-11-26', 'p6', 'West Slope',
    'approved', 81, 'Day 1 of 4 - Starting rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-n25', '2025-11-25', 'p6', 'West Slope',
    'approved', 84, 'Transitioning from South Valley',
    false, 'paddock_transition', undefined, undefined, 'p1', 'South Valley'
  ),
  
  // South Valley (p1) - Nov 21-24
  createHistoryEntry(
    'hist-n24', '2025-11-24', 'p1', 'South Valley',
    'approved', 86, 'Day 4 of 4 - Completing rotation',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-n23', '2025-11-23', 'p1', 'South Valley',
    'approved', 82, 'Day 3 of 4 - Southern area',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-n22', '2025-11-22', 'p1', 'South Valley',
    'approved', 78, 'Day 2 of 4 - Central grazing',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-n21', '2025-11-21', 'p1', 'South Valley',
    'approved', 80, 'Day 1 of 4 - Starting rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-n20', '2025-11-20', 'p1', 'South Valley',
    'approved', 85, 'Transitioning from North Flat',
    false, 'paddock_transition', undefined, undefined, 'p2', 'North Flat'
  ),
  
  // North Flat (p2) - Nov 16-19
  createHistoryEntry(
    'hist-n19', '2025-11-19', 'p2', 'North Flat',
    'approved', 89, 'Day 4 of 4 - Excellent conditions',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-n18', '2025-11-18', 'p2', 'North Flat',
    'approved', 85, 'Day 3 of 4 - Northern edge',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-n17', '2025-11-17', 'p2', 'North Flat',
    'approved', 81, 'Day 2 of 4 - Flat area grazing',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-n16', '2025-11-16', 'p2', 'North Flat',
    'approved', 83, 'Day 1 of 4 - Starting rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-n15', '2025-11-15', 'p2', 'North Flat',
    'approved', 87, 'Transitioning from Top Block',
    false, 'paddock_transition', undefined, undefined, 'p3', 'Top Block'
  ),
  
  // Top Block (p3) - Nov 11-14
  createHistoryEntry(
    'hist-n14', '2025-11-14', 'p3', 'Top Block',
    'approved', 85, 'Day 4 of 4 - Completing block',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-n13', '2025-11-13', 'p3', 'Top Block',
    'approved', 82, 'Day 3 of 4 - Upper section',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-n12', '2025-11-12', 'p3', 'Top Block',
    'modified', 69, 'Day 2 of 4 - Adjusted boundaries',
    true, 'section_rotation', 2, 4, undefined, undefined,
    'Avoided rocky outcrop area'
  ),
  createHistoryEntry(
    'hist-n11', '2025-11-11', 'p3', 'Top Block',
    'approved', 79, 'Day 1 of 4 - Veterans Day rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-n10', '2025-11-10', 'p3', 'Top Block',
    'approved', 84, 'Transitioning from Creek Side',
    false, 'paddock_transition', undefined, undefined, 'p7', 'Creek Side'
  ),
  
  // Creek Side (p7) - Nov 6-9
  createHistoryEntry(
    'hist-n09', '2025-11-09', 'p7', 'Creek Side',
    'approved', 88, 'Day 4 of 4 - Final section',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-n08', '2025-11-08', 'p7', 'Creek Side',
    'approved', 84, 'Day 3 of 4 - Riparian buffer',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-n07', '2025-11-07', 'p7', 'Creek Side',
    'approved', 80, 'Day 2 of 4 - Water access area',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-n06', '2025-11-06', 'p7', 'Creek Side',
    'approved', 82, 'Day 1 of 4 - Starting rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-n05', '2025-11-05', 'p7', 'Creek Side',
    'approved', 86, 'Transitioning from Lower Paddock',
    false, 'paddock_transition', undefined, undefined, 'p8', 'Lower Paddock'
  ),
  
  // Lower Paddock (p8) - Nov 1-4
  createHistoryEntry(
    'hist-n04', '2025-11-04', 'p8', 'Lower Paddock',
    'approved', 84, 'Day 4 of 4 - Completing rotation',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-n03', '2025-11-03', 'p8', 'Lower Paddock',
    'approved', 80, 'Day 3 of 4 - Lower area',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-n02', '2025-11-02', 'p8', 'Lower Paddock',
    'approved', 76, 'Day 2 of 4 - Central strip',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-n01', '2025-11-01', 'p8', 'Lower Paddock',
    'approved', 78, 'Day 1 of 4 - Starting November rotation',
    false, 'section_rotation', 1, 4
  ),

  // ===== OCTOBER 2025 (Last 3 Months continued) =====
  
  createHistoryEntry(
    'hist-o31', '2025-10-31', 'p8', 'Lower Paddock',
    'approved', 83, 'Transitioning from East Ridge',
    false, 'paddock_transition', undefined, undefined, 'p4', 'East Ridge'
  ),
  
  // East Ridge (p4) - Oct 27-30
  createHistoryEntry(
    'hist-o30', '2025-10-30', 'p4', 'East Ridge',
    'approved', 87, 'Day 4 of 4 - Final October grazing',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-o29', '2025-10-29', 'p4', 'East Ridge',
    'approved', 84, 'Day 3 of 4 - Ridge section',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-o28', '2025-10-28', 'p4', 'East Ridge',
    'approved', 80, 'Day 2 of 4 - Eastern slope',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-o27', '2025-10-27', 'p4', 'East Ridge',
    'approved', 82, 'Day 1 of 4 - Starting rotation',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-o26', '2025-10-26', 'p4', 'East Ridge',
    'approved', 86, 'Transitioning from Creek Bend',
    false, 'paddock_transition', undefined, undefined, 'p5', 'Creek Bend'
  ),
  
  // Creek Bend (p5) - Oct 22-25
  createHistoryEntry(
    'hist-o25', '2025-10-25', 'p5', 'Creek Bend',
    'approved', 89, 'Day 4 of 4 - Completing rotation',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-o24', '2025-10-24', 'p5', 'Creek Bend',
    'approved', 85, 'Day 3 of 4 - Near creek',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-o23', '2025-10-23', 'p5', 'Creek Bend',
    'modified', 67, 'Day 2 of 4 - Adjusted for fallen tree',
    true, 'section_rotation', 2, 4, undefined, undefined,
    'Storm debris blocked planned section'
  ),
  createHistoryEntry(
    'hist-o22', '2025-10-22', 'p5', 'Creek Bend',
    'approved', 79, 'Day 1 of 4 - Post-rain grazing',
    false, 'section_rotation', 1, 4
  ),
  createHistoryEntry(
    'hist-o21', '2025-10-21', 'p5', 'Creek Bend',
    'approved', 84, 'Transitioning from West Slope',
    false, 'paddock_transition', undefined, undefined, 'p6', 'West Slope'
  ),
  
  // West Slope (p6) - Oct 17-20
  createHistoryEntry(
    'hist-o20', '2025-10-20', 'p6', 'West Slope',
    'approved', 86, 'Day 4 of 4 - Final section',
    false, 'section_rotation', 4, 4
  ),
  createHistoryEntry(
    'hist-o19', '2025-10-19', 'p6', 'West Slope',
    'approved', 82, 'Day 3 of 4 - Upper slope',
    false, 'section_rotation', 3, 4
  ),
  createHistoryEntry(
    'hist-o18', '2025-10-18', 'p6', 'West Slope',
    'approved', 78, 'Day 2 of 4 - Mid-slope area',
    false, 'section_rotation', 2, 4
  ),
  createHistoryEntry(
    'hist-o17', '2025-10-17', 'p6', 'West Slope',
    'approved', 81, 'Day 1 of 4 - Fall rotation start',
    false, 'section_rotation', 1, 4
  ),
]

// Paddock performance metrics
export const paddockPerformance: PaddockPerformance[] = [
  {
    paddockId: 'p4',
    paddockName: 'East Ridge',
    totalUses: 4,
    avgRestDays: 26,
    avgNdvi: 0.52,
    trend: 'up',
  },
  {
    paddockId: 'p2',
    paddockName: 'North Flat',
    totalUses: 5,
    avgRestDays: 21,
    avgNdvi: 0.48,
    trend: 'stable',
  },
  {
    paddockId: 'p5',
    paddockName: 'Creek Bend',
    totalUses: 4,
    avgRestDays: 24,
    avgNdvi: 0.44,
    trend: 'down',
  },
  {
    paddockId: 'p1',
    paddockName: 'South Valley',
    totalUses: 3,
    avgRestDays: 23,
    avgNdvi: 0.46,
    trend: 'up',
  },
  {
    paddockId: 'p6',
    paddockName: 'West Slope',
    totalUses: 4,
    avgRestDays: 22,
    avgNdvi: 0.45,
    trend: 'stable',
  },
  {
    paddockId: 'p3',
    paddockName: 'Top Block',
    totalUses: 3,
    avgRestDays: 25,
    avgNdvi: 0.42,
    trend: 'up',
  },
  {
    paddockId: 'p7',
    paddockName: 'Creek Side',
    totalUses: 3,
    avgRestDays: 28,
    avgNdvi: 0.50,
    trend: 'up',
  },
  {
    paddockId: 'p8',
    paddockName: 'Lower Paddock',
    totalUses: 4,
    avgRestDays: 20,
    avgNdvi: 0.40,
    trend: 'down',
  },
]

export function getHistoryByDateRange(startDate: string, endDate: string): HistoryEntry[] {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return historyEntries.filter(entry => {
    const date = new Date(entry.date)
    return date >= start && date <= end
  })
}

export function getHistoryStats(entries: HistoryEntry[] = historyEntries) {
  const total = entries.length
  const approved = entries.filter(e => e.planStatus === 'approved').length
  const modified = entries.filter(e => e.planStatus === 'modified').length
  const pending = entries.filter(e => e.planStatus === 'pending').length
  
  // Section-specific stats
  const sectionRotations = entries.filter(e => e.eventType === 'section_rotation').length
  const paddockTransitions = entries.filter(e => e.eventType === 'paddock_transition').length
  
  // Handle division by zero when all entries are pending or no entries
  const decidedCount = total - pending
  const approvalRate = decidedCount > 0 ? Math.round((approved / decidedCount) * 100) : 0
  const modificationRate = decidedCount > 0 ? Math.round((modified / decidedCount) * 100) : 0
  
  return {
    total,
    approved,
    modified,
    pending,
    sectionRotations,
    paddockTransitions,
    approvalRate,
    modificationRate,
  }
}

export function getSectionRotationsForPaddock(paddockId: string): HistoryEntry[] {
  return historyEntries.filter(
    e => e.paddockId === paddockId && e.eventType === 'section_rotation'
  )
}

export function getPaddockTransitions(): HistoryEntry[] {
  return historyEntries.filter(e => e.eventType === 'paddock_transition')
}
