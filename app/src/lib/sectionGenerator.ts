import type { Feature, Polygon, Position } from 'geojson'
import type { Section, Paddock, SectionAlternative } from './types'
import { calculateAreaHectares } from './geometry/geometryUtils'

/**
 * Section Generator
 * 
 * Generates procedural, plausible-looking section polygons within paddock boundaries.
 * These sections represent daily grazing allocations - oblong strips that the AI
 * would strategically draw based on NDVI, prior coverage, and herd size.
 * 
 * This is mock generation for the prototype - real implementation would use
 * satellite data and optimization algorithms.
 */

interface SectionParams {
  paddock: Paddock
  dayIndex: number // 0-based day within the paddock stay
  totalDays: number // Total planned days in this paddock
  targetAreaHectares?: number // Optional override for section size
  seed?: number // For reproducible generation
}

/**
 * Simple seeded random number generator for reproducible sections
 */
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

/**
 * Get the bounding box of a polygon
 */
function getBounds(polygon: Feature<Polygon>): { 
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number 
} {
  const coords = polygon.geometry.coordinates[0]
  let minLng = Infinity, maxLng = -Infinity
  let minLat = Infinity, maxLat = -Infinity
  
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  }
  
  return { minLng, maxLng, minLat, maxLat }
}

/**
 * Generate a strip-shaped section within a paddock
 * Sections are positioned based on day index to simulate progression across the paddock
 */
export function generateSection(params: SectionParams): Section {
  const { paddock, dayIndex, totalDays, targetAreaHectares, seed } = params
  const random = seededRandom(seed ?? dayIndex * 1000 + paddock.id.charCodeAt(1))
  
  const bounds = getBounds(paddock.geometry)
  const width = bounds.maxLng - bounds.minLng
  const height = bounds.maxLat - bounds.minLat
  
  // Calculate section size as fraction of paddock
  const desiredArea = targetAreaHectares ?? paddock.area / totalDays
  const areaFraction = desiredArea / paddock.area
  
  // Determine strip direction - alternate between horizontal and diagonal strips
  const isHorizontal = dayIndex % 2 === 0
  
  // Calculate strip dimensions
  // For oblong strips, width is about 3x the height
  const stripAspectRatio = 2.5 + random() * 1.5 // 2.5 to 4
  
  // Position the section based on day index to show progression
  const progressFraction = dayIndex / Math.max(totalDays - 1, 1)
  
  let sectionCoords: Position[]
  
  if (isHorizontal) {
    // Horizontal strip moving north to south
    const stripHeight = height * Math.sqrt(areaFraction / stripAspectRatio)
    const stripWidth = width * 0.8 + (random() * 0.15 * width) // 80-95% of paddock width
    
    // Position based on progress through paddock
    const yOffset = progressFraction * (height - stripHeight)
    const xOffset = (width - stripWidth) / 2 + (random() - 0.5) * width * 0.1
    
    const startLng = bounds.minLng + xOffset
    const startLat = bounds.maxLat - yOffset
    
    // Create slightly irregular strip shape
    const irregularity = 0.0001 * (random() - 0.5)
    
    sectionCoords = [
      [startLng, startLat],
      [startLng + stripWidth * 0.3, startLat + irregularity],
      [startLng + stripWidth * 0.7, startLat - irregularity],
      [startLng + stripWidth, startLat + irregularity * 0.5],
      [startLng + stripWidth, startLat - stripHeight],
      [startLng + stripWidth * 0.6, startLat - stripHeight - irregularity],
      [startLng + stripWidth * 0.3, startLat - stripHeight + irregularity],
      [startLng, startLat - stripHeight],
      [startLng, startLat], // Close the polygon
    ]
  } else {
    // Diagonal/angled strip
    const stripSize = Math.sqrt(areaFraction) * Math.max(width, height)
    
    // Position based on progress, alternating corners
    const cornerIndex = Math.floor(progressFraction * 2)
    const angle = (Math.PI / 6) + (random() * Math.PI / 6) // 30-60 degree angle
    
    let centerLng: number, centerLat: number
    
    if (cornerIndex === 0) {
      // Start from northwest, move southeast
      centerLng = bounds.minLng + width * (0.2 + progressFraction * 0.6)
      centerLat = bounds.maxLat - height * (0.2 + progressFraction * 0.3)
    } else {
      // Start from northeast, move southwest
      centerLng = bounds.maxLng - width * (0.2 + (progressFraction - 0.5) * 0.6)
      centerLat = bounds.maxLat - height * (0.5 + (progressFraction - 0.5) * 0.3)
    }
    
    const halfWidth = stripSize * 0.6
    const halfHeight = stripSize * 0.25
    
    // Create rotated rectangle
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    
    const corners: Position[] = [
      [-halfWidth, -halfHeight],
      [halfWidth, -halfHeight],
      [halfWidth, halfHeight],
      [-halfWidth, halfHeight],
    ]
    
    sectionCoords = corners.map(([x, y]) => [
      centerLng + (x * cos - y * sin),
      centerLat + (x * sin + y * cos),
    ])
    sectionCoords.push(sectionCoords[0]) // Close polygon
  }
  
  const sectionGeometry: Feature<Polygon> = {
    type: 'Feature',
    properties: {
      sectionDay: dayIndex + 1,
      paddockId: paddock.id,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [sectionCoords],
    },
  }
  
  // Generate reasoning for this section placement
  const actualArea = calculateAreaHectares(sectionGeometry)
  const reasoning = generateSectionReasoning(dayIndex, totalDays, actualArea, paddock)
  
  return {
    id: `section-${paddock.id}-day${dayIndex + 1}`,
    paddockId: paddock.id,
    date: '', // Will be set by caller
    geometry: sectionGeometry,
    targetArea: actualArea,
    reasoning,
  }
}

