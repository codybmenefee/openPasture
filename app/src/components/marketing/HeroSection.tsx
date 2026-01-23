import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'

export function HeroSection() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Know Your Land.
            <br />
            <span className="text-primary">Every Morning.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Daily grazing decisions powered by satellite intelligence. Get your Morning Farm Brief.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
              onClick={() => window.location.href = '/onboarding'}
            >
              Start Your Free Brief
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-6 h-auto"
              onClick={scrollToHowItWorks}
            >
              <Play className="mr-2 h-5 w-5" />
              See How It Works
            </Button>
          </div>

          <div className="pt-8 text-sm text-muted-foreground">
            <p>No credit card required • Free to start • Cancel anytime</p>
          </div>
        </div>
      </div>
    </section>
  )
}
