import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { defaultSettings } from '@/data/mock/settings'
import type { FarmSettings } from '@/lib/types'
import { mapFarmSettingsDoc, type FarmSettingsDoc } from './mappers'
import { useFarm } from './useFarm'

interface UseFarmSettingsResult {
  farmId: string | null
  settings: FarmSettings
  isLoading: boolean
  saveSettings: (settings: FarmSettings) => Promise<void>
  resetSettings: () => Promise<void>
}

export function useFarmSettings(): UseFarmSettingsResult {
  const { farmId, isLoading: isFarmLoading } = useFarm()
  const settingsDoc = useQuery(
    api.settings.getSettings,
    farmId ? { farmId } : 'skip'
  ) as FarmSettingsDoc | null | undefined
  const updateSettings = useMutation(api.settings.updateSettings)
  const resetSettingsMutation = useMutation(api.settings.resetSettings)

  const isLoading = isFarmLoading || (!!farmId && settingsDoc === undefined)
  const settings = settingsDoc ? mapFarmSettingsDoc(settingsDoc) : defaultSettings

  const saveSettings = async (nextSettings: FarmSettings) => {
    if (!farmId) {
      throw new Error('Farm ID is unavailable.')
    }
    await updateSettings({ farmId, settings: nextSettings })
  }

  const resetSettings = async () => {
    if (!farmId) {
      throw new Error('Farm ID is unavailable.')
    }
    await resetSettingsMutation({ farmId })
  }

  return {
    farmId,
    settings,
    isLoading,
    saveSettings,
    resetSettings,
  }
}
