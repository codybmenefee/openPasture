import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface CardSkeletonProps {
  hasHeader?: boolean
  lines?: number
  className?: string
}

export function CardSkeleton({ 
  hasHeader = true, 
  lines = 3,
  className 
}: CardSkeletonProps) {
  return (
    <Card className={cn(className)}>
      {hasHeader && (
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-1/3" />
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} 
          />
        ))}
      </CardContent>
    </Card>
  )
}
