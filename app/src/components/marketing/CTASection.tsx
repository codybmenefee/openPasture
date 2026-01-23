import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Lock, X } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4">Start Your Morning Farm Brief Today</h2>
            <p className="text-xl text-muted-foreground">
              Free to start. No credit card required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
              onClick={() => window.location.href = '/onboarding'}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="flex items-center gap-3 justify-center">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">No credit card required</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <X className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <Lock className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Data stays private</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
