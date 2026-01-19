import type { GrazingEvent, PaddockStay } from '@/lib/types'
import { getPaddockById } from './paddocks'
import { generatePaddockStaySections } from '@/lib/sectionGenerator'

// Generate section geometries for historical grazing events
function generateEventWithSections(
  id: string,
  paddockId: string,
  date: string,
  duration: number,
  entryNdvi: number,
  exitNdvi: number,
  dayIndex: number = 0
): GrazingEvent {
  const paddock = getPaddockById(paddockId)
  if (!paddock) {
    return { id, paddockId, date, duration, entryNdvi, exitNdvi }
  }
  
  // Generate a section geometry for this event
  const sections = generatePaddockStaySections(paddock, duration, new Date(date))
  const sectionForDay = sections[Math.min(dayIndex, sections.length - 1)]
  
  return {
    id,
    paddockId,
    date,
    duration,
    entryNdvi,
    exitNdvi,
    sectionGeometry: sectionForDay?.geometry,
  }
}

// Historical grazing events per paddock with section geometries
export const grazingHistory: GrazingEvent[] = [
  // East Ridge (p4)
  generateEventWithSections('ge-p4-1', 'p4', '2024-12-19', 3, 0.58, 0.32, 0),
  generateEventWithSections('ge-p4-2', 'p4', '2024-11-24', 4, 0.55, 0.28, 1),
  generateEventWithSections('ge-p4-3', 'p4', '2024-10-30', 3, 0.52, 0.30, 0),
  generateEventWithSections('ge-p4-4', 'p4', '2024-10-02', 3, 0.50, 0.29, 2),

  // South Valley (p1)
  generateEventWithSections('ge-p1-1', 'p1', '2025-01-02', 3, 0.48, 0.18, 0),
  generateEventWithSections('ge-p1-2', 'p1', '2024-12-08', 4, 0.52, 0.22, 1),
  generateEventWithSections('ge-p1-3', 'p1', '2024-11-12', 3, 0.50, 0.25, 0),

  // North Flat (p2)
  generateEventWithSections('ge-p2-1', 'p2', '2024-12-28', 3, 0.55, 0.30, 0),
  generateEventWithSections('ge-p2-2', 'p2', '2024-12-02', 4, 0.52, 0.28, 1),
  generateEventWithSections('ge-p2-3', 'p2', '2024-11-06', 3, 0.48, 0.26, 2),
  generateEventWithSections('ge-p2-4', 'p2', '2024-10-10', 4, 0.50, 0.24, 0),
  generateEventWithSections('ge-p2-5', 'p2', '2024-09-14', 3, 0.46, 0.22, 1),

  // Top Block (p3)
  generateEventWithSections('ge-p3-1', 'p3', '2024-12-31', 3, 0.50, 0.28, 0),
  generateEventWithSections('ge-p3-2', 'p3', '2024-12-05', 4, 0.48, 0.25, 1),
  generateEventWithSections('ge-p3-3', 'p3', '2024-11-08', 3, 0.45, 0.24, 0),

  // Creek Bend (p5)
  generateEventWithSections('ge-p5-1', 'p5', '2025-01-13', 3, 0.55, 0.22, 0),
  generateEventWithSections('ge-p5-2', 'p5', '2024-12-18', 4, 0.52, 0.26, 1),
  generateEventWithSections('ge-p5-3', 'p5', '2024-11-22', 3, 0.50, 0.28, 2),
  generateEventWithSections('ge-p5-4', 'p5', '2024-10-26', 3, 0.48, 0.25, 0),

  // West Slope (p6)
  generateEventWithSections('ge-p6-1', 'p6', '2025-01-04', 4, 0.52, 0.28, 0),
  generateEventWithSections('ge-p6-2', 'p6', '2024-12-10', 3, 0.50, 0.26, 1),
  generateEventWithSections('ge-p6-3', 'p6', '2024-11-14', 4, 0.48, 0.24, 0),
  generateEventWithSections('ge-p6-4', 'p6', '2024-10-18', 3, 0.46, 0.22, 2),

  // Creek Side (p7)
  generateEventWithSections('ge-p7-1', 'p7', '2024-12-19', 4, 0.58, 0.30, 0),
  generateEventWithSections('ge-p7-2', 'p7', '2024-11-24', 3, 0.54, 0.28, 1),
  generateEventWithSections('ge-p7-3', 'p7', '2024-10-28', 4, 0.52, 0.26, 0),

  // Lower Paddock (p8)
  generateEventWithSections('ge-p8-1', 'p8', '2025-01-11', 5, 0.52, 0.19, 0),
  generateEventWithSections('ge-p8-2', 'p8', '2024-12-14', 4, 0.50, 0.24, 1),
  generateEventWithSections('ge-p8-3', 'p8', '2024-11-16', 5, 0.48, 0.22, 2),
  generateEventWithSections('ge-p8-4', 'p8', '2024-10-20', 4, 0.46, 0.20, 0),
]

// Paddock stays - multi-day rotations with all sections
export function generatePaddockStays(): PaddockStay[] {
  const stays: PaddockStay[] = []
  
  // Group events by paddock and generate complete stays
  const paddockIds = ['p4', 'p1', 'p2', 'p3', 'p5', 'p6', 'p7', 'p8']
  
  paddockIds.forEach(paddockId => {
    const paddock = getPaddockById(paddockId)
    if (!paddock) return
    
    const events = grazingHistory.filter(e => e.paddockId === paddockId)
    
    events.forEach((event, index) => {
      const entryDate = new Date(event.date)
      const exitDate = new Date(entryDate)
      exitDate.setDate(exitDate.getDate() + event.duration)
      
      const sections = generatePaddockStaySections(paddock, event.duration, entryDate)
      
      stays.push({
        id: `stay-${paddockId}-${index}`,
        paddockId,
        paddockName: paddock.name,
        entryDate: entryDate.toISOString().split('T')[0],
        exitDate: exitDate.toISOString().split('T')[0],
        sections,
        totalArea: sections.reduce((sum, s) => sum + s.targetArea, 0),
      })
    })
  })
  
  // Sort by entry date descending
  return stays.sort((a, b) => 
    new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
  )
}

export const paddockStays = generatePaddockStays()

export function getGrazingHistoryForPaddock(paddockId: string): GrazingEvent[] {
  return grazingHistory
    .filter(e => e.paddockId === paddockId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getRecentGrazingEvents(limit: number = 10): GrazingEvent[] {
  return [...grazingHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export function getPaddockStaysForPaddock(paddockId: string): PaddockStay[] {
  return paddockStays.filter(s => s.paddockId === paddockId)
}

export function getCurrentPaddockStay(): PaddockStay | undefined {
  // Return the most recent stay (which might still be ongoing)
  const currentPaddock = getPaddockById('p4')! // East Ridge
  
  const today = new Date()
  const entryDate = new Date(today)
  entryDate.setDate(entryDate.getDate() - 1) // Started yesterday

  const sections = generatePaddockStaySections(currentPaddock, 2, entryDate) // 2 days so far
  
  return {
    id: 'stay-current',
    paddockId: 'p4',
    paddockName: 'East Ridge',
    entryDate: entryDate.toISOString().split('T')[0],
    sections,
    totalArea: sections.reduce((sum, section) => sum + section.targetArea, 0),
  }
}
