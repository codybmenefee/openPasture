import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorState } from './ErrorState'

interface ConnectionErrorProps {
  lastSynced?: string
  onRetry?: () => void
  onWorkOffline?: () => void
}

export function ConnectionError({
  lastSynced,
  onRetry,
  onWorkOffline,
}: ConnectionErrorProps) {
  const details: string[] = []
  
  if (lastSynced) {
    details.push(`Your last synced data is from ${lastSynced}.`)
  }

  return (
    <ErrorState
      icon={<WifiOff className="h-12 w-12" />}
      title="Connection Lost"
      message="Unable to reach the server."
      details={details}
      actions={
        <>
          {onRetry && (
            <Button onClick={onRetry}>
              Retry
            </Button>
          )}
          {onWorkOffline && (
            <Button variant="outline" onClick={onWorkOffline}>
              Work Offline
            </Button>
          )}
        </>
      }
    />
  )
}
