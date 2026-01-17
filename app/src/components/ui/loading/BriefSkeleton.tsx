import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CardSkeleton } from './CardSkeleton'

export function BriefSkeleton() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Narrative skeleton */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-3/4" />
            </CardContent>
          </Card>

          {/* Recommendation card skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mini map placeholder */}
              <Skeleton className="h-32 w-full rounded-lg" />
              
              {/* Confidence bar */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              
              {/* Reasoning */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
              </div>
            </CardContent>
          </Card>

          {/* Alternatives skeleton */}
          <div>
            <Skeleton className="h-4 w-24 mb-4" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <CardSkeleton hasHeader={false} lines={2} />
              <CardSkeleton hasHeader={false} lines={2} />
              <CardSkeleton hasHeader={false} lines={2} />
            </div>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={3} />
        </div>
      </div>
    </div>
  )
}
