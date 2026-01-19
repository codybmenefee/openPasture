import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import type { Feature, Polygon } from 'geojson'
import type { Paddock, Section } from '@/lib/types'
import type {
  GeometryContextValue,
  GeometryProviderProps,
  GeometryChange,
  PendingChange,
} from './types'
import { paddocks as mockPaddocks } from '@/data/mock/paddocks'

const GeometryContext = createContext<GeometryContextValue | null>(null)
const STORAGE_KEY = 'pan.geometry.v1'
const STORAGE_VERSION = 1

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function createDefaultPaddockMetadata(): Omit<Paddock, 'id' | 'geometry'> {
  return {
    name: 'New Paddock',
    status: 'recovering',
    ndvi: 0.35,
    restDays: 0,
    area: 0,
    waterAccess: 'None',
    lastGrazed: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }
}

function createDefaultSectionMetadata(): Omit<Section, 'id' | 'paddockId' | 'geometry'> {
  return {
    date: new Date().toISOString().split('T')[0],
    targetArea: 0,
    reasoning: ['User-defined section'],
  }
}

function calculatePolygonArea(geometry: Feature<Polygon>): number {
  // Simple polygon area calculation (in hectares, approximate)
  // For production, use Turf.js area calculation
  const coords = geometry.geometry.coordinates[0]
  if (coords.length < 3) return 0

  let area = 0
  for (let i = 0; i < coords.length - 1; i++) {
    area += coords[i][0] * coords[i + 1][1]
    area -= coords[i + 1][0] * coords[i][1]
  }
  area = Math.abs(area) / 2

  // Convert from degrees to approximate hectares (very rough at mid-latitudes)
  const hectares = area * 111320 * 111320 * Math.cos((coords[0][1] * Math.PI) / 180) / 10000
  return Math.round(hectares * 10) / 10
}

function loadStoredGeometry(): { paddocks: Paddock[]; sections: Section[] } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { version?: number; paddocks?: Paddock[]; sections?: Section[] }
    if (parsed.version !== STORAGE_VERSION) return null
    if (!Array.isArray(parsed.paddocks) || !Array.isArray(parsed.sections)) return null
    return { paddocks: parsed.paddocks, sections: parsed.sections }
  } catch {
    return null
  }
}

function persistGeometry(paddocks: Paddock[], sections: Section[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        paddocks,
        sections,
      })
    )
  } catch {
    // Ignore storage failures (quota, private mode, etc.)
  }
}

function clearStoredGeometry() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures
  }
}

