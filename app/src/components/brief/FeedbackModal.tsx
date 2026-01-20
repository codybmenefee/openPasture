import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { PaddockAlternative } from '@/lib/types'
import { useGeometry } from '@/lib/geometry'

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alternatives: PaddockAlternative[]
  onSubmit: (alternativePaddockId: string) => void
}

const quickReasons = [
  'Infrastructure issue',
  'Water access problem',
  'Weather concern',
  'Prefer different paddock',
]

export function FeedbackModal({ open, onOpenChange, alternatives, onSubmit }: FeedbackModalProps) {
  const { getPaddockById } = useGeometry()
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [selectedPaddock, setSelectedPaddock] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    if (selectedPaddock) {
      onSubmit(selectedPaddock)
    }
    // Reset state
    setSelectedReason(null)
    setSelectedPaddock(null)
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modify Today's Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick reasons */}
          <div>
            <p className="text-sm font-medium mb-3">What's the issue with the recommendation?</p>
            <div className="grid grid-cols-2 gap-2">
              {quickReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`rounded-md border px-3 py-2 text-sm text-left transition-colors ${
                    selectedReason === reason
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium">Additional context (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Gate on east side needs repair..."
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
            />
          </div>

          {/* Alternative selection */}
          <div>
            <p className="text-sm font-medium mb-3">Select alternative</p>
            <div className="space-y-2">
              {alternatives.map((alt) => {
                const paddock = getPaddockById(alt.paddockId)
                if (!paddock) return null
                return (
                  <button
                    key={alt.paddockId}
                    onClick={() => setSelectedPaddock(alt.paddockId)}
                    className={`w-full flex items-center justify-between rounded-md border px-4 py-3 text-left transition-colors ${
                      selectedPaddock === alt.paddockId
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{paddock.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Paddock {paddock.id.replace('p', '')}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {alt.confidence}% confidence
                    </span>
                  </button>
                )
              })}
              <button
                onClick={() => setSelectedPaddock('skip')}
                className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                  selectedPaddock === 'skip'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-medium">Skip today</p>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedPaddock}>
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
