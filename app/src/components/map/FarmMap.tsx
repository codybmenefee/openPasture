import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import { farm } from '@/data/mock/farm'
import { todaysPlan } from '@/data/mock/plan'
import type { Paddock, PaddockStatus, Section } from '@/lib/types'
import { useGeometry } from '@/lib/geometry'
import { useMapDraw, loadGeometriesToDraw, type DrawMode } from '@/lib/hooks'
import { DrawingToolbar } from './DrawingToolbar'
import type { Feature, Polygon } from 'geojson'

interface FarmMapProps {
  onPaddockClick?: (paddock: Paddock) => void
  onEditRequest?: (request: {
    entityType: 'paddock' | 'section'
    paddockId?: string
    sectionId?: string
    geometry?: Feature<Polygon>
  }) => void
  selectedPaddockId?: string
  showSatellite?: boolean
  showNdviHeat?: boolean
  showPaddocks?: boolean
  showLabels?: boolean
  showSections?: boolean
  editable?: boolean
  editMode?: boolean
  entityType?: 'paddock' | 'section'
  parentPaddockId?: string
  initialSectionFeature?: Feature<Polygon>
  initialSectionId?: string
  initialPaddockId?: string
  showToolbar?: boolean
  toolbarPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  compactToolbar?: boolean
}

export interface FarmMapHandle {
  getMap: () => maplibregl.Map | null
  setDrawMode: (mode: DrawMode) => void
  deleteSelected: () => void
  cancelDrawing: () => void
  focusOnPaddock: (paddockId: string) => void
  focusOnGeometry: (geometry: Feature<Polygon>, padding?: number) => void
}

const statusColors: Record<PaddockStatus, string> = {
  ready: '#22c55e',
  almost_ready: '#f59e0b',
  recovering: '#6b7280',
  grazed: '#ef4444',
}

