import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GrassQualityBadge } from './GrassQualityBadge'
import { DaysRemainingIndicator } from './DaysRemainingIndicator'
import { ExpandableReasoning } from './ExpandableReasoning'
import { PaddockMiniMap } from './PaddockMiniMap'
import type { Paddock, Section } from '@/lib/types'
import type { GrassQuality } from '@/lib/grassQuality'
import { getGrassQuality } from '@/lib/grassQuality'
import { MapPin } from 'lucide-react'
import { useAreaUnit } from '@/lib/hooks/useAreaUnit'

interface BriefCardProps {
  currentPaddockId: string
  paddock: Paddock
  onApprove: () => void
  onReject: () => void
  // Section-specific props
  section?: Section
  daysInCurrentPaddock?: number
  totalDaysPlanned?: number
  previousSections?: Section[]
  // Computed props for simplified display
  grassQuality?: GrassQuality
  summaryReason?: string
  reasoningDetails?: string[]
  // Hide action buttons (for sticky footer pattern)
  hideActions?: boolean
}

export function BriefCard({
  currentPaddockId,
  paddock,
  onApprove,
  onReject,
  section,
  daysInCurrentPaddock = 1,
  totalDaysPlanned = 4,
  previousSections = [],
  grassQuality,
  summaryReason,
  reasoningDetails = [],
  hideActions = false,
}: BriefCardProps) {
  const { format } = useAreaUnit()
  const daysRemaining = totalDaysPlanned - daysInCurrentPaddock

  // Use provided grassQuality or compute from NDVI
  const quality = grassQuality ?? getGrassQuality(paddock.ndvi)

  // Generate summary from reasoning if not provided
  const summary = summaryReason ?? `Best forage available after ${paddock.restDays} days rest`

  return (
    <Card className="overflow-hidden !p-0 !gap-0">
      {/* Tier 1: Stats Row */}
      <div className="p-3 flex items-center gap-3">
        {/* Map Thumbnail - 64x64px */}
        <div className="shrink-0 w-16 h-16">
          <PaddockMiniMap
            currentPaddockId={currentPaddockId}
            targetPaddockId={paddock.id}
            section={section}
            previousSections={previousSections}
            size="sm"
            className="!w-16 !h-16 !rounded-md"
          />
        </div>

        {/* Paddock Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold text-sm truncate">{paddock.name}</span>
            <GrassQualityBadge quality={quality} className="shrink-0" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <DaysRemainingIndicator daysRemaining={daysRemaining} />
            <span className="text-muted-foreground/50">-</span>
            <span>{section ? format(section.targetArea) : format(paddock.area)} section</span>
          </div>
        </div>
      </div>

      {/* Tier 2: Expandable Reasoning */}
      <ExpandableReasoning
        summary={summary}
        details={reasoningDetails}
      />

      {/* Tier 3: Action Footer */}
      {!hideActions && (
        <div className="p-3 border-t border-border bg-muted/20">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onReject}
              className="flex-1 h-9"
            >
              Reject
            </Button>
            <Button
              onClick={onApprove}
              className="flex-1 h-9"
            >
              Approve
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
