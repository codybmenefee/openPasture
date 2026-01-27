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

      {/* Section 3: Why Now */}
      <section className="py-10 bg-[#233038]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-[#FDF6E3]">
              Why Now: Technology Convergence
            </h2>
            <p className="text-sm text-[#D3DBDD] text-center mb-6">
              Four technologies have matured simultaneously, creating a unique moment.
            </p>

            <TechnologyConvergence />
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
                  GPS collars, satellites, and institutional data providers
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
