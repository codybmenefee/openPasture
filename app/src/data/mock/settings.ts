import type { FarmSettings } from '@/lib/types'

const SETTINGS_KEY = 'grazing-intelligence-settings'

export const defaultSettings: FarmSettings = {
  minNDVIThreshold: 0.40,
  minRestPeriod: 21,
  cloudCoverTolerance: 50,
  dailyBriefTime: '06:00',
  emailNotifications: true,
  pushNotifications: false,
  virtualFenceProvider: undefined,
  apiKey: undefined,
}

export function getSettings(): FarmSettings {
  if (typeof window === 'undefined') return defaultSettings
  
  const stored = localStorage.getItem(SETTINGS_KEY)
  if (!stored) return defaultSettings
  
  try {
    return { ...defaultSettings, ...JSON.parse(stored) }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: FarmSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function resetSettings(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SETTINGS_KEY)
}
