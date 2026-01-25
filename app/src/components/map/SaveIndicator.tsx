import { useEffect, useState, useCallback } from 'react'
import { Save, Check, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGeometry } from '@/lib/geometry'
import { cn } from '@/lib/utils'

interface SaveIndicatorProps {
  className?: string
}

export function SaveIndicator({ className }: SaveIndicatorProps) {
  const { hasUnsavedChanges, isSaving, saveChanges, pendingChanges, resetToInitial } = useGeometry()
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unsavedCount = pendingChanges.filter((c) => !c.synced).length

  const handleSave = useCallback(async () => {
    setError(null)
    try {
      await saveChanges()
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
      setTimeout(() => setError(null), 3000)
    }
  }, [saveChanges])

  // Keyboard shortcut: Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (hasUnsavedChanges && !isSaving) {
          void handleSave()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasUnsavedChanges, isSaving, handleSave])

  // Don't render if no unsaved changes and not showing success/error state
  if (!hasUnsavedChanges && !showSuccess && !error) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-background/95 backdrop-blur px-3 py-2 shadow-lg',
        className
      )}
    >
      {error ? (
        <span className="text-destructive text-sm">{error}</span>
      ) : showSuccess ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600">Saved</span>
        </>
      ) : (
        <>
          <Badge variant="secondary" className="text-xs">
            {unsavedCount} unsaved {unsavedCount === 1 ? 'change' : 'changes'}
          </Badge>
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            disabled={isSaving}
            className="h-7 gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-3 w-3" />
                Save
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetToInitial}
            disabled={isSaving}
            className="h-7 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {navigator.platform.includes('Mac') ? '⌘S' : 'Ctrl+S'}
          </span>
        </>
      )}
    </div>
  )
}
