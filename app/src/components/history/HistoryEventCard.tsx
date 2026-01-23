import { Check, Edit, Clock, ArrowRight, Grid3X3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { HistoryEntry } from '@/lib/types'

interface HistoryEventCardProps {
  entry: HistoryEntry
  isLast?: boolean
  onClick?: (entry: HistoryEntry) => void
}

const statusConfig = {
  approved: {
    icon: Check,
    color: 'bg-green-500',
    badge: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
    label: 'Approved',
  },
  modified: {
    icon: Edit,
    color: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    label: 'Modified',
  },
  pending: {
    icon: Clock,
    color: 'bg-blue-500',
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    label: 'Pending',
  },
  rejected: {
    icon: Clock,
    color: 'bg-red-500',
    badge: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
    label: 'Rejected',
  },
  executed: {
    icon: Check,
    color: 'bg-purple-500',
    badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    label: 'Executed',
  },
}

export function HistoryEventCard({ entry, isLast, onClick }: HistoryEventCardProps) {
  const config = statusConfig[entry.planStatus]
  const StatusIcon = config.icon
  
  // Determine if this is a paddock transition or section rotation
  const isTransition = entry.eventType === 'paddock_transition'
  const EventIcon = isTransition ? ArrowRight : Grid3X3

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div 
      className={cn(
        "relative flex gap-4 pb-8",
        onClick && "cursor-pointer group"
      )}
      onClick={() => onClick?.(entry)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick(entry)
        }
      }}
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 bg-border" />
      )}
      
      {/* Timeline dot - different styling for transitions vs sections */}
      <div className={cn(
        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
        isTransition ? 'bg-primary' : config.color
      )}>
        {isTransition ? (
          <ArrowRight className="h-4 w-4 text-white" />
        ) : (
          <StatusIcon className="h-4 w-4 text-white" />
        )}
      </div>
      
      {/* Content */}
      <div className={cn(
        "flex-1 min-w-0 rounded-md p-2 -m-2 transition-colors",
        onClick && "group-hover:bg-muted/50"
      )}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{formatDate(entry.date)}</p>
              {/* Event type badge */}
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  isTransition 
                    ? 'bg-primary/10 text-primary border-primary/20' 
                    : 'bg-muted text-muted-foreground border-muted-foreground/20'
                )}
              >
                <EventIcon className="h-3 w-3 mr-1" />
                {isTransition ? 'Transition' : 'Section'}
              </Badge>
            </div>
            {/* Title - different for transitions vs sections */}
            {isTransition ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-muted-foreground">{entry.fromPaddockName}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-base font-semibold">{entry.paddockName}</span>
              </div>
            ) : (
              <div className="mt-0.5">
                <span className="text-base font-semibold">{entry.paddockName}</span>
                {entry.dayInPaddock && entry.totalDaysInPaddock && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    (Day {entry.dayInPaddock} of {entry.totalDaysInPaddock})
                  </span>
                )}
              </div>
            )}
          </div>
          <Badge variant="outline" className={cn('flex-shrink-0', config.badge)}>
            {config.label}
          </Badge>
        </div>
        
        <div className="mt-2 text-sm text-muted-foreground">
          <p>{entry.reasoning}</p>
          <div className="flex gap-4 mt-1">
            <span>Confidence: {entry.confidence}%</span>
            {entry.sectionArea && (
              <span>Section: {entry.sectionArea.toFixed(1)} ha</span>
            )}
          </div>
        </div>
        
        {entry.wasModified && entry.userFeedback && (
          <div className="mt-2 rounded-md bg-muted p-2 text-sm">
            <span className="font-medium">User feedback:</span> {entry.userFeedback}
          </div>
        )}
      </div>
    </div>
  )
}
