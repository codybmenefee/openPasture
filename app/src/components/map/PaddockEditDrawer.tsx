import { useMemo, useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Paddock, PaddockStatus } from '@/lib/types'
import { useGeometry } from '@/lib/geometry'

interface PaddockEditDrawerProps {
  paddock: Paddock
  onClose: () => void
}

interface PaddockFormState {
  name: string
  status: PaddockStatus
  ndvi: number
  restDays: number
  area: number
  waterAccess: string
  lastGrazed: string
}

const statusOptions: { value: PaddockStatus; label: string }[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'almost_ready', label: 'Almost Ready' },
  { value: 'recovering', label: 'Recovering' },
  { value: 'grazed', label: 'Recently Grazed' },
]

function buildFormState(paddock: Paddock): PaddockFormState {
  return {
    name: paddock.name,
    status: paddock.status,
    ndvi: paddock.ndvi,
    restDays: paddock.restDays,
    area: paddock.area,
    waterAccess: paddock.waterAccess,
    lastGrazed: paddock.lastGrazed,
  }
}

export function PaddockEditDrawer({ paddock, onClose }: PaddockEditDrawerProps) {
  const { updatePaddockMetadata, deletePaddock } = useGeometry()
  const [form, setForm] = useState<PaddockFormState>(() => buildFormState(paddock))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lastPaddockId, setLastPaddockId] = useState(paddock.id)

  // Reset form when paddock changes
  if (paddock.id !== lastPaddockId) {
    setLastPaddockId(paddock.id)
    setForm(buildFormState(paddock))
  }

  const statusLabel = useMemo(
    () => statusOptions.find((option) => option.value === form.status)?.label ?? 'Select status',
    [form.status]
  )

  const handleSave = () => {
    updatePaddockMetadata(paddock.id, {
      name: form.name.trim() || paddock.name,
      status: form.status,
      ndvi: form.ndvi,
      restDays: form.restDays,
      area: form.area,
      waterAccess: form.waterAccess,
      lastGrazed: form.lastGrazed,
    })
  }

  const handleReset = () => {
    setForm(buildFormState(paddock))
  }

  const handleDelete = () => {
    deletePaddock(paddock.id)
    setDeleteDialogOpen(false)
    onClose()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b p-4">
        <div>
          <h2 className="font-semibold text-base">Edit {paddock.name}</h2>
          <p className="text-xs text-muted-foreground">Paddock {paddock.id.replace('p', '')}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 -mt-1 -mr-1">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Name</label>
            <Input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Status</label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm((prev) => ({ ...prev, status: value as PaddockStatus }))}
            >
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">NDVI</label>
              <Input
                type="number"
                min={-1}
                max={1}
                step={0.01}
                value={Number.isNaN(form.ndvi) ? '' : form.ndvi}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    ndvi: Number.isNaN(event.target.valueAsNumber) ? prev.ndvi : event.target.valueAsNumber,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Rest Days</label>
              <Input
                type="number"
                min={0}
                step={1}
                value={Number.isNaN(form.restDays) ? '' : form.restDays}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    restDays: Number.isNaN(event.target.valueAsNumber) ? prev.restDays : event.target.valueAsNumber,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Area (ha)</label>
              <Input
                type="number"
                min={0}
                step={0.1}
                value={Number.isNaN(form.area) ? '' : form.area}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    area: Number.isNaN(event.target.valueAsNumber) ? prev.area : event.target.valueAsNumber,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Last Grazed</label>
              <Input
                type="text"
                value={form.lastGrazed}
                onChange={(event) => setForm((prev) => ({ ...prev, lastGrazed: event.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Water Access</label>
            <Textarea
              rows={2}
              value={form.waterAccess}
              onChange={(event) => setForm((prev) => ({ ...prev, waterAccess: event.target.value }))}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Danger Zone */}
        <div className="space-y-2">
          <label className="text-xs text-destructive uppercase tracking-wide">Danger Zone</label>
          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Paddock
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Paddock</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{paddock.name}"? This action cannot be undone.
              All sections within this paddock will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
