import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface LayerTogglesProps {
  layers: {
    satellite: boolean
    ndviHeat: boolean
    paddocks: boolean
    labels: boolean
    sections: boolean
  }
  onToggle: (layer: keyof LayerTogglesProps['layers']) => void
  editMode?: boolean
  onEditModeToggle?: () => void
  showEditToggle?: boolean
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" />
    </svg>
  )
}

export function LayerToggles({ 
  layers, 
  onToggle, 
  editMode = false,
  onEditModeToggle,
  showEditToggle = true,
}: LayerTogglesProps) {
  const buttons = [
    { key: 'satellite' as const, label: 'Satellite' },
    { key: 'ndviHeat' as const, label: 'NDVI Heat' },
    { key: 'paddocks' as const, label: 'Paddocks' },
    { key: 'sections' as const, label: 'Sections' },
    { key: 'labels' as const, label: 'Labels' },
  ]

  return (
    <div className="flex gap-1 rounded-lg border border-border bg-background/95 backdrop-blur p-1">
      {buttons.map((btn) => (
        <Button
          key={btn.key}
          variant="ghost"
          size="sm"
          onClick={() => onToggle(btn.key)}
          className={cn(
            'h-7 px-3 text-xs',
            layers[btn.key] && 'bg-accent'
          )}
        >
          {btn.label}
        </Button>
      ))}
      
      {showEditToggle && onEditModeToggle && (
        <>
          <Separator orientation="vertical" className="h-6 mx-0.5 my-0.5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onEditModeToggle}
            className={cn(
              'h-7 px-3 text-xs gap-1.5',
              editMode && 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <EditIcon />
            Edit
          </Button>
        </>
      )}
    </div>
  )
}
