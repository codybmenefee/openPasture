import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAppAuth, DEV_USER_EXTERNAL_ID } from '@/lib/auth'
import { DEFAULT_FARM_ID } from '@/lib/convex/constants'
import type { UserDoc } from '@/lib/convex/mappers'

interface UseCurrentUserResult {
  user: UserDoc | null
  farmId: string | null
  isLoading: boolean
  isSeeding: boolean
}

export function useCurrentUser(): UseCurrentUserResult {
  const { userId, isLoaded, isSignedIn, isDevAuth } = useAppAuth()
  const authReady = isDevAuth || (isLoaded && isSignedIn)
  const effectiveUserId = isDevAuth ? DEV_USER_EXTERNAL_ID : userId
  const seedSampleFarm = useMutation(api.farms.seedSampleFarm)
  const seedRequestedRef = useRef(false)
  const [isSeeding, setIsSeeding] = useState(false)

  const userDoc = useQuery(
    api.users.getUserByExternalId,
    authReady && effectiveUserId ? { externalId: effectiveUserId } : 'skip'
  ) as UserDoc | null | undefined

  useEffect(() => {
    if (!authReady || !effectiveUserId) return
    if (userDoc !== null) return
    if (seedRequestedRef.current) return

    seedRequestedRef.current = true
    setIsSeeding(true)
    void seedSampleFarm({
      farmId: DEFAULT_FARM_ID,
      seedUser: true,
      seedSettings: true,
      userExternalId: effectiveUserId,
    }).finally(() => setIsSeeding(false))
  }, [authReady, effectiveUserId, seedSampleFarm, userDoc])

  const isLoading = !authReady || (effectiveUserId ? userDoc === undefined : false) || isSeeding

  return {
    user: userDoc ?? null,
    farmId: userDoc?.farmExternalId ?? null,
    isLoading,
    isSeeding,
  }
}
