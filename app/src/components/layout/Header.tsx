import { HelpCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FarmSelector } from './FarmSelector'
import { useAppAuth } from '@/lib/auth'
import { Link } from '@tanstack/react-router'

export function Header() {
  const { isDevAuth } = useAppAuth()

  return (
    <header className="flex h-8 items-center justify-between border-b border-border bg-background px-2">
      <FarmSelector />
      <div className="flex items-center gap-1.5">
        {isDevAuth && (
          <Link to="/onboarding">
            <Button variant="ghost" size="sm" className="h-5 gap-1 px-1" title="Reset onboarding journey">
              <RotateCcw className="h-3 w-3" />
              <span className="text-[10px]">onboarding</span>
            </Button>
          </Link>
        )}

        <Button variant="ghost" size="icon" className="h-5 w-5">
          <HelpCircle className="h-3 w-3" />
        </Button>

        {/* Avatar placeholder */}
        <button className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
          C
        </button>
      </div>
    </header>
  )
}
