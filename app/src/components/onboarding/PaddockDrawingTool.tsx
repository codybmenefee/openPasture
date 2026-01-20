import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, FileJson } from 'lucide-react'
import maplibregl from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DrawingToolbar } from '@/components/map/DrawingToolbar'
import { useGeometry, clipPolygonToPolygon, getTranslationDelta, translatePolygon } from '@/lib/geometry'
import type { Feature, Polygon } from 'geojson'
import type { DrawMode } from '@/lib/hooks'
import { useFarm } from '@/lib/convex/useFarm'
import { MapSkeleton } from '@/components/ui/loading/MapSkeleton'
import { ErrorState } from '@/components/ui/error/ErrorState'

interface PaddockDrawingToolProps {
  onNext: () => void
  onBack: () => void
}

// Custom draw styles for onboarding
const drawStyles = [
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
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#3b82f6',
      'fill-opacity': 0.3,
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

export function PaddockDrawingTool({ onNext, onBack }: PaddockDrawingToolProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const drawRef = useRef<MapboxDraw | null>(null)
  const dragStateRef = useRef<{ featureId: string; startPoint: maplibregl.Point; dragging: boolean } | null>(null)
  
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [currentMode, setCurrentMode] = useState<DrawMode>('simple_select')
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnPaddockCount, setDrawnPaddockCount] = useState(0)
  
  const {
    addPaddock,
    updatePaddock,
    getPaddockById,
    getSectionsByPaddockId,
    updateSection,
    deleteSection,
    paddocks,
    resetToInitial,
  } = useGeometry()
  const { farm, isLoading: isFarmLoading } = useFarm()

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !farm) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          },
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: farm.coordinates,
      zoom: 14,
    })

    map.on('load', () => {
      mapRef.current = map

      // Initialize MapboxDraw
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: false,
          trash: false,
        },
        styles: drawStyles,
        defaultMode: 'simple_select',
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.addControl(draw as any)
      drawRef.current = draw

      // Handle draw events
      map.on('draw.create', (e: { features: Feature<Polygon>[] }) => {
        const feature = e.features[0]
        if (!feature || feature.geometry.type !== 'Polygon') return

        const newId = addPaddock(feature as Feature<Polygon>, {
          name: `Paddock ${drawnPaddockCount + 1}`,
        })

        // Update the feature ID in draw
        if (drawRef.current && feature.id) {
          drawRef.current.delete(feature.id as string)
          const updatedFeature = { ...feature, id: newId }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          drawRef.current.add(updatedFeature as any)
        }

        setDrawnPaddockCount((prev) => prev + 1)
        setCurrentMode('simple_select')
        setIsDrawing(false)
      })

      const handleUpdate = (e: { features: Feature<Polygon>[]; action?: string }) => {
        e.features.forEach((feature) => {
          if (!feature.id || feature.geometry.type !== 'Polygon') return
          const id = String(feature.id)
          const previousPaddock = getPaddockById(id)
          const nextGeometry = feature as Feature<Polygon>

          updatePaddock(id, nextGeometry)

          if (previousPaddock) {
            const previousGeometry = previousPaddock.geometry
            const translation = getTranslationDelta(previousGeometry, nextGeometry)
            const shouldTranslate = e.action === 'move' || (e.action !== 'change_coordinates' && translation)

            const sections = getSectionsByPaddockId(id)
            if (shouldTranslate && translation) {
              sections.forEach((section) => {
                const moved = translatePolygon(section.geometry, translation.deltaLng, translation.deltaLat)
                updateSection(section.id, moved)
              })
            } else {
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
        })
      }

      map.on('draw.modechange', (e: { mode: DrawMode }) => {
        setCurrentMode(e.mode)
        setIsDrawing(e.mode === 'draw_polygon')
      })

      map.on('draw.selectionchange', (e: { features: Feature[] }) => {
        setSelectedFeatureIds(e.features.map((f) => String(f.id)))
      })

      setIsMapLoaded(true)
      map.on('draw.update', handleUpdate)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [
    addPaddock,
    updatePaddock,
    getPaddockById,
    getSectionsByPaddockId,
    updateSection,
    deleteSection,
    drawnPaddockCount,
    farm,
  ])

  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return

    const activeMode = drawRef.current?.getMode?.() ?? currentMode
    const shouldEnableDrag = activeMode === 'simple_select' && selectedFeatureIds.length === 0

    if (shouldEnableDrag) {
      if (!mapRef.current.dragPan.isEnabled()) {
        mapRef.current.dragPan.enable()
      }
    } else if (mapRef.current.dragPan.isEnabled()) {
      mapRef.current.dragPan.disable()
    }
  }, [isMapLoaded, currentMode, selectedFeatureIds.length])

  useEffect(() => {
    if (!mapRef.current || !drawRef.current || !isMapLoaded) return

    const map = mapRef.current
    const draw = drawRef.current
    const filterExistingLayers = (layerIds: string[]) =>
      layerIds.filter((layerId) => map.getLayer(layerId))

    const vertexLayerIds = filterExistingLayers([
      'gl-draw-polygon-and-line-vertex-active',
      'gl-draw-polygon-midpoint',
    ])

    const getFeatureIdAtPoint = (point: maplibregl.Point) => {
      const ids = draw.getFeatureIdsAt({ x: point.x, y: point.y })
      return ids.length > 0 ? String(ids[0]) : null
    }

    const isVertexHit = (point: maplibregl.Point) => {
      if (!vertexLayerIds.length) return false
      const features = map.queryRenderedFeatures(point, { layers: vertexLayerIds })
      return features.length > 0
    }

    const handleMouseDown = (e: maplibregl.MapMouseEvent & maplibregl.EventData) => {
      if (isDrawing || isVertexHit(e.point)) return
      const featureId = getFeatureIdAtPoint(e.point)
      if (!featureId) return

      dragStateRef.current = {
        featureId,
        startPoint: e.point,
        dragging: false,
      }
      draw.changeMode('simple_select', { featureIds: [featureId] })
    }

    const handleMouseMove = (e: maplibregl.MapMouseEvent & maplibregl.EventData) => {
      const state = dragStateRef.current
      if (!state || state.dragging) return
      const dx = e.point.x - state.startPoint.x
      const dy = e.point.y - state.startPoint.y
      if (Math.hypot(dx, dy) > 4) {
        state.dragging = true
      }
    }

    const handleMouseUp = () => {
      const state = dragStateRef.current
      if (!state) return
      draw.changeMode('direct_select', { featureId: state.featureId })
      dragStateRef.current = null
    }

    const handleMapClick = (e: maplibregl.MapMouseEvent & maplibregl.EventData) => {
      if (isDrawing || dragStateRef.current || isVertexHit(e.point)) return
      const featureId = getFeatureIdAtPoint(e.point)
      if (!featureId) {
        draw.changeMode('simple_select')
        return
      }
      draw.changeMode('direct_select', { featureId })
    }

    map.on('mousedown', handleMouseDown)
    map.on('mousemove', handleMouseMove)
    map.on('mouseup', handleMouseUp)
    map.on('click', handleMapClick)

    return () => {
      map.off('mousedown', handleMouseDown)
      map.off('mousemove', handleMouseMove)
      map.off('mouseup', handleMouseUp)
      map.off('click', handleMapClick)
    }
  }, [isMapLoaded, isDrawing])

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
      setSelectedFeatureIds([])
    }
  }, [selectedFeatureIds])

  const cancelDrawing = useCallback(() => {
    if (drawRef.current) {
      drawRef.current.changeMode('simple_select')
      setCurrentMode('simple_select')
      setIsDrawing(false)
    }
  }, [])

  const handleUseSampleData = () => {
    // Reset to initial (mock) paddocks and proceed
    resetToInitial()
    onNext()
  }

  const handleContinueWithDrawn = () => {
    // Continue with user-drawn paddocks
    onNext()
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Define your paddocks</CardTitle>
        <CardDescription>
          Draw paddock boundaries on the map, or import existing boundaries from a file.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Map with drawing */}
        <div className="relative h-[400px] rounded-lg overflow-hidden border border-border">
          {isFarmLoading ? (
            <MapSkeleton className="h-full w-full" />
          ) : !farm ? (
            <ErrorState
              title="Farm geometry unavailable"
              message="We could not load the farm boundary for onboarding."
              className="h-full"
            />
          ) : (
            <div ref={mapContainer} className="h-full w-full" />
          )}
          
          {isMapLoaded && (
            <div className="absolute top-3 left-3 z-10">
              <DrawingToolbar
                currentMode={currentMode}
                selectedFeatureIds={selectedFeatureIds}
                isDrawing={isDrawing}
                onSetMode={setMode}
                onDeleteSelected={deleteSelected}
                onCancelDrawing={cancelDrawing}
                entityType="paddock"
                compact={false}
              />
            </div>
          )}
          
          {/* Paddock count indicator */}
          <div className="absolute bottom-3 right-3 z-10">
            <div className="rounded-lg border border-border bg-background/95 backdrop-blur px-3 py-1.5 text-xs">
              {paddocks.length} paddock{paddocks.length !== 1 ? 's' : ''} defined
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Click "Draw Paddock" then click on the map to place vertices. Double-click to finish a polygon.</p>
          <p>Click a paddock to edit vertices, drag to reposition, and click outside to stop editing.</p>
        </div>
        
        {/* Import options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled>
            <FileJson className="h-6 w-6" />
            <span>Import from GeoJSON</span>
            <span className="text-xs text-muted-foreground">(Coming soon)</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" disabled>
            <Upload className="h-6 w-6" />
            <span>Import from Shapefile</span>
            <span className="text-xs text-muted-foreground">(Coming soon)</span>
          </Button>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleUseSampleData}>
              Use Sample Data
            </Button>
            <Button 
              onClick={handleContinueWithDrawn}
              disabled={paddocks.length === 0}
            >
              Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
