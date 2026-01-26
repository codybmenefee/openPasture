import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThresholdSlider } from './ThresholdSlider'
import { Separator } from '@/components/ui/separator'
import { useFarmContext } from '@/lib/farm'
import { DEFAULT_LIVESTOCK_SETTINGS } from '@/lib/animalUnits'
import type { LivestockSettings as LivestockSettingsType } from '@/lib/types'
import { toast } from 'sonner'

export function LivestockSettings() {
  const { activeFarmId } = useFarmContext()

  const settingsData = useQuery(
    api.settings.getLivestockSettings,
    activeFarmId ? { farmId: activeFarmId } : 'skip'
  )

  const updateSettings = useMutation(api.settings.updateLivestockSettings)

  const [settings, setSettings] = useState<LivestockSettingsType>(DEFAULT_LIVESTOCK_SETTINGS)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initialize from server data
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData as LivestockSettingsType)
      setHasChanges(false)
    }
  }, [settingsData])

  const handleChange = (key: keyof LivestockSettingsType, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!activeFarmId) return
    setSaving(true)
    try {
      await updateSettings({
        farmId: activeFarmId,
        livestockSettings: settings,
      })
      setHasChanges(false)
      toast.success('Livestock settings saved')
    } catch (error) {
      console.error('Failed to save livestock settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(DEFAULT_LIVESTOCK_SETTINGS)
    setHasChanges(true)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Livestock Calculations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Configure animal unit (AU) factors and consumption rates for grazing calculations.
          These defaults work for most operations but can be adjusted for your specific breeds
          and conditions.
        </p>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Animal Unit Factors</h4>
          <p className="text-xs text-muted-foreground">
            AU factors determine the relative grazing impact. A mature cow is typically 1.0 AU.
          </p>

          <ThresholdSlider
            label="Cow AU"
            description="Mature breeding cow"
            value={settings.cowAU}
            min={0.5}
            max={1.5}
            step={0.1}
            unit="AU"
            formatValue={(v) => v.toFixed(1)}
            onChange={(v) => handleChange('cowAU', v)}
          />

          <ThresholdSlider
            label="Calf AU"
            description="Nursing or weaned calf"
            value={settings.calfAU}
            min={0.2}
            max={0.8}
            step={0.1}
            unit="AU"
            formatValue={(v) => v.toFixed(1)}
            onChange={(v) => handleChange('calfAU', v)}
          />

          <ThresholdSlider
            label="Sheep AU"
            description="Mature breeding ewe"
            value={settings.sheepAU}
            min={0.1}
            max={0.4}
            step={0.05}
            unit="AU"
            formatValue={(v) => v.toFixed(2)}
            onChange={(v) => handleChange('sheepAU', v)}
          />

          <ThresholdSlider
            label="Lamb AU"
            description="Nursing or weaned lamb"
            value={settings.lambAU}
            min={0.05}
            max={0.2}
            step={0.01}
            unit="AU"
            formatValue={(v) => v.toFixed(2)}
            onChange={(v) => handleChange('lambAU', v)}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Daily Consumption</h4>

          <ThresholdSlider
            label="Dry Matter per AU"
            description="Daily forage consumption per animal unit"
            value={settings.dailyDMPerAU}
            min={8}
            max={16}
            step={0.5}
            unit="kg"
            formatValue={(v) => v.toFixed(1)}
            onChange={(v) => handleChange('dailyDMPerAU', v)}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
