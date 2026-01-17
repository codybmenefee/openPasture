import { Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorState } from './ErrorState'

interface NoDataErrorProps {
  lastObservation?: string
  nextExpectedPass?: string
  onViewLastBrief?: () => void
  onManualOverride?: () => void
}

export function NoDataError({
  lastObservation,
  nextExpectedPass,
  onViewLastBrief,
  onManualOverride,
}: NoDataErrorProps) {
  const details: string[] = []
  
  if (lastObservation) {
    details.push(`Last successful observation: ${lastObservation}`)
  }
  if (nextExpectedPass) {
    details.push(`Next satellite pass: ${nextExpectedPass} (estimated)`)
  }

  return (
    <ErrorState
      icon={<Cloud className="h-12 w-12" />}
      title="Unable to Generate Brief"
      message="Recent satellite passes were obscured by cloud cover. We need at least 50% clear imagery to make confident recommendations."
      details={details}
      actions={
        <>
          {onViewLastBrief && (
            <Button variant="outline" onClick={onViewLastBrief}>
              View Last Brief
            </Button>
          )}
          {onManualOverride && (
            <Button onClick={onManualOverride}>
              Use Manual Override
            </Button>
          )}
        </>
      }
    />
  )
}
