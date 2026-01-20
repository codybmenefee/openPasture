import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { DEFAULT_FARM_ID } from './constants'
import { mapFarmDoc, type FarmDoc } from './mappers'
import type { Farm } from '@/lib/types'

interface UseFarmResult {
  farm: Farm | null | undefined
  isLoading: boolean
}

export function useFarm(): UseFarmResult {
  const farmDoc = useQuery(api.farms.getFarm, { farmId: DEFAULT_FARM_ID }) as FarmDoc | null | undefined

  if (farmDoc === undefined) {
    return { farm: undefined, isLoading: true }
  }

  if (farmDoc === null) {
    return { farm: null, isLoading: false }
  }

  return { farm: mapFarmDoc(farmDoc), isLoading: false }
}
