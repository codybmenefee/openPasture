import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { NoGrazeZone } from '@/lib/types'

interface NoGrazeEditPanelProps {
  zone: NoGrazeZone
  onSave: (id: string, name: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function NoGrazeEditPanel({ zone, onSave, onDelete, onClose }: NoGrazeEditPanelProps) {
  const [name, setName] = useState(zone.name)

  useEffect(() => {
    setName(zone.name)
  }, [zone.id, zone.name])

  const handleSave = () => {
    onSave(zone.id, name.trim() || zone.name)
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this no-graze zone?')) {
      onDelete(zone.id)
    }
  }

  return (
    <aside className="w-80 border-l border-border bg-card p-4 overflow-y-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="font-semibold text-lg">Edit No-graze Zone</h2>
          <p className="text-sm text-muted-foreground">Exclusion area</p>
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
            placeholder="Enter zone name"
          />
        </div>

        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm text-red-600 dark:text-red-400">
            This zone will be excluded from grazing recommendations. Collars will receive alerts when animals enter this area.
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
