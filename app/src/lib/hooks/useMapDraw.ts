import { useEffect, useRef, useCallback, useState } from 'react'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { Feature, Polygon, FeatureCollection } from 'geojson'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { useGeometry, clipPolygonToPolygon, getTranslationDelta, translatePolygon } from '@/lib/geometry'
import type { EntityType } from '@/lib/geometry'

// Import MapboxDraw styles - these need to be imported in the component that uses this hook
// or added globally: import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

export type DrawMode = 'simple_select' | 'direct_select' | 'draw_polygon'

export interface UseMapDrawOptions {
  map: MapLibreMap | null
  entityType: EntityType
  parentPaddockId?: string // Required when entityType is 'section'
  editable?: boolean
  onFeatureCreated?: (id: string, geometry: Feature<Polygon>) => void
  onFeatureUpdated?: (id: string, geometry: Feature<Polygon>) => void
  onFeatureDeleted?: (id: string) => void
}

export interface UseMapDrawReturn {
  draw: MapboxDraw | null
  currentMode: DrawMode
  selectedFeatureIds: string[]
  setMode: (mode: DrawMode) => void
  deleteSelected: () => void
  cancelDrawing: () => void
  isDrawing: boolean
}

// Custom draw styles to match the app theme
const drawStyles = [
  // Active polygon being drawn
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#22c55e',
      'fill-opacity': 0.2,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'line-color': '#22c55e',
      'line-width': 2,
      'line-dasharray': [2, 2],
    },
  },
  // Inactive polygon (selected but not being edited)
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#3b82f6',
      'fill-opacity': 0.15,
    },
  },
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
    paint: {
      'line-color': '#3b82f6',
      'line-width': 2,
    },
  },
  // Vertices
  {
    id: 'gl-draw-polygon-and-line-vertex-active',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 6,
      'circle-color': '#fff',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#22c55e',
    },
  },
  // Midpoints
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 4,
      'circle-color': '#22c55e',
      'circle-opacity': 0.8,
    },
  },
  // Line being drawn
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'LineString']],
    paint: {
      'line-color': '#22c55e',
      'line-width': 2,
      'line-dasharray': [2, 2],
    },
  },
  // Points while drawing
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#22c55e',
    },
  },
]

