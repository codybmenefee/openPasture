import { useCallback, useEffect, useRef, useState } from 'react'
import { X, Check, MousePointer2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useFarmBoundary } from '@/lib/hooks/useFarmBoundary'
import type { Feature, Polygon } from 'geojson'
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl'

interface FarmBoundaryDrawerProps {
  map: MapLibreMap | null
  onComplete?: () => void
  onCancel?: () => void
}

const PREVIEW_SOURCE_ID = 'boundary-preview'
const PREVIEW_FILL_LAYER_ID = 'boundary-preview-fill'
const PREVIEW_OUTLINE_LAYER_ID = 'boundary-preview-outline'

export function FarmBoundaryDrawer({
  map,
  onComplete,
  onCancel,
}: FarmBoundaryDrawerProps) {
  const { saveBoundary, isSaving, error: saveError } = useFarmBoundary()
  const [step, setStep] = useState<'instructions' | 'drawing' | 'confirm'>('instructions')
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null)
  const [drawnGeometry, setDrawnGeometry] = useState<Feature<Polygon> | null>(null)
  const clickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)
  const mouseMoveHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null)

  // Create preview rectangle geometry
  const createRectangle = useCallback((p1: [number, number], p2: [number, number]): Feature<Polygon> => {
    const minLng = Math.min(p1[0], p2[0])
    const maxLng = Math.max(p1[0], p2[0])
    const minLat = Math.min(p1[1], p2[1])
    const maxLat = Math.max(p1[1], p2[1])

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [minLng, maxLat],
          [maxLng, maxLat],
          [maxLng, minLat],
          [minLng, minLat],
          [minLng, maxLat],
        ]],
      },
    }
  }, [])

  // Setup preview layer
  useEffect(() => {
    if (!map) return

    const emptyCollection: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }

    // Add source and layers if they don't exist
    if (!map.getSource(PREVIEW_SOURCE_ID)) {
      map.addSource(PREVIEW_SOURCE_ID, {
        type: 'geojson',
        data: emptyCollection,
      })

      map.addLayer({
        id: PREVIEW_FILL_LAYER_ID,
        type: 'fill',
        source: PREVIEW_SOURCE_ID,
        paint: {
          'fill-color': '#22c55e',
          'fill-opacity': 0.2,
        },
      })

      map.addLayer({
        id: PREVIEW_OUTLINE_LAYER_ID,
        type: 'line',
        source: PREVIEW_SOURCE_ID,
        paint: {
          'line-color': '#22c55e',
          'line-width': 2,
          'line-dasharray': [4, 2],
        },
      })
    }

    return () => {
      // Cleanup layers and source - check map still exists
      try {
        if (map && map.getStyle()) {
          if (map.getLayer(PREVIEW_FILL_LAYER_ID)) {
            map.removeLayer(PREVIEW_FILL_LAYER_ID)
          }
          if (map.getLayer(PREVIEW_OUTLINE_LAYER_ID)) {
            map.removeLayer(PREVIEW_OUTLINE_LAYER_ID)
          }
          if (map.getSource(PREVIEW_SOURCE_ID)) {
            map.removeSource(PREVIEW_SOURCE_ID)
          }
        }
      } catch {
        // Map may already be destroyed
      }
    }
  }, [map])

  // Update preview rectangle
  const updatePreview = useCallback((geometry: Feature<Polygon> | null) => {
    if (!map) return

    const source = map.getSource(PREVIEW_SOURCE_ID) as GeoJSONSource | undefined
    if (!source) return

    if (geometry) {
      source.setData({
        type: 'FeatureCollection',
        features: [geometry],
      })
    } else {
      source.setData({
        type: 'FeatureCollection',
        features: [],
      })
    }
  }, [map])

  // Setup click and mousemove handlers when drawing
  useEffect(() => {
    if (!map || step !== 'drawing') return

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const clickPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat]

      if (!startPoint) {
        // First click - set start point
        setStartPoint(clickPoint)
      } else {
        // Second click - complete rectangle
        const rectangle = createRectangle(startPoint, clickPoint)
        setDrawnGeometry(rectangle)
        updatePreview(rectangle)
        setStep('confirm')
      }
    }

    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      if (!startPoint) return

      const currentPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat]
      const preview = createRectangle(startPoint, currentPoint)
      updatePreview(preview)
    }

    // Store refs for cleanup
    clickHandlerRef.current = handleClick
    mouseMoveHandlerRef.current = handleMouseMove

    map.on('click', handleClick)
    map.on('mousemove', handleMouseMove)

    // Change cursor
    map.getCanvas().style.cursor = 'crosshair'

    return () => {
      map.off('click', handleClick)
      map.off('mousemove', handleMouseMove)
      map.getCanvas().style.cursor = ''
    }
  }, [map, step, startPoint, createRectangle, updatePreview])

  const handleStartDrawing = useCallback(() => {
    setStartPoint(null)
    setDrawnGeometry(null)
    updatePreview(null)
    setStep('drawing')
  }, [updatePreview])

  const handleCancel = useCallback(() => {
    setStartPoint(null)
    setDrawnGeometry(null)
    updatePreview(null)
    setStep('instructions')
    onCancel?.()
  }, [updatePreview, onCancel])

  const handleConfirm = useCallback(async () => {
    if (!drawnGeometry) return

    await saveBoundary(drawnGeometry)
    updatePreview(null)
    onComplete?.()
  }, [drawnGeometry, saveBoundary, updatePreview, onComplete])

  const handleRedraw = useCallback(() => {
    setStartPoint(null)
    setDrawnGeometry(null)
    updatePreview(null)
    setStep('drawing')
  }, [updatePreview])

  return (
    <Card className="absolute top-3 left-1/2 -translate-x-1/2 z-20 shadow-lg">
      <CardContent className="p-4">
        {step === 'instructions' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <MousePointer2 className="h-4 w-4 text-muted-foreground" />
              <span>Click two opposite corners to define your farm boundary</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleStartDrawing}>
                Start Drawing
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'drawing' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>
                  {startPoint
                    ? 'Click the opposite corner to complete the rectangle'
                    : 'Click to set the first corner'}
                </span>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4" />
              <span className="ml-1">Cancel</span>
            </Button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Boundary drawn. </span>
              <span>Save this as your farm boundary?</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={isSaving}
              >
                <Check className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save Boundary'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleRedraw}>
                Redraw
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {saveError && (
          <div className="mt-2 text-sm text-destructive">{saveError}</div>
        )}
      </CardContent>
    </Card>
  )
}