/**
 * Generate reasoning text for why this section was chosen
 */
function generateSectionReasoning(
  dayIndex: number, 
  totalDays: number, 
  targetArea: number,
  paddock: Paddock
): string[] {
  const reasons: string[] = []
  
  if (dayIndex === 0) {
    reasons.push(`Starting rotation in ${paddock.name} - highest NDVI zone selected`)
    reasons.push(`Target area of ${targetArea.toFixed(1)} hectares matches herd daily consumption`)
  } else if (dayIndex === totalDays - 1) {
    reasons.push(`Final section of ${paddock.name} rotation`)
    reasons.push('Completing coverage of remaining ungrazed area')
  } else {
    reasons.push(`Day ${dayIndex + 1} of ${totalDays} in ${paddock.name}`)
    reasons.push(`Section positioned to allow previous areas to begin recovery`)
  }
  
  // Add water access reasoning
  if (paddock.waterAccess) {
    reasons.push(`Section maintains access to ${paddock.waterAccess.toLowerCase()}`)
  }
  
  return reasons
}

/**
 * Generate a sequence of sections for an entire paddock stay
 */
export function generatePaddockStaySections(
  paddock: Paddock,
  totalDays: number,
  startDate: Date = new Date()
): Section[] {
  const sections: Section[] = []
  
  for (let day = 0; day < totalDays; day++) {
    const sectionDate = new Date(startDate)
    sectionDate.setDate(sectionDate.getDate() + day)
    
    const section = generateSection({
      paddock,
      dayIndex: day,
      totalDays,
      seed: paddock.id.charCodeAt(1) * 1000 + day,
    })
    
    section.date = sectionDate.toISOString().split('T')[0]
    sections.push(section)
  }
  
  return sections
}

/**
 * Calculate optimal number of days to spend in a paddock based on area and herd size
 */
export function calculatePaddockDays(
  paddockArea: number,
  dailyConsumptionHectares: number = 3.5
): number {
  return Math.max(2, Math.ceil(paddockArea / dailyConsumptionHectares))
}

/**
 * Generate alternative section options within the same paddock
 * These represent different polygon placements the AI could suggest
 */
export function generateSectionAlternatives(
  paddock: Paddock,
  dayIndex: number,
  totalDays: number,
  count: number = 2
): SectionAlternative[] {
  const alternatives: SectionAlternative[] = []
  const bounds = getBounds(paddock.geometry)
  const width = bounds.maxLng - bounds.minLng
  const height = bounds.maxLat - bounds.minLat
  
  for (let i = 0; i < count; i++) {
    // Use different seed to generate varied alternatives
    const altSeed = (dayIndex + 1) * 1000 + paddock.id.charCodeAt(1) + (i + 1) * 100
    const random = seededRandom(altSeed)
    
    // Calculate area similar to main section
    const desiredArea = paddock.area / totalDays
    const areaFraction = desiredArea / paddock.area
    
    // Alternative placement strategies
    let sectionCoords: Position[]
    let reasoning: string
    let confidenceDeduction: number
    
    if (i === 0) {
      // Alternative 1: Eastern portion - different position, same approach
      const stripHeight = height * Math.sqrt(areaFraction / 3)
      const stripWidth = width * 0.7
      
      const xOffset = width * 0.25 // Shift east
      const yOffset = dayIndex / Math.max(totalDays - 1, 1) * (height - stripHeight)
      
      const startLng = bounds.minLng + xOffset
      const startLat = bounds.maxLat - yOffset
      
      sectionCoords = [
        [startLng, startLat],
        [startLng + stripWidth, startLat],
        [startLng + stripWidth, startLat - stripHeight],
        [startLng, startLat - stripHeight],
        [startLng, startLat],
      ]
      
      reasoning = 'Eastern section - closer to water access'
      confidenceDeduction = 12 + Math.floor(random() * 8)
    } else {
      // Alternative 2: Smaller, more concentrated section
      const smallerArea = desiredArea * 0.85
      const smallerFraction = smallerArea / paddock.area
      const stripHeight = height * Math.sqrt(smallerFraction / 2)
      const stripWidth = width * 0.5
      
      const xOffset = random() * (width - stripWidth)
      const yOffset = (dayIndex / Math.max(totalDays - 1, 1)) * (height - stripHeight)
      
      const startLng = bounds.minLng + xOffset
      const startLat = bounds.maxLat - yOffset
      
      sectionCoords = [
        [startLng, startLat],
        [startLng + stripWidth, startLat + 0.0001],
        [startLng + stripWidth, startLat - stripHeight],
        [startLng + stripWidth * 0.5, startLat - stripHeight - 0.00005],
        [startLng, startLat - stripHeight],
        [startLng, startLat],
      ]
      
      reasoning = 'Smaller section - higher grass density zone'
      confidenceDeduction = 18 + Math.floor(random() * 10)
    }
    
    const geometry: Feature<Polygon> = {
      type: 'Feature',
      properties: {
        alternativeIndex: i + 1,
        paddockId: paddock.id,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [sectionCoords],
      },
    }
    const actualArea = calculateAreaHectares(geometry)
    
    // Confidence is relative to the primary recommendation
    // Primary is always highest, alternatives are lower
    const baseConfidence = 87 // Assumed primary confidence
    const confidence = Math.max(45, baseConfidence - confidenceDeduction)
    
    alternatives.push({
      id: `alt-${paddock.id}-day${dayIndex + 1}-opt${i + 1}`,
      geometry,
      targetArea: actualArea,
      confidence,
      reasoning,
    })
  }
  
  return alternatives
}
