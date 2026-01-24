import { Button } from '@/components/ui/button'
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
  showEditToggle?: boolean
}

export function LayerToggles({
  layers,
  onToggle,
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
    </div>
  )
}
