import { useState } from 'react'
import { Eye, EyeOff, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface IntegrationCardProps {
  provider?: string
  apiKey?: string
  onProviderChange: (provider: string) => void
  onApiKeyChange: (apiKey: string) => void
}

const providers = [
  { value: 'halter', label: 'Halter' },
  { value: 'vence', label: 'Vence' },
  { value: 'nofence', label: 'Nofence' },
  { value: 'other', label: 'Other' },
]

export function IntegrationCard({
  provider,
  apiKey,
  onProviderChange,
  onApiKeyChange,
}: IntegrationCardProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [isEditingKey, setIsEditingKey] = useState(false)
  const [tempKey, setTempKey] = useState(apiKey || '')

  const maskedKey = apiKey 
    ? `${'*'.repeat(Math.min(apiKey.length, 8))}${apiKey.slice(-4)}`
    : 'Not configured'

  const handleSaveKey = () => {
    onApiKeyChange(tempKey)
    setIsEditingKey(false)
  }

  const handleCancelEdit = () => {
    setTempKey(apiKey || '')
    setIsEditingKey(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Virtual Fence Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider</label>
          <Select 
            value={provider || 'none'} 
            onValueChange={(v) => onProviderChange(v === 'none' ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {providers.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {provider && (
          <div className="space-y-2">
            <label className="text-sm font-medium">API Key</label>
            {isEditingKey ? (
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Enter API key"
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={handleSaveKey}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={showApiKey ? (apiKey || '') : maskedKey}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => {
                    setTempKey(apiKey || '')
                    setIsEditingKey(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
