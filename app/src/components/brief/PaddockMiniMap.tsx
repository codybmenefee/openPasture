import { useMemo } from 'react'
import { useGeometry } from '@/lib/geometry'
import type { Paddock, Section, SectionAlternative } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PaddockMiniMapProps {
  currentPaddockId?: string
  targetPaddockId?: string
  highlightedPaddockId?: string
  size?: 'sm' | 'md' | 'lg' | 'full'
  showLabels?: boolean
  className?: string
  // Section-specific props
  section?: Section
  previousSections?: Section[]
  // Section alternatives
  sectionAlternatives?: SectionAlternative[]
  selectedAlternativeId?: string
}

const statusColors: Record<Paddock['status'], string> = {
  ready: '#22c55e',
  almost_ready: '#f59e0b',
  recovering: '#6b7280',
  grazed: '#ef4444',
}

const statusColorsLight: Record<Paddock['status'], string> = {
  ready: '#86efac',
  almost_ready: '#fcd34d',
  recovering: '#d1d5db',
  grazed: '#fca5a5',
}

export function PaddockMiniMap({
  currentPaddockId,
  targetPaddockId,
  highlightedPaddockId,
  size = 'md',
  showLabels = false,
  className,
  section,
  previousSections = [],
  sectionAlternatives = [],
  selectedAlternativeId,
}: PaddockMiniMapProps) {
  const { paddocks, getPaddockById } = useGeometry()
  
  // Check if we're in section view mode (focus on single paddock)
  const sectionViewMode = section && currentPaddockId === targetPaddockId
  const focusPaddock = sectionViewMode ? getPaddockById(currentPaddockId!) : null

  // Calculate bounds and normalize coordinates
  // When in section view mode, focus only on the current paddock
  const { normalizedPaddocks, viewBox, paddockCenters, normalizeFn, focusPaddockPath, svgWidth, svgHeight } = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    if (sectionViewMode && focusPaddock) {
      // Focus bounds on just the current paddock - sections may overflow but that's ok
      const coords = (focusPaddock.geometry.geometry as GeoJSON.Polygon).coordinates[0]
      coords.forEach(([lng, lat]) => {
        minX = Math.min(minX, lng)
        maxX = Math.max(maxX, lng)
        minY = Math.min(minY, lat)
        maxY = Math.max(maxY, lat)
      })
    } else {
      // Find bounds from all paddock coordinates
      paddocks.forEach(p => {
        const coords = (p.geometry.geometry as GeoJSON.Polygon).coordinates[0]
        coords.forEach(([lng, lat]) => {
          minX = Math.min(minX, lng)
          maxX = Math.max(maxX, lng)
          minY = Math.min(minY, lat)
          maxY = Math.max(maxY, lat)
        })
      })
    }

    const width = maxX - minX
    const height = maxY - minY
    const padding = 0.02 // Minimal padding for full bleed
    const paddedWidth = width * (1 + padding * 2)
    const paddedHeight = height * (1 + padding * 2)
    
    // Calculate aspect ratio for viewBox (use actual content proportions)
    const aspectRatio = paddedWidth / paddedHeight
    const svgWidth = 100
    const svgHeight = 100 / aspectRatio

    // Normalize to SVG coordinates (flip Y for proper orientation)
    const normalize = (lng: number, lat: number): [number, number] => {
      const x = ((lng - minX + width * padding) / paddedWidth) * svgWidth
      const y = ((maxY - lat + height * padding) / paddedHeight) * svgHeight
      return [x, y]
    }

    const centers: Record<string, [number, number]> = {}

    const normalized = paddocks.map(p => {
      const coords = (p.geometry.geometry as GeoJSON.Polygon).coordinates[0]
      const normalizedCoords = coords.map(([lng, lat]) => normalize(lng, lat))
      
      // Calculate center
      const centerX = normalizedCoords.reduce((sum, [x]) => sum + x, 0) / normalizedCoords.length
      const centerY = normalizedCoords.reduce((sum, [, y]) => sum + y, 0) / normalizedCoords.length
      centers[p.id] = [centerX, centerY]

      return {
        ...p,
        svgPath: `M ${normalizedCoords.map(([x, y]) => `${x},${y}`).join(' L ')} Z`,
      }
    })

    // Generate focus paddock path separately for section view
    let focusPath = ''
    if (sectionViewMode && focusPaddock) {
      const coords = (focusPaddock.geometry.geometry as GeoJSON.Polygon).coordinates[0]
      const normalizedCoords = coords.map(([lng, lat]) => normalize(lng, lat))
      focusPath = `M ${normalizedCoords.map(([x, y]) => `${x},${y}`).join(' L ')} Z`
    }

    return {
      normalizedPaddocks: normalized,
      viewBox: `0 0 ${svgWidth} ${svgHeight}`,
      paddockCenters: centers,
      normalizeFn: normalize,
      focusPaddockPath: focusPath,
      svgWidth,
      svgHeight,
    }
  }, [sectionViewMode, focusPaddock])

  // Normalize section geometry to SVG path
  const normalizeSection = useMemo(() => {
    return (sec: Section): string => {
      const coords = sec.geometry.geometry.coordinates[0]
      const normalizedCoords = coords.map(([lng, lat]) => normalizeFn(lng, lat))
      return `M ${normalizedCoords.map(([x, y]) => `${x},${y}`).join(' L ')} Z`
    }
  }, [normalizeFn])

  // Normalize alternative section geometry to SVG path
  const normalizeAlternative = useMemo(() => {
    return (alt: SectionAlternative): string => {
      const coords = alt.geometry.geometry.coordinates[0]
      const normalizedCoords = coords.map(([lng, lat]) => normalizeFn(lng, lat))
      return `M ${normalizedCoords.map(([x, y]) => `${x},${y}`).join(' L ')} Z`
    }
  }, [normalizeFn])

  // Calculate center of a section for labeling
  const getSectionCenter = useMemo(() => {
    return (sec: Section): [number, number] => {
      const coords = sec.geometry.geometry.coordinates[0]
      const normalizedCoords = coords.map(([lng, lat]) => normalizeFn(lng, lat))
      const centerX = normalizedCoords.reduce((sum, [x]) => sum + x, 0) / normalizedCoords.length
      const centerY = normalizedCoords.reduce((sum, [, y]) => sum + y, 0) / normalizedCoords.length
      return [centerX, centerY]
    }
  }, [normalizeFn])

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-56 h-56',
    full: 'w-full aspect-[3/2]',
  }

  const currentPaddock = currentPaddockId ? getPaddockById(currentPaddockId) : undefined
  const targetPaddock = targetPaddockId ? getPaddockById(targetPaddockId) : undefined

  // Arrow path calculation (only for paddock transitions)
  const arrowPath = useMemo(() => {
    if (!currentPaddockId || !targetPaddockId || currentPaddockId === targetPaddockId) return null
    const from = paddockCenters[currentPaddockId]
    const to = paddockCenters[targetPaddockId]
    if (!from || !to) return null

    // Calculate direction and shorten the line
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    const len = Math.sqrt(dx * dx + dy * dy)
    const unitX = dx / len
    const unitY = dy / len

    // Start 8% from current center, end 12% from target center
    const startX = from[0] + unitX * 8
    const startY = from[1] + unitY * 8
    const endX = to[0] - unitX * 10
    const endY = to[1] - unitY * 10

    return { startX, startY, endX, endY, unitX, unitY }
  }, [currentPaddockId, targetPaddockId, paddockCenters])

  // Get yesterday's section (most recent in previousSections)
  const yesterdaySection = previousSections.length > 0 
    ? previousSections[previousSections.length - 1] 
    : null
  const olderSections = previousSections.slice(0, -1)

  return (
    <div className={cn('relative border border-border rounded-md overflow-hidden', sizeClasses[size], className)}>
      <svg viewBox={viewBox} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Full background fill */}
        <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="#f5f5f5" className="dark:fill-zinc-800" />
        {/* Define markers, filters, and clip path */}
        <defs>
          {/* Clip path to contain content within viewBox */}
          <clipPath id="viewbox-clip">
            <rect x="0" y="0" width={svgWidth} height={svgHeight} />
          </clipPath>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="6"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
          </marker>
          <marker
            id="arrowhead-dark"
            markerWidth="8"
            markerHeight="6"
            refX="6"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#4ade80" />
          </marker>
          {/* Glow filter for target */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Hatching pattern for current section */}
          <pattern id="section-hatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#22c55e" strokeWidth="1" />
          </pattern>
          {/* Pattern for yesterday's section */}
          <pattern id="yesterday-hatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#f59e0b" strokeWidth="0.8" opacity="0.7" />
          </pattern>
          {/* Pattern for older grazed sections */}
          <pattern id="grazed-hatch" patternUnits="userSpaceOnUse" width="3" height="3">
            <path d="M-1,1 l2,-2 M0,3 l3,-3 M2,4 l2,-2" stroke="#6b7280" strokeWidth="0.5" opacity="0.5" />
          </pattern>
          {/* Pattern for alternative sections */}
          <pattern id="alt-hatch" patternUnits="userSpaceOnUse" width="5" height="5">
            <path d="M0,5 l5,-5 M-2,2 l4,-4 M3,7 l4,-4" stroke="#3b82f6" strokeWidth="0.8" opacity="0.5" />
          </pattern>
        </defs>

        {/* Section View Mode: Focus on just the current paddock */}
        {sectionViewMode && focusPaddock ? (
          <g clipPath="url(#viewbox-clip)">
            {/* Paddock outline (background) */}
            <path
              d={focusPaddockPath}
              fill="#f5f5f5"
              stroke="#d4d4d4"
              strokeWidth="1"
              className="dark:fill-zinc-800 dark:stroke-zinc-600"
            />

            {/* Ungrazed area indicator (remaining paddock) */}
            <path
              d={focusPaddockPath}
              fill="none"
              stroke="#a3a3a3"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              className="dark:stroke-zinc-500"
            />

            {/* Older grazed sections (before yesterday) */}
            {olderSections.map((prevSection, index) => (
              <path
                key={prevSection.id || `older-${index}`}
                d={normalizeSection(prevSection)}
                fill="#9ca3af"
                fillOpacity="0.3"
                stroke="#6b7280"
                strokeWidth="0.5"
                className="transition-all duration-300"
              />
            ))}

            {/* Yesterday's section - highlighted distinctly */}
            {yesterdaySection && (
              <g>
                <path
                  d={normalizeSection(yesterdaySection)}
                  fill="#f59e0b"
                  fillOpacity="0.35"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  className="transition-all duration-300"
                />
                <path
                  d={normalizeSection(yesterdaySection)}
                  fill="url(#yesterday-hatch)"
                  fillOpacity="0.4"
                  stroke="none"
                />
              </g>
            )}

            {/* Alternative sections (shown when expanded) */}
            {sectionAlternatives.map((alt) => (
              <g key={alt.id} className={selectedAlternativeId === alt.id ? "" : "opacity-60"}>
                <path
                  d={normalizeAlternative(alt)}
                  fill={selectedAlternativeId === alt.id ? "#3b82f6" : "#93c5fd"}
                  fillOpacity={selectedAlternativeId === alt.id ? 0.5 : 0.25}
                  stroke={selectedAlternativeId === alt.id ? "#3b82f6" : "#60a5fa"}
                  strokeWidth={selectedAlternativeId === alt.id ? 1.5 : 1}
                  strokeDasharray={selectedAlternativeId === alt.id ? "none" : "3,2"}
                  className="transition-all duration-300"
                />
                {selectedAlternativeId === alt.id && (
                  <path
                    d={normalizeAlternative(alt)}
                    fill="url(#alt-hatch)"
                    fillOpacity="0.3"
                    stroke="none"
                  />
                )}
              </g>
            ))}

            {/* Today's section - prominently highlighted (only if no alternative selected) */}
            {section && !selectedAlternativeId && (
              <g className="animate-pulse">
                <path
                  d={normalizeSection(section)}
                  fill="#22c55e"
                  fillOpacity="0.5"
                  stroke="#22c55e"
                  strokeWidth="2"
                  filter="url(#glow)"
                  className="transition-all duration-300"
                />
                <path
                  d={normalizeSection(section)}
                  fill="url(#section-hatch)"
                  fillOpacity="0.3"
                  stroke="none"
                />
              </g>
            )}

            {/* Movement arrow from yesterday to today */}
            {yesterdaySection && section && (() => {
              const [fromX, fromY] = getSectionCenter(yesterdaySection)
              const [toX, toY] = getSectionCenter(section)
              const dx = toX - fromX
              const dy = toY - fromY
              const len = Math.sqrt(dx * dx + dy * dy)
              if (len < 5) return null // Too close, skip arrow
              const unitX = dx / len
              const unitY = dy / len
              return (
                <g className="animate-pulse">
                  <line
                    x1={fromX + unitX * 5}
                    y1={fromY + unitY * 5}
                    x2={toX - unitX * 5}
                    y2={toY - unitY * 5}
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    markerEnd="url(#arrowhead)"
                    opacity="0.8"
                  />
                </g>
              )
            })()}

          </g>
        ) : (
          <>
            {/* Full Farm View: Render all paddocks */}
            {normalizedPaddocks.map(p => {
              const isTarget = p.id === targetPaddockId
              const isCurrent = p.id === currentPaddockId
              const isHighlighted = p.id === highlightedPaddockId

              return (
                <g key={p.id}>
                  <path
                    d={p.svgPath}
                    fill={isTarget ? statusColors[p.status] : statusColorsLight[p.status]}
                    stroke={isTarget || isCurrent || isHighlighted ? '#fff' : statusColors[p.status]}
                    strokeWidth={isTarget || isCurrent ? 1.5 : 0.5}
                    opacity={isTarget || isCurrent ? 1 : 0.7}
                    filter={isTarget ? 'url(#glow)' : undefined}
                    className="transition-all duration-300"
                  />
                  {/* Labels */}
                  {showLabels && (
                    <text
                      x={paddockCenters[p.id][0]}
                      y={paddockCenters[p.id][1]}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-[4px] font-medium pointer-events-none"
                    >
                      {p.name.split(' ')[0]}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Movement arrow (only for paddock transitions) */}
            {arrowPath && (
              <g className="animate-pulse">
                <line
                  x1={arrowPath.startX}
                  y1={arrowPath.startY}
                  x2={arrowPath.endX}
                  y2={arrowPath.endY}
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  markerEnd="url(#arrowhead)"
                  className="dark:stroke-green-400"
                />
              </g>
            )}

            {/* Current position marker (livestock icon) */}
            {currentPaddockId && paddockCenters[currentPaddockId] && (
              <g transform={`translate(${paddockCenters[currentPaddockId][0]}, ${paddockCenters[currentPaddockId][1]})`}>
                <circle r="5" fill="#1f2937" stroke="#fff" strokeWidth="1" className="dark:fill-zinc-800" />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[6px] fill-white select-none"
                  style={{ fontSize: '6px' }}
                >
                  H
                </text>
              </g>
            )}

            {/* Target marker (only for paddock transitions) */}
            {targetPaddockId && currentPaddockId !== targetPaddockId && paddockCenters[targetPaddockId] && (
              <g transform={`translate(${paddockCenters[targetPaddockId][0]}, ${paddockCenters[targetPaddockId][1]})`}>
                <circle r="4" fill="none" stroke="#22c55e" strokeWidth="1.5" className="animate-ping opacity-75" />
                <circle r="3" fill="#22c55e" stroke="#fff" strokeWidth="0.5" />
              </g>
            )}
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3 text-[10px] text-muted-foreground">
        {sectionViewMode ? (
          <>
            {!selectedAlternativeId && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-green-500/50 border border-green-500" />
                Today
              </span>
            )}
            {selectedAlternativeId && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-blue-500/50 border border-blue-500" />
                Selected
              </span>
            )}
            {yesterdaySection && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-amber-500/35 border border-amber-500" />
                Yesterday
              </span>
            )}
            {sectionAlternatives.length > 0 && !selectedAlternativeId && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-blue-300/25 border border-blue-400 border-dashed" />
                Options
              </span>
            )}
          </>
        ) : (
          <>
            {currentPaddock && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-zinc-700 dark:bg-zinc-600" />
                Now
              </span>
            )}
            {targetPaddock && currentPaddockId !== targetPaddockId && (
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                Next
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
