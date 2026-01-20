import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { mapFarmDoc, type FarmDoc } from './mappers'
import type { Farm } from '@/lib/types'
import { useCurrentUser } from './useCurrentUser'

interface UseFarmResult {
  farmId: string | null
  farm: Farm | null | undefined
  isLoading: boolean
}

export function useFarm(): UseFarmResult {
  const { farmId, isLoading: isUserLoading } = useCurrentUser()
  const farmDoc = useQuery(
    api.farms.getFarm,
    farmId ? { farmId } : 'skip'
  ) as FarmDoc | null | undefined

  if (isUserLoading || (!!farmId && farmDoc === undefined)) {
    return { farmId, farm: undefined, isLoading: true }
  }

  if (!farmId || farmDoc === null) {
    return { farmId, farm: null, isLoading: false }
  }

  if (farmDoc === undefined) {
    return { farmId, farm: undefined, isLoading: true }
  }

  return { farmId, farm: mapFarmDoc(farmDoc), isLoading: false }
}