export function GeometryProvider({
  children,
  initialPaddocks,
  initialSections = [],
  onGeometryChange,
}: GeometryProviderProps) {
  const storedGeometry = loadStoredGeometry()
  const [paddocks, setPaddocks] = useState<Paddock[]>(
    storedGeometry?.paddocks ?? initialPaddocks ?? mockPaddocks
  )
  const [sections, setSections] = useState<Section[]>(
    storedGeometry?.sections ?? initialSections
  )
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])

  useEffect(() => {
    persistGeometry(paddocks, sections)
  }, [paddocks, sections])

  const recordChange = useCallback(
    (change: GeometryChange) => {
      const pendingChange: PendingChange = { ...change, synced: false }
      setPendingChanges((prev) => [...prev, pendingChange])

      // If there's a backend hook, call it
      if (onGeometryChange) {
        onGeometryChange([change]).then(() => {
          setPendingChanges((prev) =>
            prev.map((pc) => (pc.id === change.id && pc.timestamp === change.timestamp ? { ...pc, synced: true } : pc))
          )
        })
      }
    },
    [onGeometryChange]
  )

  // Paddock operations
  const addPaddock = useCallback(
    (geometry: Feature<Polygon>, metadata?: Partial<Omit<Paddock, 'id' | 'geometry'>>): string => {
      const id = `p-${generateId()}`
      const area = calculatePolygonArea(geometry)
      const newPaddock: Paddock = {
        ...createDefaultPaddockMetadata(),
        ...metadata,
        id,
        geometry,
        area: metadata?.area ?? area,
      }

      setPaddocks((prev) => [...prev, newPaddock])
      recordChange({
        id,
        entityType: 'paddock',
        changeType: 'add',
        geometry,
        timestamp: new Date().toISOString(),
      })

      return id
    },
    [recordChange]
  )

  const updatePaddock = useCallback(
    (id: string, geometry: Feature<Polygon>) => {
      const area = calculatePolygonArea(geometry)
      setPaddocks((prev) =>
        prev.map((p) => (p.id === id ? { ...p, geometry, area } : p))
      )
      recordChange({
        id,
        entityType: 'paddock',
        changeType: 'update',
        geometry,
        timestamp: new Date().toISOString(),
      })
    },
    [recordChange]
  )

  const updatePaddockMetadata = useCallback(
    (id: string, metadata: Partial<Omit<Paddock, 'id' | 'geometry'>>) => {
      setPaddocks((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...metadata } : p))
      )
    },
    []
  )

  const deletePaddock = useCallback(
    (id: string) => {
      setPaddocks((prev) => prev.filter((p) => p.id !== id))
      // Also delete all sections in this paddock
      setSections((prev) => prev.filter((s) => s.paddockId !== id))
      recordChange({
        id,
        entityType: 'paddock',
        changeType: 'delete',
        timestamp: new Date().toISOString(),
      })
    },
    [recordChange]
  )

  // Section operations
  const addSection = useCallback(
    (
      paddockId: string,
      geometry: Feature<Polygon>,
      metadata?: Partial<Omit<Section, 'id' | 'paddockId' | 'geometry'>>
    ): string => {
      const id = `s-${generateId()}`
      const targetArea = calculatePolygonArea(geometry)
      const newSection: Section = {
        ...createDefaultSectionMetadata(),
        ...metadata,
        id,
        paddockId,
        geometry,
        targetArea: metadata?.targetArea ?? targetArea,
      }

      setSections((prev) => [...prev, newSection])
      recordChange({
        id,
        entityType: 'section',
        changeType: 'add',
        geometry,
        parentId: paddockId,
        timestamp: new Date().toISOString(),
      })

      return id
    },
    [recordChange]
  )

  const updateSection = useCallback(
    (id: string, geometry: Feature<Polygon>) => {
      const targetArea = calculatePolygonArea(geometry)
      setSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, geometry, targetArea } : s))
      )

      const section = sections.find((s) => s.id === id)
      recordChange({
        id,
        entityType: 'section',
        changeType: 'update',
        geometry,
        parentId: section?.paddockId,
        timestamp: new Date().toISOString(),
      })
    },
    [recordChange, sections]
  )

  const deleteSection = useCallback(
    (id: string) => {
      const section = sections.find((s) => s.id === id)
      setSections((prev) => prev.filter((s) => s.id !== id))
      recordChange({
        id,
        entityType: 'section',
        changeType: 'delete',
        parentId: section?.paddockId,
        timestamp: new Date().toISOString(),
      })
    },
    [recordChange, sections]
  )

  // Utility functions
  const getPaddockById = useCallback(
    (id: string): Paddock | undefined => {
      return paddocks.find((p) => p.id === id)
    },
    [paddocks]
  )

  const getSectionById = useCallback(
    (id: string): Section | undefined => {
      return sections.find((s) => s.id === id)
    },
    [sections]
  )

  const getSectionsByPaddockId = useCallback(
    (paddockId: string): Section[] => {
      return sections.filter((s) => s.paddockId === paddockId)
    },
    [sections]
  )

  const resetToInitial = useCallback(() => {
    clearStoredGeometry()
    setPaddocks(initialPaddocks ?? mockPaddocks)
    setSections(initialSections)
    setPendingChanges([])
  }, [initialPaddocks, initialSections])

  const value = useMemo<GeometryContextValue>(
    () => ({
      paddocks,
      sections,
      pendingChanges,
      addPaddock,
      updatePaddock,
      updatePaddockMetadata,
      deletePaddock,
      addSection,
      updateSection,
      deleteSection,
      getPaddockById,
      getSectionById,
      getSectionsByPaddockId,
      onGeometryChange,
      resetToInitial,
    }),
    [
      paddocks,
      sections,
      pendingChanges,
      addPaddock,
      updatePaddock,
      updatePaddockMetadata,
      deletePaddock,
      addSection,
      updateSection,
      deleteSection,
      getPaddockById,
      getSectionById,
      getSectionsByPaddockId,
      onGeometryChange,
      resetToInitial,
    ]
  )

  return <GeometryContext.Provider value={value}>{children}</GeometryContext.Provider>
}

export function useGeometry(): GeometryContextValue {
  const context = useContext(GeometryContext)
  if (!context) {
    throw new Error('useGeometry must be used within a GeometryProvider')
  }
  return context
}

export { GeometryContext }
