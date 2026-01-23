import { Map, TrendingUp, Calendar, Eye, Plug, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Map,
    title: 'Digital Twin of Your Farm',
    description: 'Define boundaries and paddocks. Visualize all zones on an interactive map.',
  },
  {
    icon: TrendingUp,
    title: 'Satellite-Derived Intelligence',
    description: 'NDVI, EVI, and NDWI metrics show vegetation health, recovery trends, and water stress.',
  },
  {
    icon: Calendar,
    title: 'Daily Grazing Plan',
    description: 'Get a recommended paddock with confidence score, assumptions, and plain-language reasoning.',
  },
  {
    icon: Eye,
    title: 'No Black Box',
    description: 'See exactly why we recommend each action. Confidence scores and assumptions are always visible.',
  },
  {
    icon: Plug,
    title: 'Works With Your Tools',
    description: 'Export fence geometry and instructions for virtual fencing systems or manual workflows.',
  },
  {
    icon: MessageSquare,
    title: 'You Stay In Control',
    description: 'Approve, adjust, or provide feedback. The system learns from your decisions.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Everything You Need</h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Decision support tools built for adaptive grazing
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
