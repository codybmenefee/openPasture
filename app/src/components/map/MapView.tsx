import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSearch } from '@tanstack/react-router'
import { FarmMap, type FarmMapHandle } from './FarmMap'
import { PaddockPanel } from './PaddockPanel'
import { PaddockEditPanel } from './PaddockEditPanel'
import { LayerToggles } from './LayerToggles'
import { useGeometry, clipPolygonToPolygon } from '@/lib/geometry'
import { todaysPlan } from '@/data/mock/plan'
import type { Paddock, Section, SectionAlternative } from '@/lib/types'
import type { Feature, Polygon } from 'geojson'

interface MapSearchParams {
  edit?: boolean
  paddockId?: string
  sectionId?: string
  entityType?: 'paddock' | 'section'
}

export function MapView() {
  const search = useSearch({ from: '/map' }) as MapSearchParams
  
  const [selectedPaddock, setSelectedPaddock] = useState<Paddock | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [entityType, setEntityType] = useState<'paddock' | 'section'>('paddock')
  const [focusPaddockId, setFocusPaddockId] = useState<string | undefined>(undefined)
  const [editSectionFeature, setEditSectionFeature] = useState<Feature<Polygon> | null>(null)
  const [editSectionId, setEditSectionId] = useState<string | undefined>(undefined)
  const [initialPaddockId, setInitialPaddockId] = useState<string | undefined>(undefined)
  const mapRef = useRef<FarmMapHandle>(null)
  const { getSectionById, getPaddockById, addPaddock } = useGeometry()
  
  const [layers, setLayers] = useState({
    satellite: false,
    ndviHeat: false,
    paddocks: true,
    labels: true,
    sections: true,
  })

  // Initialize from URL search params on mount
  useEffect(() => {
    if (search.edit) {
      setEditMode(true)
      // When editing sections, show satellite imagery
      if (search.entityType === 'section') {
        setEntityType('section')
        setLayers(prev => ({ ...prev, satellite: true }))
      }
      if (search.paddockId) {
        setFocusPaddockId(search.paddockId)
      }
    }
  }, [search.edit, search.entityType, search.paddockId])

  const sectionFeature = useMemo<Section | SectionAlternative | null>(() => {
    if (search.entityType !== 'section' || !search.sectionId) return null
    const section = getSectionById(search.sectionId)
    if (section) return section
    if (todaysPlan.recommendedSection?.id === search.sectionId) {
      return todaysPlan.recommendedSection
    }
    return todaysPlan.sectionAlternatives.find((alt) => alt.id === search.sectionId) ?? null
  }, [getSectionById, search.entityType, search.sectionId])

  const sectionPaddockId = useMemo(() => {
    if (search.paddockId) return search.paddockId
    if (sectionFeature && 'paddockId' in sectionFeature) return sectionFeature.paddockId
    const props = sectionFeature?.geometry?.properties as { paddockId?: string } | undefined
    return props?.paddockId
  }, [search.paddockId, sectionFeature])

  const sectionPaddock = useMemo(() => {
    if (!sectionPaddockId) return undefined
    return getPaddockById(sectionPaddockId)
  }, [getPaddockById, sectionPaddockId])

  const clippedSectionGeometry = useMemo(() => {
    if (!sectionFeature) return null
    if (!sectionPaddock) return sectionFeature.geometry
    const clipped = clipPolygonToPolygon(sectionFeature.geometry, sectionPaddock.geometry)
    return clipped ?? sectionPaddock.geometry
  }, [sectionFeature, sectionPaddock])

  const effectiveSectionGeometry = editSectionFeature ?? clippedSectionGeometry ?? null
  const effectiveSectionId = editSectionId ?? sectionFeature?.id

  // Focus map on section bounds when available
  useEffect(() => {
    if (!effectiveSectionGeometry) return

    const tryFocus = () => {
      if (mapRef.current) {
        mapRef.current.focusOnGeometry(effectiveSectionGeometry)
        return true
      }
      return false
    }

    if (tryFocus()) return

    const timeouts = [100, 300, 600, 1000]
    const timers = timeouts.map((delay) =>
      setTimeout(() => tryFocus(), delay)
    )

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [effectiveSectionGeometry])

  // Focus map on paddock when editing sections
  // Use a retry mechanism since the map ref might not be ready immediately
  useEffect(() => {
    if (!focusPaddockId || effectiveSectionGeometry) return
    
    const tryFocus = () => {
      if (mapRef.current) {
        mapRef.current.focusOnPaddock(focusPaddockId)
        return true
      }
      return false
    }
    
    // Try immediately
    if (tryFocus()) return
    
    // Retry with delays if not ready
    const timeouts = [100, 300, 600, 1000]
    const timers = timeouts.map((delay) => 
      setTimeout(() => tryFocus(), delay)
    )
    
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [focusPaddockId, effectiveSectionGeometry])

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  const toggleEditMode = () => {
    setEditMode((prev) => !prev)
    // Clear selection when entering edit mode
    if (!editMode) {
      setSelectedPaddock(null)
    } else {
      // Reset entity type when exiting edit mode
      setEntityType('paddock')
      setFocusPaddockId(undefined)
      setEditSectionFeature(null)
      setEditSectionId(undefined)
      setInitialPaddockId(undefined)
    }
  }

  const handleEditRequest = useCallback((request: {
    entityType: 'paddock' | 'section'
    paddockId?: string
    sectionId?: string
    geometry?: Feature<Polygon>
  }) => {
    const isDuplicateSection =
      editMode &&
      request.entityType === 'section' &&
      entityType === 'section' &&
      request.sectionId &&
      request.sectionId === editSectionId
    const sameEffectiveSection =
      editMode &&
      entityType === 'section' &&
      request.entityType === 'section' &&
      request.sectionId &&
      request.sectionId === effectiveSectionId
    if (isDuplicateSection || sameEffectiveSection) {
      return
    }
    setEditMode(true)
    setEntityType(request.entityType)
    setSelectedPaddock(null)
    let nextFocusPaddockId: string | undefined
    let nextInitialPaddockId: string | undefined
    let nextEditSectionId: string | undefined

    if (request.entityType === 'section') {
      setLayers(prev => ({ ...prev, satellite: true }))
      nextFocusPaddockId = request.paddockId
      nextEditSectionId = request.sectionId
      nextInitialPaddockId = undefined
      setFocusPaddockId(nextFocusPaddockId)
      setEditSectionFeature(request.geometry ?? null)
      setEditSectionId(nextEditSectionId)
      setInitialPaddockId(nextInitialPaddockId)
    } else {
      setEditSectionFeature(null)
      setEditSectionId(undefined)
      nextEditSectionId = undefined
      if (request.geometry) {
        const newId = addPaddock(request.geometry)
        nextFocusPaddockId = newId
        nextInitialPaddockId = newId
        setFocusPaddockId(nextFocusPaddockId)
        setInitialPaddockId(nextInitialPaddockId)
      } else {
        nextFocusPaddockId = request.paddockId
        nextInitialPaddockId = request.paddockId
        setFocusPaddockId(nextFocusPaddockId)
        setInitialPaddockId(nextInitialPaddockId)
      }
    }
  }, [addPaddock, editMode, entityType, editSectionId, effectiveSectionId])

  const handleEditPaddockSelect = useCallback((paddock: Paddock | null) => {
    setSelectedPaddock(paddock)
  }, [])

  return (
    <div className="flex h-full">
      {/* Map area */}
      <div className="relative flex-1">
        <FarmMap
          ref={mapRef}
          onPaddockClick={setSelectedPaddock}
          onEditPaddockSelect={handleEditPaddockSelect}
          onEditRequest={handleEditRequest}
          selectedPaddockId={selectedPaddock?.id}
          showSatellite={layers.satellite}
          showNdviHeat={layers.ndviHeat}
          showPaddocks={layers.paddocks}
          showLabels={layers.labels}
          showSections={layers.sections}
          editable={true}
          editMode={editMode}
          entityType={entityType}
          parentPaddockId={entityType === 'section' ? focusPaddockId : undefined}
          initialSectionFeature={effectiveSectionGeometry ?? undefined}
          initialSectionId={effectiveSectionId}
          initialPaddockId={initialPaddockId}
          toolbarPosition="top-left"
        />
        
        {/* Edit mode indicator */}
        {editMode && (
          <div className="absolute top-3 right-3 z-10">
            <div className="rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              Editing {entityType === 'section' ? 'Sections' : 'Paddocks'}
            </div>
          </div>
        )}
        
        {/* Layer toggles */}
        <div className="absolute bottom-4 left-4 z-10">
          <LayerToggles 
            layers={layers} 
            onToggle={toggleLayer}
            editMode={editMode}
            onEditModeToggle={toggleEditMode}
            showEditToggle={true}
          />
        </div>
      </div>

      {/* Side panel */}
      {selectedPaddock && !editMode && (
        <PaddockPanel
          paddock={selectedPaddock}
          onClose={() => setSelectedPaddock(null)}
        />
      )}

      {selectedPaddock && editMode && entityType === 'paddock' && (
        <PaddockEditPanel
          paddock={selectedPaddock}
          onClose={() => {
            setSelectedPaddock(null)
            mapRef.current?.setDrawMode('simple_select')
          }}
        />
      )}
    </div>
  )
}
