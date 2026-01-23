import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/marketing" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Morning Farm Brief</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <a 
              href="#how-it-works" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
            >
              How It Works
            </a>
            <a 
              href="#features" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
            >
              Features
            </a>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/onboarding'}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Get Started
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