export function useMapDraw({
  map,
  entityType,
  parentPaddockId,
  editable = true,
  onFeatureCreated,
  onFeatureUpdated,
  onFeatureDeleted,
}: UseMapDrawOptions): UseMapDrawReturn {
  const drawRef = useRef<MapboxDraw | null>(null)
  const [draw, setDraw] = useState<MapboxDraw | null>(null)
  const [currentMode, setCurrentMode] = useState<DrawMode>('simple_select')
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  const {
    addPaddock,
    updatePaddock,
    deletePaddock,
    addSection,
    updateSection,
    deleteSection,
    getPaddockById,
    getSectionsByPaddockId,
  } = useGeometry()

  // Initialize MapboxDraw
  useEffect(() => {
    if (!map || !editable) return

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: false,
        trash: false,
      },
      styles: drawStyles,
      defaultMode: 'simple_select',
    })

    // MapLibre compatibility: MapboxDraw works with MapLibre but we need to cast
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.addControl(draw as any)
    drawRef.current = draw
    setDraw(draw)

    return () => {
      if (map && drawRef.current) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map.removeControl(drawRef.current as any)
        } catch {
          // Map may already be destroyed
        }
        drawRef.current = null
      }
      setDraw(null)
    }
  }, [map, editable])

  // Handle draw events
  useEffect(() => {
    if (!map || !drawRef.current) return

    const handleCreate = (e: { features: Feature<Polygon>[] }) => {
      const feature = e.features[0]
      if (!feature || feature.geometry.type !== 'Polygon') return

      let newId: string
      if (entityType === 'paddock') {
        newId = addPaddock(feature as Feature<Polygon>)
      } else if (entityType === 'section' && parentPaddockId) {
        newId = addSection(parentPaddockId, feature as Feature<Polygon>)
      } else {
        console.warn('Section creation requires parentPaddockId')
        return
      }

      // Update the feature ID in draw to match our generated ID
      if (drawRef.current && feature.id) {
        drawRef.current.delete(feature.id as string)
        const updatedFeature = { ...feature, id: newId }
        drawRef.current.add(updatedFeature as unknown as FeatureCollection)
      }

      onFeatureCreated?.(newId, feature as Feature<Polygon>)
      setCurrentMode('simple_select')
      setIsDrawing(false)
    }

    const handleUpdate = (e: { features: Feature<Polygon>[]; action?: string }) => {
      e.features.forEach((feature) => {
        if (!feature.id || feature.geometry.type !== 'Polygon') return

        const id = String(feature.id)
        if (entityType === 'paddock') {
          const previousPaddock = getPaddockById(id)
          const nextGeometry = feature as Feature<Polygon>
          updatePaddock(id, feature as Feature<Polygon>)
          if (previousPaddock) {
            const previousGeometry = previousPaddock.geometry
            const translation = getTranslationDelta(previousGeometry, nextGeometry)
            const shouldTranslate = e.action === 'move' || (e.action !== 'change_coordinates' && translation)

            if (shouldTranslate && translation) {
              const sections = getSectionsByPaddockId(id)
              sections.forEach((section) => {
                const moved = translatePolygon(section.geometry, translation.deltaLng, translation.deltaLat)
                updateSection(section.id, moved)
              })
            } else {
              const sections = getSectionsByPaddockId(id)
              sections.forEach((section) => {
                const clipped = clipPolygonToPolygon(section.geometry, nextGeometry)
                if (clipped) {
                  updateSection(section.id, clipped)
                } else {
                  deleteSection(section.id)
                }
              })
            }
          }
        } else {
          updateSection(id, feature as Feature<Polygon>)
        }

        onFeatureUpdated?.(id, feature as Feature<Polygon>)
        if (e.action === 'move' && drawRef.current) {
          drawRef.current.changeMode('direct_select', { featureId: id })
        }
      })
    }

    const handleDelete = (e: { features: Feature<Polygon>[] }) => {
      e.features.forEach((feature) => {
        if (!feature.id) return

        const id = String(feature.id)
        if (entityType === 'paddock') {
          deletePaddock(id)
        } else {
          deleteSection(id)
        }

        onFeatureDeleted?.(id)
      })
    }

    const handleModeChange = (e: { mode: DrawMode }) => {
      setCurrentMode(e.mode)
      setIsDrawing(e.mode === 'draw_polygon')
    }

    const handleSelectionChange = (e: { features: Feature[] }) => {
      setSelectedFeatureIds(e.features.map((f) => String(f.id)))
    }

    map.on('draw.create', handleCreate)
    map.on('draw.update', handleUpdate)
    map.on('draw.delete', handleDelete)
    map.on('draw.modechange', handleModeChange)
    map.on('draw.selectionchange', handleSelectionChange)

    return () => {
      map.off('draw.create', handleCreate)
      map.off('draw.update', handleUpdate)
      map.off('draw.delete', handleDelete)
      map.off('draw.modechange', handleModeChange)
      map.off('draw.selectionchange', handleSelectionChange)
    }
  }, [
    map,
    entityType,
    parentPaddockId,
    addPaddock,
    updatePaddock,
    deletePaddock,
    addSection,
    updateSection,
    deleteSection,
    getPaddockById,
    getSectionsByPaddockId,
    onFeatureCreated,
    onFeatureUpdated,
    onFeatureDeleted,
  ])

  const setMode = useCallback((mode: DrawMode) => {
    if (drawRef.current) {
      // Type assertion needed due to MapboxDraw's strict overload types
      drawRef.current.changeMode(mode as 'simple_select')
      setCurrentMode(mode)
      setIsDrawing(mode === 'draw_polygon')
    }
  }, [])

  const deleteSelected = useCallback(() => {
    if (drawRef.current && selectedFeatureIds.length > 0) {
      drawRef.current.delete(selectedFeatureIds)
      // The delete event handler will update the geometry context
    }
  }, [selectedFeatureIds])

  const cancelDrawing = useCallback(() => {
    if (drawRef.current) {
      drawRef.current.changeMode('simple_select')
      setCurrentMode('simple_select')
      setIsDrawing(false)
    }
  }, [])

  return {
    draw,
    currentMode,
    selectedFeatureIds,
    setMode,
    deleteSelected,
    cancelDrawing,
    isDrawing,
  }
}

// Helper function to load existing geometries into draw
export function loadGeometriesToDraw(
  draw: MapboxDraw | null,
  features: Feature<Polygon>[]
): void {
  if (!draw) return

  // Clear existing features first
  draw.deleteAll()

  // Add each feature
  features.forEach((feature) => {
    if (feature.id) {
      draw.add(feature as unknown as FeatureCollection)
    }
  })
}
