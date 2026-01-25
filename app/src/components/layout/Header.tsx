import { Search, HelpCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FarmSelector } from './FarmSelector'
import { useAppAuth } from '@/lib/auth'
import { Link } from '@tanstack/react-router'

export function Header() {
  const { isDevAuth } = useAppAuth()

  return (
    <header className="flex h-10 items-center justify-between border-b border-border bg-background px-4">
      {/* Search placeholder */}
      <button className="flex h-7 w-56 items-center gap-2 rounded-md border border-input bg-background px-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
        <Search className="h-3.5 w-3.5" />
        <span>Search or jump to...</span>
        <kbd className="ml-auto pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-muted px-1 font-mono text-[9px] font-medium text-muted-foreground">
          <span className="text-[9px]">Cmd</span>K
        </kbd>
      </button>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <FarmSelector />

        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded">
          demo
        </span>

        {isDevAuth && (
          <Link to="/onboarding">
            <Button variant="ghost" size="sm" className="h-7 gap-1.5" title="Reset onboarding journey">
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="text-xs">onboarding</span>
            </Button>
          </Link>
        )}

        <Button variant="ghost" size="icon" className="h-7 w-7">
          <HelpCircle className="h-3.5 w-3.5" />
        </Button>

        {/* Avatar placeholder */}
        <button className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
          C
        </button>
      </div>
    </header>
  )
}
