import { AlertCircle, CheckCircle2 } from 'lucide-react'

export function ProblemSolution() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Problem Side */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <h2 className="text-3xl font-bold">Grass Changes Daily. Your Fences Don't.</h2>
            </div>
            
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>Hard to know which paddock is ready to graze</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>Waste time checking land conditions manually</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>Miss optimal grazing windows</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-destructive mt-1">•</span>
                <span>Overgraze or underutilize pasture</span>
              </li>
            </ul>
          </div>

          {/* Solution Side */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Satellite Intelligence, Every Morning</h2>
            </div>
            
            <ul className="space-y-4 text-lg text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Daily land status reports for every paddock</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>AI-powered grazing recommendations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Plain language explanations you can trust</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <span>Works with your existing virtual fencing system</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
