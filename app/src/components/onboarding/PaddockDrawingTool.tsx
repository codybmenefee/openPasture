import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, FileJson } from 'lucide-react'
import maplibregl from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DrawingToolbar } from '@/components/map/DrawingToolbar'
import { useGeometry } from '@/lib/geometry'
import { farm } from '@/data/mock/farm'
import type { Feature, Polygon } from 'geojson'
import type { DrawMode } from '@/lib/hooks'

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
  
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [currentMode, setCurrentMode] = useState<DrawMode>('simple_select')
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnPaddockCount, setDrawnPaddockCount] = useState(0)
  
  const { addPaddock, paddocks, resetToInitial } = useGeometry()

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
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

      map.on('draw.modechange', (e: { mode: DrawMode }) => {
        setCurrentMode(e.mode)
        setIsDrawing(e.mode === 'draw_polygon')
      })

      map.on('draw.selectionchange', (e: { features: Feature[] }) => {
        setSelectedFeatureIds(e.features.map((f) => String(f.id)))
      })

      setIsMapLoaded(true)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [addPaddock, drawnPaddockCount])

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
          <div ref={mapContainer} className="h-full w-full" />
          
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
          <p>You can edit vertices by selecting a paddock and clicking "Edit Vertices".</p>
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
