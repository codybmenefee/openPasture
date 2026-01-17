import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ThumbsUp, ThumbsDown, ArrowRight, Grid3X3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HistoryEntry } from '@/lib/types'

interface HistoryFeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: HistoryEntry | null
  onSubmit: (entryId: string, feedback: { rating: 'positive' | 'negative' | null; category: string | null; comment: string }) => void
}

const feedbackCategories = [
  'Good recommendation',
  'Poor timing',
  'Wrong location',
  'Weather issue',
  'Infrastructure problem',
  'Other',
]

export function HistoryFeedbackModal({ open, onOpenChange, entry, onSubmit }: HistoryFeedbackModalProps) {
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [comment, setComment] = useState('')

  const resetForm = () => {
    setRating(null)
    setSelectedCategory(null)
    setComment('')
  }

  const handleSubmit = () => {
    if (!entry) return
    onSubmit(entry.id, { rating, category: selectedCategory, comment })
    resetForm()
    onOpenChange(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (!entry) return null

  const isTransition = entry.eventType === 'paddock_transition'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Feedback</DialogTitle>
          <DialogDescription>
            Help improve future recommendations by sharing your experience with this movement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Movement context */}
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {isTransition ? (
                  <>
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Transition
                  </>
                ) : (
                  <>
                    <Grid3X3 className="h-3 w-3 mr-1" />
                    Section
                  </>
                )}
              </Badge>
              <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
            </div>
            {isTransition ? (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{entry.fromPaddockName}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{entry.paddockName}</span>
              </div>
            ) : (
              <div>
                <span className="font-medium">{entry.paddockName}</span>
                {entry.dayInPaddock && entry.totalDaysInPaddock && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Day {entry.dayInPaddock} of {entry.totalDaysInPaddock})
                  </span>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">{entry.reasoning}</p>
          </div>

          {/* Rating */}
          <div>
            <p className="text-sm font-medium mb-3">Was this a good recommendation?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setRating('positive')}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-4 py-2.5 transition-colors',
                  rating === 'positive'
                    ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'border-border hover:border-green-500/50'
                )}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Yes</span>
              </button>
              <button
                onClick={() => setRating('negative')}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-4 py-2.5 transition-colors',
                  rating === 'negative'
                    ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'
                    : 'border-border hover:border-red-500/50'
                )}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>No</span>
              </button>
            </div>
          </div>

          {/* Category selection */}
          <div>
            <p className="text-sm font-medium mb-3">Category (optional)</p>
            <div className="grid grid-cols-2 gap-2">
              {feedbackCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className={cn(
                    'rounded-md border px-3 py-2 text-sm text-left transition-colors',
                    selectedCategory === category
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Comment textarea */}
          <div>
            <label className="text-sm font-medium">Additional comments (optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share any details that could help improve future recommendations..."
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!rating && !selectedCategory && !comment}>
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