export const FarmMap = forwardRef<FarmMapHandle, FarmMapProps>(function FarmMap({ 
  onPaddockClick, 
  onEditRequest,
  selectedPaddockId,
  showSatellite = false,
  showNdviHeat = false,
  showPaddocks = true,
  showLabels = true,
  showSections = true,
  editable = false,
  editMode = false,
  entityType = 'paddock',
  parentPaddockId,
  initialSectionFeature,
  initialSectionId,
  initialPaddockId,
  showToolbar = true,
  toolbarPosition = 'top-left',
  compactToolbar = false,
}, ref) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const lastClickRef = useRef<{ time: number; point: maplibregl.Point } | null>(null)
  const lastSectionPickRef = useRef<{ time: number; point: maplibregl.Point; index: number; ids: string[] } | null>(null)

  const { paddocks, getPaddockById } = useGeometry()

  const isEditActive = editable && editMode

  const {
    draw,
    currentMode,
    selectedFeatureIds,
    setMode,
    deleteSelected,
    cancelDrawing,
    isDrawing,
  } = useMapDraw({
    map: isEditActive ? mapInstance : null,
    entityType,
    parentPaddockId,
    editable: isEditActive,
  })

  useEffect(() => {
    if (!mapInstance || !isMapLoaded) return

    const shouldEnableDrag =
      !isEditActive || currentMode !== 'draw_polygon'

    if (shouldEnableDrag) {
      if (!mapInstance.dragPan.isEnabled()) {
        mapInstance.dragPan.enable()
      }
    } else if (mapInstance.dragPan.isEnabled()) {
      mapInstance.dragPan.disable()
    }
  }, [mapInstance, isMapLoaded, isEditActive, currentMode])

  // Expose map methods via ref
  const fitPolygonBounds = useCallback((geometry: Feature<Polygon>, padding = 60) => {
    if (!mapInstance) return
    const coords = geometry.geometry.coordinates[0]
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity

    coords.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng)
      maxLng = Math.max(maxLng, lng)
      minLat = Math.min(minLat, lat)
      maxLat = Math.max(maxLat, lat)
    })

    const bounds = new maplibregl.LngLatBounds([minLng, minLat], [maxLng, maxLat])
    mapInstance.fitBounds(bounds, { padding, duration: 1000 })
  }, [mapInstance])

  useImperativeHandle(ref, () => ({
    getMap: () => mapInstance,
    setDrawMode: setMode,
    deleteSelected,
    cancelDrawing,
    focusOnPaddock: (paddockId: string) => {
      if (!mapInstance) return
      const paddock = getPaddockById(paddockId)
      if (!paddock) return
      
      const doFocus = () => {
        fitPolygonBounds(paddock.geometry, 60)
      }
      
      // If map is already loaded, focus immediately. Otherwise wait for it.
      if (mapInstance.loaded()) {
        doFocus()
      } else {
        mapInstance.once('load', doFocus)
      }
    },
    focusOnGeometry: (geometry: Feature<Polygon>, padding = 60) => {
      if (!mapInstance) return

      const doFocus = () => {
        fitPolygonBounds(geometry, padding)
      }

      if (mapInstance.loaded()) {
        doFocus()
      } else {
        mapInstance.once('load', doFocus)
      }
    },
  }), [mapInstance, setMode, deleteSelected, cancelDrawing, getPaddockById, fitPolygonBounds])

  // Handle paddock click wrapper
  const handlePaddockClick = useCallback((paddock: Paddock) => {
    // Don't trigger click handler when in edit mode
    if (isEditActive) return
    onPaddockClick?.(paddock)
  }, [isEditActive, onPaddockClick])

  const createDraftSquare = useCallback((center: maplibregl.LngLat, sizePx: number): Feature<Polygon> | null => {
    if (!mapInstance) return null
    const half = sizePx / 2
    const centerPoint = mapInstance.project(center)
    const topLeft = mapInstance.unproject({ x: centerPoint.x - half, y: centerPoint.y - half })
    const topRight = mapInstance.unproject({ x: centerPoint.x + half, y: centerPoint.y - half })
    const bottomRight = mapInstance.unproject({ x: centerPoint.x + half, y: centerPoint.y + half })
    const bottomLeft = mapInstance.unproject({ x: centerPoint.x - half, y: centerPoint.y + half })

    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [topLeft.lng, topLeft.lat],
          [topRight.lng, topRight.lat],
          [bottomRight.lng, bottomRight.lat],
          [bottomLeft.lng, bottomLeft.lat],
          [topLeft.lng, topLeft.lat],
        ]],
      },
    }
  }, [mapInstance])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

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
          satellite: {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: '&copy; Esri, Maxar, Earthstar Geographics',
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
          {
            id: 'satellite-tiles',
            type: 'raster',
            source: 'satellite',
            minzoom: 0,
            maxzoom: 19,
            layout: {
              visibility: 'none',
            },
          },
        ],
      },
      center: farm.coordinates,
      zoom: 14,
      doubleClickZoom: false,
    })
    map.doubleClickZoom.disable()

    map.on('load', () => {
      setMapInstance(map)
      setIsMapLoaded(true)
    })

    return () => {
      map.remove()
      setMapInstance(null)
      setIsMapLoaded(false)
    }
  }, [])

  // Add paddock and section layers once map is loaded
  useEffect(() => {
    if (!mapInstance || !isMapLoaded) return
    const map = mapInstance

    // Create GeoJSON feature collection for paddocks
    const paddocksGeojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: paddocks.map((p) => ({
        ...p.geometry,
        properties: {
          id: p.id,
          name: p.name,
          status: p.status,
          ndvi: p.ndvi,
          isCurrentPaddock: p.id === todaysPlan.currentPaddockId,
        },
      })),
    }

    // Add or update paddocks source
    if (map.getSource('paddocks')) {
      (map.getSource('paddocks') as maplibregl.GeoJSONSource).setData(paddocksGeojson)
    } else {
      map.addSource('paddocks', {
        type: 'geojson',
        data: paddocksGeojson,
      })

      // Add fill layer
      map.addLayer({
        id: 'paddocks-fill',
        type: 'fill',
        source: 'paddocks',
        paint: {
          'fill-color': [
            'match',
            ['get', 'status'],
            'ready', statusColors.ready,
            'almost_ready', statusColors.almost_ready,
            'recovering', statusColors.recovering,
            'grazed', statusColors.grazed,
            '#6b7280',
          ],
          'fill-opacity': [
            'case',
            ['get', 'isCurrentPaddock'], 0.2,
            0.4,
          ],
        },
      })

      // Add outline layer
      map.addLayer({
        id: 'paddocks-outline',
        type: 'line',
        source: 'paddocks',
        paint: {
          'line-color': [
            'case',
            ['get', 'isCurrentPaddock'], '#22c55e',
            [
              'match',
              ['get', 'status'],
              'ready', statusColors.ready,
              'almost_ready', statusColors.almost_ready,
              'recovering', statusColors.recovering,
              'grazed', statusColors.grazed,
              '#6b7280',
            ],
          ],
          'line-width': [
            'case',
            ['get', 'isCurrentPaddock'], 3,
            2,
          ],
        },
      })

      // Add NDVI heat layer (gradient based on NDVI value)
      map.addLayer({
        id: 'ndvi-heat',
        type: 'fill',
        source: 'paddocks',
        layout: {
          visibility: 'none',
        },
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'ndvi'],
            0.0, '#d73027',   // Red - bare/stressed
            0.2, '#fc8d59',   // Orange - sparse
            0.4, '#fee08b',   // Yellow - recovering
            0.5, '#d9ef8b',   // Light green - healthy
            0.6, '#91cf60',   // Green - graze-ready
            0.8, '#1a9850',   // Dark green - dense
          ],
          'fill-opacity': 0.7,
        },
      })

      // Add NDVI heat outline for definition
      map.addLayer({
        id: 'ndvi-heat-outline',
        type: 'line',
        source: 'paddocks',
        layout: {
          visibility: 'none',
        },
        paint: {
          'line-color': '#374151',
          'line-width': 1,
        },
      })

      // Add labels
      map.addLayer({
        id: 'paddocks-labels',
        type: 'symbol',
        source: 'paddocks',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 12,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
        },
      })

      // Add sections source and layers
      addSectionLayers(map)
    }

    const filterExistingLayers = (layerIds: string[]) =>
      layerIds.filter((layerId) => map.getLayer(layerId))

    const handlePaddockLayerClick = (e: maplibregl.MapMouseEvent & maplibregl.EventData) => {
      if (e.features && e.features[0]) {
        const paddockId = e.features[0].properties?.id
        const paddock = getPaddockById(paddockId)
        if (paddock) {
          handlePaddockClick(paddock)
        }
      }
    }

    const handleMapClickLog = (e: maplibregl.MapMouseEvent & maplibregl.EventData) => {
      if (!isEditActive || entityType !== 'section') return
      const now = Date.now()
      const last = lastClickRef.current
      const dt = last ? now - last.time : null
      const dx = last ? e.point.x - last.point.x : null
      const dy = last ? e.point.y - last.point.y : null
      const dist = last && dx !== null && dy !== null ? Math.hypot(dx, dy) : null
      const isDoubleCandidate = !!last && dt !== null && dt < 320 && dist !== null && dist < 6
      lastClickRef.current = { time: now, point: e.point }

      if (isDrawing) {
        return
      }

      const drawHitLayers = [
        'gl-draw-polygon-fill-active',
        'gl-draw-polygon-fill-inactive',
        'gl-draw-polygon-fill-active.hot',
        'gl-draw-polygon-fill-inactive.cold',
      ]
      const availableDrawLayers = filterExistingLayers(drawHitLayers)
      const drawHits = availableDrawLayers.length
        ? map.queryRenderedFeatures(e.point, { layers: availableDrawLayers })
        : []

      const sectionHitLayers = filterExistingLayers([
        'sections-current-fill',
        'sections-grazed-fill',
        'sections-alternatives-fill',
      ])
      const sectionHits = sectionHitLayers.length
        ? map.queryRenderedFeatures(e.point, { layers: sectionHitLayers })
        : []
      if (!isDoubleCandidate && drawHits.length === 0 && sectionHits[0]) {
        const feature = sectionHits[0]
        const sectionId = feature.properties?.id
        const paddockId = feature.properties?.paddockId
        if (sectionId && feature.geometry?.type === 'Polygon') {
          onEditRequest?.({
            entityType: 'section',
            sectionId,
            paddockId,
            geometry: {
              type: 'Feature',
              properties: feature.properties ?? {},
              geometry: feature.geometry as Polygon,
            },
          })
        }
      }
    }

    const handleMapDoubleClick = (e: maplibregl.MapMouseEvent & maplibregl.EventData) => {
      if (isDrawing) return
      e.preventDefault()

      const sectionFeatureLayers = filterExistingLayers([
        'sections-current-fill',
        'sections-grazed-fill',
        'sections-alternatives-fill',
      ])
      const sectionFeatures = sectionFeatureLayers.length
        ? map.queryRenderedFeatures(e.point, { layers: sectionFeatureLayers })
        : []

      if (sectionFeatures[0]) {
        const now = Date.now()
        const ids = sectionFeatures.map((f) => String(f.properties?.id ?? ''))
        const last = lastSectionPickRef.current
        const dt = last ? now - last.time : null
        const dx = last ? e.point.x - last.point.x : null
        const dy = last ? e.point.y - last.point.y : null
        const dist = last && dx !== null && dy !== null ? Math.hypot(dx, dy) : null
        const sameIds = last && last.ids.length === ids.length && last.ids.every((id, index) => id === ids[index])
        const shouldCycle = !!last && !!sameIds && dt !== null && dt < 2000 && dist !== null && dist < 12
        const nextIndex = shouldCycle ? (last.index + 1) % sectionFeatures.length : 0
        lastSectionPickRef.current = { time: now, point: e.point, index: nextIndex, ids }
        // Sort by visual priority: current > alternative > grazed
        const layerPriority: Record<string, number> = {
          'sections-current-fill': 3,
          'sections-alternatives-fill': 2,
          'sections-grazed-fill': 1,
        }
        const sortedFeatures = [...sectionFeatures].sort((a, b) => {
          const aPriority = layerPriority[a.layer?.id ?? ''] ?? 0
          const bPriority = layerPriority[b.layer?.id ?? ''] ?? 0
          return bPriority - aPriority
        })
        const feature = sortedFeatures[nextIndex % sortedFeatures.length]
        const sectionId = feature.properties?.id
        const paddockId = feature.properties?.paddockId
        if (sectionId && feature.geometry?.type === 'Polygon') {
          onEditRequest?.({
            entityType: 'section',
            sectionId,
            paddockId,
            geometry: {
              type: 'Feature',
              properties: feature.properties ?? {},
              geometry: feature.geometry as Polygon,
            },
          })
        }
        return
      }

      const paddockFeatures = map.queryRenderedFeatures(e.point, {
        layers: ['paddocks-fill'],
      })

      if (paddockFeatures.length > 0) {
        const paddockId = paddockFeatures[0]?.properties?.id
        if (paddockId) {
          onEditRequest?.({ entityType: 'paddock', paddockId })
        }
        return
      }

      const drawHitLayers = [
        'gl-draw-polygon-fill-active',
        'gl-draw-polygon-fill-inactive',
        'gl-draw-polygon-fill-active.hot',
        'gl-draw-polygon-fill-inactive.cold',
      ]
      const availableDrawLayers = filterExistingLayers(drawHitLayers)
      const drawFeatures = availableDrawLayers.length
        ? map.queryRenderedFeatures(e.point, { layers: availableDrawLayers })
        : []
      if (drawFeatures.length > 0) {
        return
      }

      const draft = createDraftSquare(e.lngLat, 50)
      if (draft) {
        onEditRequest?.({
          entityType: 'paddock',
          geometry: draft,
        })
      }
    }

    const canvas = map.getCanvas()

    const handlePaddocksMouseEnter = () => {
      if (!isEditActive) {
        map.getCanvas().style.cursor = 'pointer'
      }
    }

    const handlePaddocksMouseLeave = () => {
      if (!isEditActive) {
        map.getCanvas().style.cursor = ''
      }
    }

    if (map.getLayer('paddocks-fill')) {
      map.on('click', 'paddocks-fill', handlePaddockLayerClick)
      map.on('mouseenter', 'paddocks-fill', handlePaddocksMouseEnter)
      map.on('mouseleave', 'paddocks-fill', handlePaddocksMouseLeave)
    }

    // Double click behavior: select section or create new paddock
    map.on('dblclick', handleMapDoubleClick)
    map.on('click', handleMapClickLog)

    return () => {
      map.off('dblclick', handleMapDoubleClick)
      map.off('click', handleMapClickLog)
      map.off('click', 'paddocks-fill', handlePaddockLayerClick)
      map.off('mouseenter', 'paddocks-fill', handlePaddocksMouseEnter)
      map.off('mouseleave', 'paddocks-fill', handlePaddocksMouseLeave)
    }
  }, [mapInstance, isMapLoaded, paddocks, getPaddockById, handlePaddockClick, isEditActive, isDrawing, onEditRequest, createDraftSquare, entityType, currentMode, selectedFeatureIds])

  // Load paddock geometries into draw when edit mode is activated
  useEffect(() => {
    if (!draw || !isEditActive || entityType !== 'paddock') return

    // Load existing paddock geometries into the draw plugin
    const features = paddocks.map((p) => ({
      ...p.geometry,
      id: p.id,
    }))
    loadGeometriesToDraw(draw, features)
  }, [draw, isEditActive, entityType, paddocks])

  // Select a newly created paddock when entering edit mode
  useEffect(() => {
    if (!draw || !isEditActive || entityType !== 'paddock' || !initialPaddockId) return
    const existing = draw.get(initialPaddockId)
    if (!existing) return
    draw.changeMode('direct_select', { featureId: initialPaddockId })
  }, [draw, isEditActive, entityType, initialPaddockId])

  // Load section geometry into draw and select it when editing sections
  useEffect(() => {
    if (!draw || !isEditActive || entityType !== 'section' || !initialSectionFeature) return

    const featureId = initialSectionId ?? initialSectionFeature.id?.toString()
    const feature = featureId
      ? { ...initialSectionFeature, id: featureId }
      : initialSectionFeature

    loadGeometriesToDraw(draw, [feature])

    if (featureId) {
      draw.changeMode('direct_select', { featureId })
    }
  }, [draw, entityType, isEditActive, initialSectionFeature, initialSectionId])

  // Focus map on the section bounds when editing sections
  useEffect(() => {
    if (!isMapLoaded || !isEditActive || entityType !== 'section' || !initialSectionFeature) return
    fitPolygonBounds(initialSectionFeature, 80)
  }, [entityType, fitPolygonBounds, initialSectionFeature, isEditActive, isMapLoaded])

  // Hide native paddock layers when editing paddocks (Draw will render them)
  useEffect(() => {
    if (!mapInstance || !isMapLoaded) return

    const paddockLayers = ['paddocks-fill', 'paddocks-outline']
    const visibility = isEditActive && entityType === 'paddock' ? 'none' : (showPaddocks ? 'visible' : 'none')
    
    paddockLayers.forEach(layerId => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(layerId, 'visibility', visibility)
      }
    })
  }, [mapInstance, isMapLoaded, isEditActive, entityType, showPaddocks])

  // Update selected paddock highlight
  useEffect(() => {
    if (!mapInstance || !isMapLoaded) return

    if (mapInstance.getLayer('paddocks-selected')) {
      mapInstance.removeLayer('paddocks-selected')
    }

    if (selectedPaddockId && !isEditActive) {
      mapInstance.addLayer({
        id: 'paddocks-selected',
        type: 'line',
        source: 'paddocks',
        paint: {
          'line-color': '#ffffff',
          'line-width': 3,
        },
        filter: ['==', ['get', 'id'], selectedPaddockId],
      })
    }
  }, [mapInstance, isMapLoaded, selectedPaddockId, isEditActive])

  // Toggle satellite/OSM basemap
  useEffect(() => {
    if (!mapInstance || !isMapLoaded) return
    
    if (mapInstance.getLayer('satellite-tiles')) {
      mapInstance.setLayoutProperty(
        'satellite-tiles',
        'visibility',
        showSatellite ? 'visible' : 'none'
      )
    }
    if (mapInstance.getLayer('osm-tiles')) {
      mapInstance.setLayoutProperty(
        'osm-tiles',
        'visibility',
        showSatellite ? 'none' : 'visible'
      )
    }
  }, [mapInstance, isMapLoaded, showSatellite])

  // Toggle NDVI heat layer
  useEffect(() => {
    if (!mapInstance || !isMapLoaded) return
    
    const ndviLayers = ['ndvi-heat', 'ndvi-heat-outline']
    ndviLayers.forEach(layerId => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(
          layerId,
          'visibility',
          showNdviHeat ? 'visible' : 'none'
        )
      }
    })
  }, [mapInstance, isMapLoaded, showNdviHeat])

  // Toggle labels visibility
  useEffect(() => {
    if (!mapInstance || !isMapLoaded) return
    
    if (mapInstance.getLayer('paddocks-labels')) {
      mapInstance.setLayoutProperty(
        'paddocks-labels',
        'visibility',
        showLabels ? 'visible' : 'none'
      )
    }
  }, [mapInstance, isMapLoaded, showLabels])

  // Toggle sections visibility
  useEffect(() => {
    if (!mapInstance || !isMapLoaded) return
    
    const sectionLayers = [
      'sections-grazed-fill',
      'sections-grazed-outline',
      'sections-current-fill',
      'sections-current-outline',
      'sections-alternatives-fill',
      'sections-alternatives-outline',
    ]
    sectionLayers.forEach(layerId => {
      if (mapInstance.getLayer(layerId)) {
        mapInstance.setLayoutProperty(
          layerId,
          'visibility',
          showSections ? 'visible' : 'none'
        )
      }
    })
  }, [mapInstance, isMapLoaded, showSections])

  // Position classes for toolbar
  const toolbarPositionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3',
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
      
      {isEditActive && showToolbar && (
        <div className={`absolute ${toolbarPositionClasses[toolbarPosition]} z-10`}>
          <DrawingToolbar
            currentMode={currentMode}
            selectedFeatureIds={selectedFeatureIds}
            isDrawing={isDrawing}
            onSetMode={setMode}
            onDeleteSelected={deleteSelected}
            onCancelDrawing={cancelDrawing}
            entityType={entityType}
            compact={compactToolbar}
          />
        </div>
      )}
    </div>
  )
})

