import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Paddock } from '@/lib/types'

interface PaddockMapDetailProps {
  paddock: Paddock
}

const statusColors: Record<Paddock['status'], string> = {
  ready: '#22c55e',
  almost_ready: '#f59e0b',
  recovering: '#3b82f6',
  grazed: '#71717a',
}

export function PaddockMapDetail({ paddock }: PaddockMapDetailProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Calculate bounds from the paddock geometry
    const coords = paddock.geometry.geometry.coordinates[0]
    const lngs = coords.map(c => c[0])
    const lats = coords.map(c => c[1])
    const bounds = new maplibregl.LngLatBounds(
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    )

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      bounds: bounds,
      fitBoundsOptions: { padding: 40 }
    })

    map.current.on('load', () => {
      if (!map.current) return

      // Add paddock polygon
      map.current.addSource('paddock', {
        type: 'geojson',
        data: paddock.geometry
      })

      // Fill layer
      map.current.addLayer({
        id: 'paddock-fill',
        type: 'fill',
        source: 'paddock',
        paint: {
          'fill-color': statusColors[paddock.status],
          'fill-opacity': 0.3
        }
      })

      // Border layer
      map.current.addLayer({
        id: 'paddock-border',
        type: 'line',
        source: 'paddock',
        paint: {
          'line-color': statusColors[paddock.status],
          'line-width': 3
        }
      })
    })

    return () => {
      map.current?.remove()
    }
  }, [paddock])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Paddock Location</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapContainer} 
          className="h-[200px] w-full rounded-b-lg"
        />
      </CardContent>
    </Card>
  )
}
