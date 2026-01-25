import { useNavigate } from '@tanstack/react-router'
import { MapPin, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ThresholdSlider } from './ThresholdSlider'
import { IntegrationCard } from './IntegrationCard'
import type { FarmSettings } from '@/lib/types'
import { useFarm } from '@/lib/convex/useFarm'
import { useFarmBoundary } from '@/lib/hooks/useFarmBoundary'

interface SettingsFormProps {
  settings: FarmSettings
  onChange: (settings: FarmSettings) => void
}

export function SettingsForm({ settings, onChange }: SettingsFormProps) {
  const navigate = useNavigate()
  const { farm } = useFarm()
  const { hasBoundary, boundaryArea } = useFarmBoundary()

  const handleEditBoundary = () => {
    navigate({ to: '/', search: { editBoundary: 'true' } })
  }

  const updateSetting = <K extends keyof FarmSettings>(
    key: K,
    value: FarmSettings[K]
  ) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-6">
      {/* Farm Configuration */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Farm Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Farm Name</label>
              <Input value={farm?.name ?? ''} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input value={farm?.location ?? ''} readOnly className="bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Total Area</label>
            <div className="flex items-center gap-2">
              <Input
                value={farm?.totalArea ?? ''}
                readOnly
                className="bg-muted w-24"
              />
              <span className="text-sm text-muted-foreground">hectares</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farm Boundary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Farm Boundary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasBoundary ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Boundary defined</p>
                  <p className="text-xs text-muted-foreground">
                    {boundaryArea} hectares
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleEditBoundary}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Boundary
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No boundary defined</p>
                  <p className="text-xs text-muted-foreground">
                    Draw your farm boundary to enable map fitting and satellite data sync
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={handleEditBoundary}>
                Draw Farm Boundary
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grazing Thresholds */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Grazing Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ThresholdSlider
            label="Minimum NDVI for Grazing"
            description="Paddocks below this value won't be recommended"
            value={settings.minNDVIThreshold}
            min={0.2}
            max={0.6}
            step={0.05}
            unit=""
            formatValue={(v) => v.toFixed(2)}
            onChange={(v) => updateSetting('minNDVIThreshold', v)}
          />
          
          <Separator />
          
          <ThresholdSlider
            label="Minimum Rest Period"
            description="Days since last grazing before recommending"
            value={settings.minRestPeriod}
            min={7}
            max={42}
            step={1}
            unit="days"
            onChange={(v) => updateSetting('minRestPeriod', v)}
          />
          
          <Separator />
          
          <ThresholdSlider
            label="Cloud Cover Tolerance"
            description="Maximum cloud cover for usable satellite data"
            value={settings.cloudCoverTolerance}
            min={20}
            max={80}
            step={5}
            unit="%"
            onChange={(v) => updateSetting('cloudCoverTolerance', v)}
          />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Daily Brief Time</label>
            <Input
              type="time"
              value={settings.dailyBriefTime}
              onChange={(e) => updateSetting('dailyBriefTime', e.target.value)}
              className="w-32"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Email Notifications</label>
              <p className="text-xs text-muted-foreground">
                Receive daily briefs via email
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(v) => updateSetting('emailNotifications', v)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Push Notifications</label>
              <p className="text-xs text-muted-foreground">
                Get alerts on your device
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(v) => updateSetting('pushNotifications', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <IntegrationCard
        provider={settings.virtualFenceProvider}
        apiKey={settings.apiKey}
        onProviderChange={(v) => updateSetting('virtualFenceProvider', v)}
        onApiKeyChange={(v) => updateSetting('apiKey', v)}
      />
    </div>
  )
}
