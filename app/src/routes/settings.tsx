import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SettingsForm } from '@/components/settings'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner'
import { defaultSettings } from '@/data/mock/settings'
import { useFarmSettings } from '@/lib/convex/useFarmSettings'
import type { FarmSettings } from '@/lib/types'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { settings: storedSettings, isLoading, saveSettings, resetSettings } = useFarmSettings()
  const [settings, setSettings] = useState<FarmSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (isLoading) return
    setSettings(storedSettings)
    setHasChanges(false)
  }, [isLoading, storedSettings])

  const handleChange = (newSettings: FarmSettings) => {
    setSettings(newSettings)
    setHasChanges(true)
    setSaved(false)
  }

  const handleSave = async () => {
    await saveSettings(settings)
    setHasChanges(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = async () => {
    await resetSettings()
    setSettings(defaultSettings)
    setHasChanges(false)
  }

  const handleCancel = () => {
    setSettings(storedSettings)
    setHasChanges(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading settings..." />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your farm preferences and thresholds
        </p>
      </div>

      <SettingsForm settings={settings} onChange={handleChange} />

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600">Settings saved</span>
          )}
          <Button variant="outline" onClick={handleCancel} disabled={!hasChanges}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
