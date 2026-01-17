import { Card, CardContent } from '@/components/ui/card'
import { ConfidenceBar } from './ConfidenceBar'
import { PaddockMiniMap } from './PaddockMiniMap'
import type { Paddock } from '@/lib/types'

interface AlternativeCardProps {
  paddock: Paddock
  confidence: number
  currentPaddockId?: string
}

export function AlternativeCard({ paddock, confidence, currentPaddockId }: AlternativeCardProps) {
  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Mini map showing this alternative's location */}
          {currentPaddockId && (
            <div className="flex-shrink-0">
              <PaddockMiniMap
                currentPaddockId={currentPaddockId}
                targetPaddockId={paddock.id}
                size="sm"
                className="w-16 h-16"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <p className="font-medium truncate">{paddock.name}</p>
              <p className="text-xs text-muted-foreground">
                Paddock {paddock.id.replace('p', '')}
              </p>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{confidence}%</span>
              </div>
              <ConfidenceBar value={confidence} />
            </div>

            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>NDVI {paddock.ndvi.toFixed(2)}</span>
              <span>{paddock.restDays}d</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
