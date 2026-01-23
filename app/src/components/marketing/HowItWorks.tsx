import { Satellite, Brain, FileText, ArrowRight } from 'lucide-react'

const steps = [
  {
    icon: Satellite,
    title: 'Satellite Data',
    description: 'We analyze Sentinel-2 imagery daily to measure vegetation health (NDVI) across your farm',
  },
  {
    icon: Brain,
    title: 'Intelligence Layer',
    description: 'Our system scores each paddock and generates a recommended grazing plan with confidence scores',
  },
  {
    icon: FileText,
    title: 'Your Morning Brief',
    description: 'Receive a plain-language report each morning with today\'s recommended action and reasoning',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Three simple steps from satellite data to your daily grazing decision
          </p>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  <div className="bg-card border rounded-lg p-6 text-center space-y-4 h-full">
                    <div className="flex justify-center">
                      <div className="rounded-full bg-primary/10 p-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                      <ArrowRight className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
