import { useState, useEffect, useMemo } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WaterSource, WaterSourceType } from '@/lib/types'

interface WaterSourceEditPanelProps {
  source: WaterSource
  onSave: (id: string, updates: { name?: string; type?: WaterSourceType }) => void
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

export function WaterSourceEditPanel({
  source,
  onSave,
  onDelete,
  onClose,
}: WaterSourceEditPanelProps) {
  const [name, setName] = useState(source.name)
  const [type, setType] = useState<WaterSourceType>(source.type)

  useEffect(() => {
    setName(source.name)
    setType(source.type)
  }, [source.id, source.name, source.type])

  const typeLabel = useMemo(
    () => waterSourceTypeOptions.find((opt) => opt.value === type)?.label ?? 'Select type',
    [type]
  )

  const handleSave = () => {
    onSave(source.id, {
      name: name.trim() || source.name,
      type,
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

        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
          <p className="text-sm text-blue-600 dark:text-blue-400">
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
