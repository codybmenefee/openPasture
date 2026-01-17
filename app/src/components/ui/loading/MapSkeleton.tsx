import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'

interface MapSkeletonProps {
  className?: string
}

export function MapSkeleton({ className }: MapSkeletonProps) {
  return (
    <div className={cn(
      'relative flex items-center justify-center bg-muted rounded-lg overflow-hidden',
      className
    )}>
      {/* Background pattern to suggest map */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path 
                d="M 40 0 L 0 0 0 40" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Center indicator */}
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <MapPin className="h-8 w-8 animate-pulse" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}
