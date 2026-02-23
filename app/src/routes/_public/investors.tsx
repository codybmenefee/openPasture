import { createFileRoute, Link } from '@tanstack/react-router'
import { Factory, Leaf, TrendingUp, Users, Globe, RefreshCw, Lock, Target, Zap, Cpu } from 'lucide-react'
import { MarketingHeader, Footer } from '@/components/marketing'
import {
  DecisionScaleDiagram,
  SystemArchitectureDiagram,
  TechnologyConvergence,
} from '@/components/marketing/diagrams'
import { PageSection } from '@/components/ui/page-section'
import { SectionDivider } from '@/components/ui/section-divider'

function InvestorsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <MarketingHeader />

      {/* Hero: The Thesis */}
      <section className="min-h-[50vh] flex items-center justify-center relative">
        <div className="rsc-grid-bg" />
        <div className="container mx-auto px-4 py-10 text-center relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
          >
            &larr; Back to main site
          </Link>

          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            The Thesis
          </h1>

          <p className="text-xl md:text-2xl font-light text-muted-foreground mb-4">
            regenerative grazing increases stocking density. this system increases operational scale.
          </p>

          <p className="text-xl md:text-2xl font-light text-terracotta mb-6">
            multiplicative, not additive.
          </p>

          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            how small and mid-size farmers begin to compete with operations far larger than their own. and why the timing is now.
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* The Problem */}
      <PageSection bg="white" className="py-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            The Problem: Decisions Don't Scale
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Adaptive grazing requires constant decision-making. As operations grow, complexity explodes.
          </p>

          <DecisionScaleDiagram />

          <div className="mt-6 text-center">
            <p className="text-sm">
              The limiting factor isn't land, livestock, or biology.
            </p>
            <p className="text-base text-terracotta font-semibold mt-1">
              it's time on pasture. the attention required to observe conditions and make daily movement decisions across a whole farm.
            </p>
          </div>
        </div>
      </PageSection>

      <SectionDivider />

      {/* The Value Proposition */}
      <PageSection className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <TrendingUp className="h-5 w-5 text-terracotta" />
            <h2 className="text-2xl md:text-3xl font-bold">
              The Value Proposition
            </h2>
          </div>
          <p className="text-sm text-muted-foreground text-center mb-6">
            two forces. one unlock.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-border p-5 shadow-hard-sm">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="h-4 w-4 text-olive" />
                <h3 className="text-sm font-semibold">Regenerative Grazing</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">increases stocking density</p>
              <p className="text-sm">
                more animals on the same acreage. the land is healthier and more productive.
              </p>
            </div>

            <div className="border-2 border-olive/50 p-5 bg-olive-light shadow-hard-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-terracotta" />
                <h3 className="text-sm font-semibold">This System</h3>
              </div>
              <p className="text-xs text-terracotta mb-3">increases operational scale</p>
              <p className="text-sm">
                more acres managed by the same farmer. daily observation and decision-making handled autonomously.
              </p>
            </div>
          </div>

          <div className="border-2 border-border p-5 shadow-hard-sm text-center">
            <p className="text-sm font-medium mb-1">
              these are multiplicative, not additive.
            </p>
            <p className="text-xs text-muted-foreground">
              the unlock for small and mid-size farmers competing with operations far larger than their own.
            </p>
          </div>
        </div>
      </PageSection>

      <SectionDivider />

      {/* The Product */}
      <PageSection bg="white" className="py-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
            The Product
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            a complete stack from raw data to actionable recommendations.
          </p>

          <div className="border-2 border-border p-5 mb-6 shadow-hard-sm">
            <p className="text-sm mb-4">
              imagine <a href="https://youtu.be/wZagcP4U8-0?si=-oa0dDgLkYShvuAg" target="_blank" rel="noopener noreferrer" className="text-olive underline hover:text-terracotta transition-colors">greg judy</a>, joel salatin, or richard perkins staring at images of your farm all day. every morning they send you a text and a map: "move the animals here today." the suggestion is adjacent to where the animals currently are, timed and measured to benefit both the paddock being vacated and the broader farm system -- accounting for forward projections, weather, rest periods, and herd pressure.
            </p>

            <p className="text-sm text-terracotta font-semibold mb-4">
              that is what this system builds.
            </p>

            <p className="text-sm text-muted-foreground mb-4">
              the recommendation is rendered as a polygon on an orthomosaic representation of the farm. the farmer approves, adjusts, or rejects. that feedback improves future suggestions.
            </p>

            <p className="text-sm text-muted-foreground">
              critically, the system does not just receive farmer input -- it directs the farmer's observational attention. each morning report includes a request for the specific field observation that would most reduce uncertainty in that day's recommendation: a grass height sample, a gut read on time left in the current paddock. the farmer spends less time walking the farm randomly and more time collecting targeted signal. this is how the system scales a farmer's attention rather than replacing it.
            </p>
          </div>

          <SystemArchitectureDiagram />
        </div>
      </PageSection>

      <SectionDivider />

      {/* The Farmer as Benchmark */}
      <PageSection className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <Target className="h-5 w-5 text-olive" />
            <h2 className="text-2xl md:text-3xl font-bold">
              The Farmer as Benchmark
            </h2>
          </div>
          <p className="text-sm text-muted-foreground text-center mb-6">
            not the ceiling.
          </p>

          <div className="border-2 border-border p-5 mb-4 shadow-hard-sm">
            <p className="text-sm mb-4">
              the system earns trust by matching farmer judgment. it earns the right to exceed farmer judgment by showing better outcomes -- tracked over time through pasture health trends, stocking performance, and land recovery rates. the land itself is the feedback mechanism.
            </p>
            <p className="text-sm text-muted-foreground">
              this design prevents the atrophy risk: a farmer who always defers to the system does not lose their intuition as long as the outcomes confirm the decisions were right. outcome tracking is how the system proves it is working -- and how it surfaces when it isn't.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-border p-4 shadow-hard-sm bg-olive-light">
              <div className="text-xs font-semibold text-olive uppercase tracking-wider mb-2">Success</div>
              <p className="text-sm">
                "this matches how i think about my land" -- and they say it without having walked the pasture that morning.
              </p>
            </div>
            <div className="border-2 border-border p-4 shadow-hard-sm bg-olive-light">
              <div className="text-xs font-semibold text-terracotta uppercase tracking-wider mb-2">Wins</div>
              <p className="text-sm">
                "i couldn't run this many acres without it."
              </p>
            </div>
          </div>
        </div>
      </PageSection>

      <SectionDivider />

      {/* Why Now */}
      <PageSection bg="white" className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <Zap className="h-5 w-5 text-terracotta" />
            <h2 className="text-2xl md:text-3xl font-bold">
              Why Now
            </h2>
          </div>
          <p className="text-sm text-muted-foreground text-center mb-6">
            three vectors converging simultaneously.
          </p>

          <div className="border-2 border-border p-5 mb-6 shadow-hard-sm">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-olive font-bold text-xs mt-1">01</span>
                <div>
                  <span className="text-sm font-medium">Satellite Resolution</span>
                  <p className="text-xs text-muted-foreground mt-1">SpaceX and Blue Origin dramatically reduced the cost of reaching orbit. cheaper launch economics enabled commercial operators like Planet Labs to deploy large constellations, increasing revisit frequency and resolution while driving down cost. daily 3m imagery at commercial prices is a direct downstream effect of the reusable rocket era.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-terracotta font-bold text-xs mt-1">02</span>
                <div>
                  <span className="text-sm font-medium">LLM and Agent Maturity</span>
                  <p className="text-xs text-muted-foreground mt-1">the ability to reason over complex, multi-variable decisions using codified domain knowledge -- and to do so as an autonomous agent operating on a daily loop -- has only recently become viable and affordable.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cobalt font-bold text-xs mt-1">03</span>
                <div>
                  <span className="text-sm font-medium">Drone Accessibility</span>
                  <p className="text-xs text-muted-foreground mt-1">falling hardware costs and loosening regulations make drone imagery a credible near-term input for ground-truth validation of satellite estimates.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <TechnologyConvergence />
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/technology"
              className="text-sm text-olive hover:text-terracotta transition-colors"
            >
              Deep dive: how we predict what a trained farmer would do &rarr;
            </Link>
          </div>
        </div>
      </PageSection>

      <SectionDivider />

      {/* The Collar Dependency */}
      <PageSection className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <Cpu className="h-5 w-5 text-cobalt" />
            <h2 className="text-2xl md:text-3xl font-bold">
              The Collar Dependency
            </h2>
          </div>
          <p className="text-sm text-muted-foreground text-center mb-6">
            decision support today. autonomous operation tomorrow.
          </p>

          <div className="border-2 border-border p-5 shadow-hard-sm">
            <p className="text-sm mb-4">
              collar integration is the unlock that converts this system from decision support into autonomous operation. without it, the system reduces cognitive burden but not labor burden. with it, the farmer's role shifts from daily physical execution to daily review and approval.
            </p>

            <p className="text-sm text-muted-foreground mb-4">
              the collar market is currently locked behind proprietary software with no open apis.
            </p>

            <div className="bg-olive-light p-4 border-2 border-border mb-4">
              <div className="text-xs font-semibold text-olive uppercase tracking-wider mb-2">Strategy</div>
              <p className="text-sm text-muted-foreground">
                build the decision-making layer aggressively and let its value create pressure on collar companies to integrate. if they don't open their apis, compete at the hardware layer with a cheap, cots-based, open-source collar design that commoditizes the market and breaks the lock.
              </p>
            </div>

            <p className="text-sm font-semibold text-terracotta">
              the brain is the defensible asset. the collar is not.
            </p>
          </div>
        </div>
      </PageSection>

      <SectionDivider />

      {/* Industrial Scale */}
      <PageSection bg="white" className="py-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Industrial Scale, Biological Methods
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            A new paradigm for livestock production.
          </p>

          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="border-2 border-border p-4 text-left shadow-hard-sm">
              <div className="flex items-center gap-2 mb-2">
                <Factory className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Feedlots</h3>
              </div>
              <p className="text-muted-foreground text-xs mb-2">Scale by <em>removing</em> decisions</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>-- Standardized inputs</li>
                <li>-- Controlled environment</li>
                <li>-- External inputs required</li>
              </ul>
            </div>

            <div className="border-2 border-olive/50 p-4 text-left bg-olive-light shadow-hard-sm">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="h-4 w-4 text-olive" />
                <h3 className="text-sm font-semibold">This System</h3>
              </div>
              <p className="text-terracotta text-xs mb-2">Scale by <em>automating</em> decisions</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>-- Biological complexity preserved</li>
                <li>-- Natural ecosystem services</li>
                <li>-- Regenerative outcomes</li>
              </ul>
            </div>
          </div>

          <p className="text-sm mt-6 font-medium">
            Industrial-level output without industrial tradeoffs.
          </p>
        </div>
      </PageSection>

      <SectionDivider />

      {/* Market Opportunity */}
      <PageSection className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <TrendingUp className="h-5 w-5 text-terracotta" />
            <h2 className="text-2xl md:text-3xl font-bold">
              The Market Opportunity
            </h2>
          </div>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Regenerative grazing is growing. The tools to scale it are not.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              { value: '654M', label: 'Acres of US grazing land' },
              { value: '~880K', label: 'Grazing livestock operations in the US' },
              { value: '$9.4B', label: 'Global precision livestock market by 2027' },
            ].map((stat, idx) => (
              <div key={idx} className="border-2 border-border p-4 text-center shadow-hard-sm">
                <div className="text-2xl font-bold text-terracotta mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="border-2 border-border p-5 shadow-hard-sm">
            <p className="text-sm text-muted-foreground mb-3">
              The shift toward regenerative practices is accelerating -- driven by consumer demand,
              carbon credit markets, and recognition that industrial methods have hidden costs.
              But adoption is bottlenecked by the complexity of managing adaptive systems.
            </p>
            <p className="text-sm text-terracotta font-medium mb-3">
              We remove that bottleneck.
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              higher stocking density combined with greater operational scale means the same acreage supports more animals, managed by fewer people. the addressable market expands as adoption compounds.
            </p>
            <div className="pt-3 border-t-2 border-border">
              <p className="text-xs text-muted-foreground">
                <span className="text-olive font-semibold">Currently in beta</span> with early adopter farmers -- building the training data flywheel now.
              </p>
            </div>
          </div>
        </div>
      </PageSection>

      <SectionDivider />

      {/* Platform Vision */}
      <PageSection bg="white" className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <Globe className="h-5 w-5 text-olive" />
            <h2 className="text-2xl md:text-3xl font-bold">
              The Platform Vision
            </h2>
          </div>
          <p className="text-sm text-muted-foreground text-center mb-6">
            not just software. a recommendation engine that becomes an operating system.
          </p>

          <div className="border-2 border-border p-5 mb-4 shadow-hard-sm">
            <p className="text-sm font-medium mb-4">
              not just software. a recommendation engine that becomes an operating system for regenerative grazing at scale.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs font-semibold text-olive uppercase tracking-wider mb-2">Software</div>
                <p className="text-xs text-muted-foreground">
                  Decision intelligence, analytics, and automation platform
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold text-olive uppercase tracking-wider mb-2">Sensors</div>
                <p className="text-xs text-muted-foreground">
                  satellite imagery today. collar integration as the unlock. open-source hardware if proprietary apis remain closed.
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold text-olive uppercase tracking-wider mb-2">Open Specs</div>
                <p className="text-xs text-muted-foreground">
                  Hardware specifications you can build, repair, and modify yourself
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Open source software. Open hardware specs. Farmer-owned data.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              The opposite of vendor lock-in. The foundation for an ecosystem.
            </p>
          </div>
        </div>
      </PageSection>

      <SectionDivider />

      {/* The Moat */}
      <PageSection className="py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <Lock className="h-5 w-5 text-cobalt" />
            <h2 className="text-2xl md:text-3xl font-bold">
              The Moat
            </h2>
          </div>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Why this compounds over time.
          </p>

          <div className="space-y-4">
            <div className="border-2 border-border p-5 shadow-hard-sm">
              <div className="flex items-start gap-3">
                <RefreshCw className="h-5 w-5 text-cobalt mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold mb-2">The Data Flywheel</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Every farmer interaction creates training data that doesn't exist anywhere else.
                    No academic dataset captures daily grazing decisions at scale. No competitor
                    has thousands of farmer corrections paired with satellite observations.
                  </p>
                  <p className="text-xs text-terracotta font-medium">
                    one approval, one correction, one field note at a time.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-border p-5 shadow-hard-sm">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-olive mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold mb-2">Community Trust Through Openness</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    Farmers have been burned by proprietary systems and data lock-in.
                    Our open source approach builds trust that translates to adoption and retention.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The more farmers on the platform, the better the recommendations for everyone.
                    Network effects through shared learning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <SectionDivider />

      {/* Get Involved */}
      <PageSection bg="white" className="py-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Learn More
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Explore the technology, see it in action, or reach out directly.
          </p>

          <div className="grid md:grid-cols-3 gap-3 mb-6">
            <Link
              to="/technology"
              className="border-2 border-border p-4 shadow-hard-sm hover:border-olive hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all block"
            >
              <h3 className="text-sm font-semibold mb-1">Technology Deep Dive</h3>
              <p className="text-xs text-muted-foreground">
                How the system works
              </p>
            </Link>

            <Link
              to="/research"
              className="border-2 border-border p-4 shadow-hard-sm hover:border-olive hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all block"
            >
              <h3 className="text-sm font-semibold mb-1">Research Partnerships</h3>
              <p className="text-xs text-muted-foreground">
                Validate outcomes with us
              </p>
            </Link>

            <Link
              to="/sign-in"
              className="border-2 border-border p-4 shadow-hard-sm hover:border-olive hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all block"
            >
              <h3 className="text-sm font-semibold mb-1">Try the Beta</h3>
              <p className="text-xs text-muted-foreground">
                See it working today
              </p>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            For partnership inquiries:{' '}
            <a href="mailto:hello@openpasture.io" className="text-olive hover:text-terracotta transition-colors">
              hello@openpasture.io
            </a>
          </p>
        </div>
      </PageSection>

      <Footer />
    </div>
  )
}

export const Route = createFileRoute('/_public/investors')({
  component: InvestorsPage,
})
