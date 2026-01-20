import type { Plan, Section } from '@/lib/types'
import { getPaddockById } from './paddocks'
import { generateSection, generatePaddockStaySections, calculatePaddockDays } from '@/lib/sectionGenerator'

// Get the current paddock (East Ridge - where livestock are)
const currentPaddock = getPaddockById('p4')!

// Calculate how many days we'll spend in this paddock
const totalDaysInPaddock = calculatePaddockDays(currentPaddock.area)

// We're on day 2 of the rotation in East Ridge
const currentDayInPaddock = 2

// Generate today's section
const todaysSection: Section = generateSection({
  paddock: currentPaddock,
  dayIndex: currentDayInPaddock - 1, // 0-indexed
  totalDays: totalDaysInPaddock,
})
todaysSection.date = new Date().toISOString().split('T')[0]

// Generate previous sections (days 1 was already grazed)
const previousSections: Section[] = []
for (let day = 0; day < currentDayInPaddock - 1; day++) {
  const prevDate = new Date()
  prevDate.setDate(prevDate.getDate() - (currentDayInPaddock - 1 - day))
  
  const section = generateSection({
    paddock: currentPaddock,
    dayIndex: day,
    totalDays: totalDaysInPaddock,
  })
  section.date = prevDate.toISOString().split('T')[0]
  previousSections.push(section)
}

// Generate section alternatives - other polygon options within the same paddock
// Temporarily disabled - uncomment when needed
// const sectionAlternatives = generateSectionAlternatives(
//   currentPaddock,
//   currentDayInPaddock - 1,
//   totalDaysInPaddock,
//   2 // Generate 2 alternatives
// )

export const todaysPlan: Plan = {
  id: 'plan-2025-01-16',
  date: new Date().toISOString().split('T')[0],
  currentPaddockId: 'p4', // East Ridge - currently grazing
  recommendedPaddockId: 'p4', // Stay in current paddock
  confidence: 87,
  reasoning: [
    `Day ${currentDayInPaddock} of ${totalDaysInPaddock} in East Ridge`,
    'NDVI: 0.52 (healthy, graze-ready)',
    'Section selected for optimal grass density',
    'Previous section recovering well',
  ],
  status: 'pending',
  briefNarrative: `Day ${currentDayInPaddock} of your rotation in East Ridge. Today's section covers ${todaysSection.targetArea.toFixed(1)} hectares in the northern portion where grass density is highest. ${totalDaysInPaddock - currentDayInPaddock} days remaining before transitioning to the next paddock.`,
  
  // Section-based grazing fields
  daysInCurrentPaddock: currentDayInPaddock,
  totalDaysPlanned: totalDaysInPaddock,
  recommendedSection: null as unknown as Section,
  isPaddockTransition: false,
  previousSections: [],
  
  // Section alternatives - other polygon options within same paddock
  sectionAlternatives: [],
  paddockAlternatives: [], // No paddock alternatives when not transitioning
}

// Alternative plan for when it's time to transition paddocks
const nextPaddock = getPaddockById('p2')!
const nextPaddockDays = calculatePaddockDays(nextPaddock.area)

export const transitionPlan: Plan = {
  id: 'plan-transition',
  date: new Date().toISOString().split('T')[0],
  currentPaddockId: 'p4', // East Ridge
  recommendedPaddockId: 'p2', // North Flat
  confidence: 84,
  reasoning: [
    'East Ridge rotation complete after 4 days',
    'North Flat has recovered with NDVI 0.48',
    '19 days rest exceeds minimum threshold',
    'Water access via stream on west side',
  ],
  status: 'pending',
  briefNarrative: 'Time to move! East Ridge rotation is complete. North Flat has fully recovered and is ready for grazing. The stream on the west side provides excellent water access for the herd.',
  
  // Section-based grazing fields for transition
  daysInCurrentPaddock: totalDaysInPaddock,
  totalDaysPlanned: totalDaysInPaddock,
  recommendedSection: generateSection({
    paddock: nextPaddock,
    dayIndex: 0,
    totalDays: nextPaddockDays,
  }),
  isPaddockTransition: true,
  nextPaddockId: 'p2',
  previousSections: generatePaddockStaySections(currentPaddock, totalDaysInPaddock),
  
  // For paddock transitions, show paddock alternatives instead of section alternatives
  sectionAlternatives: [],
  paddockAlternatives: [
    { paddockId: 'p7', confidence: 72 },
    { paddockId: 'p3', confidence: 58 },
  ],
}

export function getFormattedDate(): string {
  const now = new Date()
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}
