import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  icon?: ReactNode
  title: string
  message: string
  details?: string[]
  actions?: ReactNode
  className?: string
}

export function ErrorState({
  icon,
  title,
  message,
  details,
  actions,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8',
      className
    )}>
      <div className="mb-4 text-muted-foreground">
        {icon || <AlertCircle className="h-12 w-12" />}
      </div>
      
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      
      <p className="text-muted-foreground max-w-md mb-4">{message}</p>
      
      {details && details.length > 0 && (
        <ul className="text-sm text-muted-foreground mb-6 space-y-1">
          {details.map((detail, i) => (
            <li key={i}>{detail}</li>
          ))}
        </ul>
      )}
      
      {actions && (
        <div className="flex gap-3">{actions}</div>
      )}
    </div>
  )
}
