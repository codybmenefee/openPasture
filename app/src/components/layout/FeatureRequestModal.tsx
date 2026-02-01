import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useSubmitFeatureRequest,
  captureFeatureContext,
  FEATURE_CATEGORY_OPTIONS,
  type FeatureCategory,
} from '@/lib/convex/useFeatureRequest'
import { useCurrentUser } from '@/lib/convex/useCurrentUser'
import { useFarmContext } from '@/lib/farm'

interface FeatureRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeatureRequestModal({ open, onOpenChange }: FeatureRequestModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<FeatureCategory>('other')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitFeatureRequest = useSubmitFeatureRequest()
  const { user } = useCurrentUser()
  const { activeFarmId } = useFarmContext()

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('other')
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    setIsSubmitting(true)

    try {
      const context = captureFeatureContext()
      const result = await submitFeatureRequest({
        userExternalId: user?.externalId ?? undefined,
        farmExternalId: activeFarmId ?? undefined,
        title: title.trim(),
        description: description.trim(),
        category,
        context,
      })

      if (result.success) {
        toast.success('Feature request submitted', {
          description: result.githubIssueUrl
            ? 'A GitHub issue has been created.'
            : 'Thank you for your feedback.',
        })
        handleClose()
      } else {
        toast.error('Failed to submit feature request', {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error('Failed to submit feature request')
      console.error('Feature request error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request a Feature</DialogTitle>
            <DialogDescription>
              Help us prioritize what to build next by sharing your ideas.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="title"
                placeholder="Brief summary of the feature"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as FeatureCategory)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEATURE_CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="description"
                placeholder="What problem would this solve? How would it help your workflow?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
