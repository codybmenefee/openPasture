import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Feature, Polygon } from 'geojson'
import { useGeometry, calculateAreaHectares } from '@/lib/geometry'

interface SectionEditDrawerProps {
  sectionId: string
  paddockId: string
  geometry: Feature<Polygon>
  onClose: () => void
}

export function SectionEditDrawer({ sectionId, paddockId, geometry, onClose }: SectionEditDrawerProps) {
  const { deleteSection, getSectionById, getPaddockById } = useGeometry()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const section = getSectionById(sectionId)
  const paddock = getPaddockById(paddockId)
  const area = section?.targetArea ?? calculateAreaHectares(geometry)

  const handleDelete = () => {
    deleteSection(sectionId)
    setDeleteDialogOpen(false)
    onClose()
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b p-4">
        <div>
          <h2 className="font-semibold text-base">Edit Section</h2>
          <p className="text-xs text-muted-foreground">
            in {paddock?.name ?? `Paddock ${paddockId}`}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 -mt-1 -mr-1">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="rounded-md border border-border bg-muted/50 p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Section Area</div>
            <div className="text-2xl font-semibold">{area.toFixed(2)} ha</div>
          </div>

          {section?.reasoning && section.reasoning.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Reasoning</label>
              <ul className="text-sm space-y-1">
                {section.reasoning.map((reason, i) => (
                  <li key={i} className="text-muted-foreground">• {reason}</li>
                ))}
              </ul>
            </div>
          )}

          {section?.date && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Date</label>
              <p className="text-sm">{section.date}</p>
            </div>
          )}

          <div className="rounded-md border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              Drag section vertices on the map to resize. Changes are tracked in "unsaved changes."
            </p>
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
            Delete Section
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <Button className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Section</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this section? This action cannot be undone.
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
