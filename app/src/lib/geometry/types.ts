import type { Feature, Polygon } from 'geojson'
import type { Paddock, Section } from '@/lib/types'

export type GeometryChangeType = 'add' | 'update' | 'delete'
export type EntityType = 'paddock' | 'section'

export type PaddockMetadata = Omit<Paddock, 'id' | 'geometry'>
export type SectionMetadata = Omit<Section, 'id' | 'paddockId' | 'geometry'>

export interface GeometryChange {
  id: string
  entityType: EntityType
  changeType: GeometryChangeType
  geometry?: Feature<Polygon>
  parentId?: string // paddockId for sections
  timestamp: string
  metadata?: Partial<PaddockMetadata | SectionMetadata>
}

export interface PendingChange extends GeometryChange {
  synced: boolean
}

export interface GeometryContextValue {
  // State
  paddocks: Paddock[]
  sections: Section[]
  pendingChanges: PendingChange[]
  hasUnsavedChanges: boolean
  isSaving: boolean

  // Paddock operations
  addPaddock: (geometry: Feature<Polygon>, metadata?: Partial<Omit<Paddock, 'id' | 'geometry'>>) => string
  updatePaddock: (id: string, geometry: Feature<Polygon>) => void
  updatePaddockMetadata: (id: string, metadata: Partial<Omit<Paddock, 'id' | 'geometry'>>) => void
  deletePaddock: (id: string) => void

  // Section operations
  addSection: (paddockId: string, geometry: Feature<Polygon>, metadata?: Partial<Omit<Section, 'id' | 'paddockId' | 'geometry'>>) => string
  updateSection: (id: string, geometry: Feature<Polygon>) => void
  deleteSection: (id: string) => void

  // Utility
  getPaddockById: (id: string) => Paddock | undefined
  getSectionById: (id: string) => Section | undefined
  getSectionsByPaddockId: (paddockId: string) => Section[]

  // Save operations
  saveChanges: () => Promise<void>

  // Backend integration hook
  onGeometryChange?: (changes: GeometryChange[]) => Promise<void>
  onPaddockMetadataChange?: (id: string, metadata: Partial<PaddockMetadata>) => Promise<void>

  // Reset to initial state (useful for testing/demo)
  resetToInitial: () => void
}

export interface GeometryProviderProps {
  children: React.ReactNode
  initialPaddocks?: Paddock[]
  initialSections?: Section[]
  onGeometryChange?: (changes: GeometryChange[]) => Promise<void>
  onPaddockMetadataChange?: (id: string, metadata: Partial<PaddockMetadata>) => Promise<void>
}
