import { useState, useEffect, useMemo } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WaterSource, WaterSourceType, WaterSourceStatus } from '@/lib/types'
import { useAreaUnit } from '@/lib/hooks/useAreaUnit'

interface WaterSourceEditPanelProps {
  source: WaterSource
  onSave: (id: string, updates: { name?: string; type?: WaterSourceType; status?: WaterSourceStatus; description?: string }) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const waterSourceTypeOptions: { value: WaterSourceType; label: string }[] = [
  { value: 'trough', label: 'Trough' },
  { value: 'pond', label: 'Pond' },
  { value: 'dam', label: 'Dam' },
  { value: 'tank', label: 'Tank' },
  { value: 'stream', label: 'Stream' },
  { value: 'other', label: 'Other' },
]

const statusOptions: { value: WaterSourceStatus; label: string; description: string }[] = [
  { value: 'active', label: 'Active', description: 'Currently available and functioning' },
  { value: 'seasonal', label: 'Seasonal', description: 'Available during certain seasons only' },
  { value: 'maintenance', label: 'Maintenance', description: 'Temporarily unavailable for repairs' },
  { value: 'dry', label: 'Dry', description: 'Currently empty or unavailable' },
]

const statusStyles: Record<WaterSourceStatus, { bg: string; border: string; text: string }> = {
  active: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-600 dark:text-green-400' },
  seasonal: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-600 dark:text-yellow-400' },
  maintenance: { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
  dry: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-600 dark:text-red-400' },
}

export function WaterSourceEditPanel({
  source,
  onSave,
  onDelete,
  onClose,
}: WaterSourceEditPanelProps) {
  const { label, format } = useAreaUnit()
  const [name, setName] = useState(source.name)
  const [type, setType] = useState<WaterSourceType>(source.type)
  const [status, setStatus] = useState<WaterSourceStatus>(source.status ?? 'active')
  const [description, setDescription] = useState(source.description ?? '')

  useEffect(() => {
    setName(source.name)
    setType(source.type)
    setStatus(source.status ?? 'active')
    setDescription(source.description ?? '')
  }, [source.id, source.name, source.type, source.status, source.description])

  const typeLabel = useMemo(
    () => waterSourceTypeOptions.find((opt) => opt.value === type)?.label ?? 'Select type',
    [type]
  )

  const statusLabel = useMemo(
    () => statusOptions.find((opt) => opt.value === status)?.label ?? 'Select status',
    [status]
  )

  const statusInfo = useMemo(
    () => statusOptions.find((opt) => opt.value === status),
    [status]
  )

  const currentStatusStyles = statusStyles[status] ?? statusStyles.active

  const handleSave = () => {
    onSave(source.id, {
      name: name.trim() || source.name,
      type,
      status,
      description: description.trim() || undefined,
    })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this water source?')) {
      onDelete(source.id)
    }
  }

  return (
    <aside className="w-80 border-l border-border bg-card p-4 overflow-y-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-semibold text-lg">Edit Water Source</h2>
          <p className="text-sm text-muted-foreground">
            {source.geometryType === 'point' ? 'Point marker' : 'Area'}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter source name"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Type</label>
          <Select value={type} onValueChange={(value) => setType(value as WaterSourceType)}>
            <SelectTrigger className="w-full">
              <SelectValue>{typeLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {waterSourceTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Status</label>
          <Select value={status} onValueChange={(value) => setStatus(value as WaterSourceStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue>{statusLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {source.geometryType === 'polygon' && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Area ({label})</label>
            <Input
              type="text"
              value={source.area != null ? format(source.area, 2) : 'N/A'}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Auto-calculated from boundary</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Description</label>
          <Textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add notes about this water source..."
          />
        </div>

        <div className={`rounded-lg ${currentStatusStyles.bg} border ${currentStatusStyles.border} p-3`}>
          <p className={`text-sm font-medium ${currentStatusStyles.text}`}>
            Status: {statusInfo?.label ?? 'Active'}
          </p>
          <p className={`text-xs ${currentStatusStyles.text} mt-1`}>
            {statusInfo?.description ?? 'Currently available and functioning'}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Water sources are factored into grazing recommendations to ensure livestock have adequate access.
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex gap-2">
        <Button className="flex-1" onClick={handleSave}>
          Save Changes
        </Button>
        <Button variant="destructive" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}
