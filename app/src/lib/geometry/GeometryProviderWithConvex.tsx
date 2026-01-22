import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { mapFarmDoc, mapPaddockDoc, mapSectionDoc, type FarmDoc, type PaddockDoc, type SectionDoc } from '@/lib/convex/mappers'
import { useCurrentUser } from '@/lib/convex/useCurrentUser'
import type { GeometryChange } from '@/lib/geometry/types'
import type { Paddock } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner'
import { ErrorState } from '@/components/ui/error/ErrorState'
import { GeometryProvider } from './GeometryContext'

interface GeometryProviderWithConvexProps {
  children: ReactNode
}

export function GeometryProviderWithConvex({ children }: GeometryProviderWithConvexProps) {
  const { farmId, isLoading: isUserLoading } = useCurrentUser()
  const farmDoc = useQuery(api.farms.getFarm, farmId ? { farmId } : 'skip') as FarmDoc | null | undefined
  const paddockDocs = useQuery(api.paddocks.listPaddocksByFarm, farmId ? { farmId } : 'skip') as
    | PaddockDoc[]
    | undefined
  const sectionDocs = useQuery(api.intelligence.getAllSections, farmId ? { farmExternalId: farmId } : 'skip') as
    | SectionDoc[]
    | undefined

  const seedFarm = useMutation(api.farms.seedSampleFarm)
  const applyPaddockChanges = useMutation(api.paddocks.applyPaddockChanges)
  const updatePaddockMetadata = useMutation(api.paddocks.updatePaddockMetadata)

  const seedRequestedRef = useRef(false)

  useEffect(() => {
    if (seedRequestedRef.current) return
    if (!farmId) return
    if (farmDoc === null) {
      seedRequestedRef.current = true
      void seedFarm({ farmId, seedSettings: true })
    }
  }, [farmDoc, farmId, seedFarm])

  useEffect(() => {
    if (seedRequestedRef.current) return
    if (!farmId) return
    if (farmDoc && paddockDocs && paddockDocs.length === 0) {
      seedRequestedRef.current = true
      void seedFarm({ farmId, seedSettings: true })
    }
  }, [farmDoc, farmId, paddockDocs, seedFarm])

  const paddocks = useMemo(() => (paddockDocs ?? []).map(mapPaddockDoc), [paddockDocs])
  const farm = farmDoc ? mapFarmDoc(farmDoc) : null
  const sections = useMemo(() => {
    console.log('[Sections] sectionDocs from Convex:', sectionDocs?.length, sectionDocs?.map(d => ({ id: d.id, paddockId: d.paddockId })))
    return (sectionDocs ?? []).map(mapSectionDoc)
  }, [sectionDocs])

  const handleGeometryChange = useCallback(
    async (changes: GeometryChange[]) => {
      if (!farmId) {
        throw new Error('Farm ID is unavailable.')
      }
      await applyPaddockChanges({ farmId, changes })
    },
    [applyPaddockChanges, farmId]
  )

  const handlePaddockMetadataChange = useCallback(
    async (paddockId: string, metadata: Partial<Omit<Paddock, 'id' | 'geometry'>>) => {
      if (!farmId) {
        throw new Error('Farm ID is unavailable.')
      }
      await updatePaddockMetadata({ farmId, paddockId, metadata })
    },
    [farmId, updatePaddockMetadata]
  )

  const isSeeding = !!farmId && (farmDoc === null || (!!farmDoc && paddockDocs?.length === 0))
  const isLoading =
    isUserLoading ||
    isSeeding ||
    (!!farmId && (farmDoc === undefined || paddockDocs === undefined || sectionDocs === undefined))
  if (isLoading) {
    const message = isSeeding ? 'Seeding farm geometry...' : 'Loading farm geometry...'
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message={message} />
      </div>
    )
  }

  if (!farmId) {
    return (
      <ErrorState
        title="Farm mapping unavailable"
        message="No farm is associated with this account yet."
        details={['Seed a farm record or map this user to a farm in Convex.']}
        className="min-h-screen"
      />
    )
  }

  if (!farm) {
    return (
      <ErrorState
        title="Farm geometry unavailable"
        message="No farm records were found yet. Seed the database or check your Convex connection."
        details={[
          'Ensure VITE_CONVEX_URL is set in your environment.',
          'Run `npx convex dev` in app/ to initialize the project.',
        ]}
        className="min-h-screen"
      />
    )
  }

  return (
    <GeometryProvider
      initialPaddocks={paddocks}
      initialSections={sections}
      onGeometryChange={handleGeometryChange}
      onPaddockMetadataChange={handlePaddockMetadataChange}
    >
      {children}
    </GeometryProvider>
  )
}
