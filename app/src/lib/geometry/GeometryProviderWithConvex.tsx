import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { DEFAULT_FARM_ID } from '@/lib/convex/constants'
import { mapFarmDoc, mapPaddockDoc, type FarmDoc, type PaddockDoc } from '@/lib/convex/mappers'
import type { GeometryChange } from '@/lib/geometry/types'
import type { Paddock } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner'
import { ErrorState } from '@/components/ui/error/ErrorState'
import { GeometryProvider } from './GeometryContext'

interface GeometryProviderWithConvexProps {
  children: ReactNode
}

export function GeometryProviderWithConvex({ children }: GeometryProviderWithConvexProps) {
  const farmDoc = useQuery(api.farms.getFarm, { farmId: DEFAULT_FARM_ID }) as FarmDoc | null | undefined
  const paddockDocs = useQuery(api.paddocks.listPaddocksByFarm, { farmId: DEFAULT_FARM_ID }) as
    | PaddockDoc[]
    | undefined

  const seedFarm = useMutation(api.farms.seedSampleFarm)
  const applyPaddockChanges = useMutation(api.paddocks.applyPaddockChanges)
  const updatePaddockMetadata = useMutation(api.paddocks.updatePaddockMetadata)

  const seedRequestedRef = useRef(false)

  useEffect(() => {
    if (seedRequestedRef.current) return
    if (farmDoc === null) {
      seedRequestedRef.current = true
      void seedFarm({ farmId: DEFAULT_FARM_ID })
    }
  }, [farmDoc, seedFarm])

  useEffect(() => {
    if (seedRequestedRef.current) return
    if (farmDoc && paddockDocs && paddockDocs.length === 0) {
      seedRequestedRef.current = true
      void seedFarm({ farmId: DEFAULT_FARM_ID })
    }
  }, [farmDoc, paddockDocs, seedFarm])

  const paddocks = useMemo(() => (paddockDocs ?? []).map(mapPaddockDoc), [paddockDocs])
  const farm = farmDoc ? mapFarmDoc(farmDoc) : null

  const handleGeometryChange = useCallback(
    async (changes: GeometryChange[]) => {
      try {
        const result = await applyPaddockChanges({ farmId: DEFAULT_FARM_ID, changes })
        return result
      } catch (error) {
        throw error
      }
    },
    [applyPaddockChanges]
  )

  const handlePaddockMetadataChange = useCallback(
    async (paddockId: string, metadata: Partial<Omit<Paddock, 'id' | 'geometry'>>) => {
      await updatePaddockMetadata({ farmId: DEFAULT_FARM_ID, paddockId, metadata })
    },
    [updatePaddockMetadata]
  )

  const isSeeding = farmDoc === null || (!!farmDoc && paddockDocs?.length === 0)
  const isLoading = farmDoc === undefined || paddockDocs === undefined || isSeeding
  if (isLoading) {
    const message = isSeeding ? 'Seeding farm geometry...' : 'Loading farm geometry...'
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message={message} />
      </div>
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
      onGeometryChange={handleGeometryChange}
      onPaddockMetadataChange={handlePaddockMetadataChange}
    >
      {children}
    </GeometryProvider>
  )
}
