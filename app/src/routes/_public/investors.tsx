import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Factory, Leaf } from 'lucide-react'
import { MarketingHeader, Footer } from '@/components/marketing'
import {
  DecisionScaleDiagram,
  SystemArchitectureDiagram,
  TechnologyConvergence,
} from '@/components/marketing/diagrams'

function InvestorsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#233038] text-[#FDF6E3]">
      <MarketingHeader />

      {/* Hero: The Thesis */}
      <section className="min-h-[50vh] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#075056]/30 via-transparent to-[#075056]/30 pointer-events-none" />
        <div className="container mx-auto px-4 py-10 text-center relative z-10">
          <Link
            to="/marketing"
            className="inline-flex items-center gap-1.5 text-xs text-[#D3DBDD] hover:text-[#FDF6E3] mb-4"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to main site
          </Link>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Pasture Farming Works.
            <br />
            <span className="text-[#D3DBDD]">It Just Couldn't Scale.</span>
          </h1>

          <p className="text-xl md:text-2xl font-light text-[#FF5B04] mb-6">
            Until now.
          </p>

          <p className="text-sm text-[#D3DBDD] max-w-xl mx-auto">
            A thesis-driven look at how AI-powered decision support unlocks the economic potential of regenerative grazing.
          </p>
        </div>
      </section>

      {/* Section 2: The Problem */}
      <section className="py-10 bg-[#1a2429]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#FDF6E3]">
              The Problem: Decisions Don't Scale
            </h2>
            <p className="text-sm text-[#D3DBDD] text-center mb-6">
              Adaptive grazing requires constant decision-making. As operations grow, complexity explodes.
            </p>

            <DecisionScaleDiagram />

            <div className="mt-6 text-center">
              <p className="text-sm text-[#FDF6E3]/90">
                The limiting factor isn't land, cattle, or biology.
              </p>
              <p className="text-base text-[#FF5B04] font-semibold mt-1">
                It's human bandwidth for decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Why Now - The AI Breakthrough */}
      <section className="py-10 bg-[#233038]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#FDF6E3]">
              The AI Breakthrough (2022-2024)
            </h2>
            <p className="text-sm text-[#D3DBDD] text-center mb-6">
              Why this wasn't possible before—and why it is now.
            </p>

            <div className="bg-[#1a2429]/50 border border-[#075056]/30 rounded-lg p-5 mb-6">
              <p className="text-sm text-[#FDF6E3]/90 mb-4">
                Before large language models, automating grazing decisions required building
                a custom mathematical model for every farm—capturing every variable, every
                interaction, every edge case. That's prohibitively expensive for each
                operation's unique conditions.
              </p>

              <p className="text-sm text-[#FF5B04] font-semibold mb-4">
                The insight: Modern LLMs already know how to reason.
              </p>

              <p className="text-sm text-[#FDF6E3]/90 mb-4">
                They understand cause and effect, weigh tradeoffs, and explain their thinking.
                They just need context about <em>your</em> land.
              </p>

              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-semibold text-[#D3DBDD] uppercase tracking-wide">Our Architecture</h4>
                <div className="grid gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[#075056] font-bold text-xs">1.</span>
                    <div>
                      <span className="text-sm text-[#FDF6E3] font-medium">Data Pipeline</span>
                      <span className="text-sm text-[#D3DBDD]"> → Gather the facts (satellite, weather, history)</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#075056] font-bold text-xs">2.</span>
                    <div>
                      <span className="text-sm text-[#FDF6E3] font-medium">Encoded Wisdom</span>
                      <span className="text-sm text-[#D3DBDD]"> → Explain grazing principles in the prompt</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#075056] font-bold text-xs">3.</span>
                    <div>
                      <span className="text-sm text-[#FDF6E3] font-medium">Structured Output</span>
                      <span className="text-sm text-[#D3DBDD]"> → Let the model draw a polygon and justify its choice</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#FDF6E3]/80">
                This became possible in 2022. It became <em>practical</em> with 2024's frontier models.
              </p>
            </div>

            <details className="bg-[#1a2429]/30 border border-[#075056]/20 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-[#D3DBDD] hover:text-[#FDF6E3] transition-colors">
                Why Frontier Models Matter
              </summary>
              <div className="px-4 pb-4 pt-1">
                <p className="text-xs text-[#D3DBDD]/80 mb-3">
                  Earlier language models could understand text but struggled with:
                </p>
                <ul className="text-xs text-[#D3DBDD]/80 space-y-1.5 mb-3">
                  <li className="flex items-start gap-2">
                    <span className="text-[#075056]">•</span>
                    <span><strong className="text-[#D3DBDD]">Spatial reasoning</strong> — drawing polygons from coordinate data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#075056]">•</span>
                    <span><strong className="text-[#D3DBDD]">Multi-factor decisions</strong> — weighing NDVI vs. rest days vs. weather</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#075056]">•</span>
                    <span><strong className="text-[#D3DBDD]">Structured output</strong> — returning valid GeoJSON consistently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#075056]">•</span>
                    <span><strong className="text-[#D3DBDD]">Complex instructions</strong> — following 66-line system prompts</span>
                  </li>
                </ul>
                <p className="text-xs text-[#FDF6E3]/90">
                  Models like Claude and GPT-4 handle these reliably. The jump from
                  "sometimes works" to "works consistently" is the difference between a demo and a product.
                </p>
              </div>
            </details>

            <div className="mt-6">
              <TechnologyConvergence />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: The System */}
      <section className="py-10 bg-[#1a2429]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#FDF6E3]">
              The System: Three Layers
            </h2>
            <p className="text-sm text-[#D3DBDD] text-center mb-6">
              A complete stack from raw data to actionable recommendations.
            </p>

            <SystemArchitectureDiagram />
          </div>
        </div>
      </section>

      {/* Section 5: Industrial Scale, Biological Methods */}
      <section className="py-10 bg-[#233038]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#FDF6E3]">
              Industrial Scale, Biological Methods
            </h2>
            <p className="text-sm text-[#D3DBDD] mb-6">
              A new paradigm for livestock production.
            </p>

            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-[#1a2429] border border-[#075056]/30 rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Factory className="h-4 w-4 text-[#D3DBDD]" />
                  <h3 className="text-sm font-semibold text-[#FDF6E3]">Feedlots</h3>
                </div>
                <p className="text-[#D3DBDD] text-xs mb-2">Scale by <em>removing</em> decisions</p>
                <ul className="text-xs text-[#D3DBDD]/70 space-y-1">
                  <li>• Standardized inputs</li>
                  <li>• Controlled environment</li>
                  <li>• External inputs required</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[#1a2429] to-[#075056]/20 border border-[#075056]/50 rounded-lg p-4 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="h-4 w-4 text-[#075056]" />
                  <h3 className="text-sm font-semibold text-[#FDF6E3]">This System</h3>
                </div>
                <p className="text-[#FF5B04] text-xs mb-2">Scale by <em>automating</em> decisions</p>
                <ul className="text-xs text-[#D3DBDD] space-y-1">
                  <li>• Biological complexity preserved</li>
                  <li>• Natural ecosystem services</li>
                  <li>• Regenerative outcomes</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-[#FDF6E3]/90 mt-6 font-medium">
              Industrial-level output without industrial tradeoffs.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: The Ask */}
      <section className="py-10 bg-gradient-to-b from-[#1a2429] to-[#075056]/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#FDF6E3]">
              Partnership Opportunities
            </h2>
            <p className="text-sm text-[#D3DBDD] mb-6">
              We're building this in partnership with aligned stakeholders.
            </p>

            <div className="grid md:grid-cols-3 gap-3 mb-6">
              <div className="bg-[#233038] border border-[#075056]/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[#FF5B04] mb-1">Capital Partners</h3>
                <p className="text-xs text-[#D3DBDD]">
                  Scale deployments and expand to new regions
                </p>
              </div>

              <div className="bg-[#233038] border border-[#075056]/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[#FF5B04] mb-1">Research Collaborators</h3>
                <p className="text-xs text-[#D3DBDD]">
                  Validate productivity gains with rigorous measurement
                </p>
              </div>

              <div className="bg-[#233038] border border-[#075056]/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[#FF5B04] mb-1">Integration Partners</h3>
                <p className="text-xs text-[#D3DBDD]">
                  Satellite providers, weather services, and farm management platforms
                </p>
              </div>
            </div>

            <Link
              to="/marketing"
              className="inline-flex items-center justify-center text-sm px-5 py-2.5 rounded-md bg-[#075056] hover:bg-[#FF5B04] text-[#FDF6E3] font-medium transition-colors"
            >
              Get in Touch
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export const Route = createFileRoute('/_public/investors')({
  component: InvestorsPage,
})