// Helper function to add section layers
function addSectionLayers(mapInstance: maplibregl.Map) {
  const { recommendedSection, previousSections } = todaysPlan
  const visibleSectionIds = new Set([recommendedSection?.id, ...previousSections.map((s) => s.id)].filter(Boolean))
  const alternativeSections = todaysPlan.sectionAlternatives.filter((section) => !visibleSectionIds.has(section.id))

  // Create GeoJSON for previous (grazed) sections
  const grazedSectionsGeojson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: previousSections.map((s: Section, index: number) => ({
      ...s.geometry,
      properties: {
        id: s.id,
        day: index + 1,
        paddockId: s.paddockId,
      },
    })),
  }
  // Add grazed sections source
  mapInstance.addSource('sections-grazed', {
    type: 'geojson',
    data: grazedSectionsGeojson,
  })

  // Add grazed sections fill
  mapInstance.addLayer({
    id: 'sections-grazed-fill',
    type: 'fill',
    source: 'sections-grazed',
    paint: {
      'fill-color': '#64748b',
      'fill-opacity': 0.18,
    },
  })

  // Add grazed sections outline for differentiation
  mapInstance.addLayer({
    id: 'sections-grazed-outline',
    type: 'line',
    source: 'sections-grazed',
    paint: {
      'line-color': '#94a3b8',
      'line-width': 2,
      'line-dasharray': [2, 2],
    },
  })

  // Create GeoJSON for current section
  if (recommendedSection) {
    const currentSectionGeojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        ...recommendedSection.geometry,
        properties: {
          id: recommendedSection.id,
          area: recommendedSection.targetArea,
          paddockId: recommendedSection.paddockId,
        },
      }],
    }
    // Add current section source
    mapInstance.addSource('sections-current', {
      type: 'geojson',
      data: currentSectionGeojson,
    })

  // Add current section fill
    mapInstance.addLayer({
      id: 'sections-current-fill',
      type: 'fill',
      source: 'sections-current',
      paint: {
        'fill-color': '#22c55e',
        'fill-opacity': 0.45,
      },
    })

    // Add current section outline
    mapInstance.addLayer({
      id: 'sections-current-outline',
      type: 'line',
      source: 'sections-current',
      paint: {
        'line-color': '#22c55e',
        'line-width': 3,
      },
    })
  }

  if (alternativeSections.length > 0) {
    const alternativesGeojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: alternativeSections.map((s: Section, index: number) => ({
        ...s.geometry,
        properties: {
          id: s.id,
          altIndex: index + 1,
          paddockId: s.paddockId,
        },
      })),
    }

    mapInstance.addSource('sections-alternatives', {
      type: 'geojson',
      data: alternativesGeojson,
    })

    mapInstance.addLayer({
      id: 'sections-alternatives-fill',
      type: 'fill',
      source: 'sections-alternatives',
      paint: {
        'fill-color': '#60a5fa',
        'fill-opacity': 0.25,
      },
    })

    mapInstance.addLayer({
      id: 'sections-alternatives-outline',
      type: 'line',
      source: 'sections-alternatives',
      paint: {
        'line-color': '#3b82f6',
        'line-width': 2,
        'line-dasharray': [1.5, 1.5],
      },
    })
  }
}
