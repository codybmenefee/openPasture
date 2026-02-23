import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Check } from 'lucide-react'
import { MarketingHeader, Footer } from '@/components/marketing'
import { WindowChrome } from '@/components/ui/window-chrome'
import { PageSection } from '@/components/ui/page-section'
import { SectionDivider } from '@/components/ui/section-divider'

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <MarketingHeader />

      {/* Hero */}
      <section className="px-6 py-16 relative">
        <div className="rsc-grid-bg" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-8 rsc-fade rsc-d1">
            <span className="rsc-badge">satellite-imagery</span>
            <span className="font-bold text-olive">&rarr;</span>
            <span className="rsc-badge">farmer-judgment</span>
          </div>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-8xl font-bold leading-[0.92] mb-8 rsc-fade rsc-d2" style={{ textWrap: 'balance' }}>
            what a trained farmer would do.<br />
            <span className="text-olive italic">every morning. every paddock.</span>
          </h1>

          <p className="text-lg md:text-xl max-w-3xl leading-relaxed mb-10 text-muted-foreground rsc-fade rsc-d3">
            satellite imagery and grazing science, combined into a daily movement recommendation. the system predicts what an experienced farmer would decide -- then asks you to confirm, adjust, or override.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 rsc-fade rsc-d3">
            <Link to="/demo" className="rsc-cta flex items-center gap-2 group">
              ./demo --interactive
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
            <Link to="/docs" className="rsc-cta-outline">
              cat README.md
            </Link>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Hero Screenshot */}
      <PageSection bg="white">
        <WindowChrome title="openpasture -- morning-brief">
          <img src="/marketing/hero-app.png" alt="OpenPasture app showing daily grazing plan with NDVI satellite map" className="w-full" />
        </WindowChrome>
      </PageSection>

      <SectionDivider />

      {/* Beta Banner */}
      <section className="px-6 py-14 bg-white border-b-2 border-border">
        <div className="max-w-4xl mx-auto text-center">
          <span className="rsc-badge-solid mb-4 inline-block">early-access-beta</span>
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ textWrap: 'balance' }}>
            join farmers testing ai-augmented grazing
          </h2>
          <p className="text-sm text-muted-foreground">
            the system learns how you think about your land. reduced pricing during beta.
          </p>
        </div>
      </section>

      {/* Product Showcase 1: Morning Brief */}
      <PageSection maxWidth="7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="rsc-badge mb-6 inline-block">available-now</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              <span className="rsc-prompt">morning_report</span><br />
              <span className="text-olive">--daily</span>
            </h2>
            <p className="text-sm mb-8 leading-relaxed text-muted-foreground">
              imagine <a href="https://youtu.be/wZagcP4U8-0?si=-oa0dDgLkYShvuAg" target="_blank" rel="noopener noreferrer" className="text-olive underline hover:text-terracotta transition-colors">greg judy</a> staring at satellite images of your farm all day. every morning, a text and a map: &apos;move the animals here today.&apos; the reasoning is transparent. adjust or approve with one tap.
            </p>
            <ul className="space-y-3">
              {[
                'daily movement recommendation with full reasoning',
                'targeted observation request to close data gaps',
                'approve, adjust, or override. your call.',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs">
                  <span className="font-bold mt-0.5 text-olive">[x]</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <WindowChrome title="brief --daily">
            <img src="/marketing/morning-brief.png" alt="AI-powered grazing recommendation with movement plan and reasoning" className="w-full" />
          </WindowChrome>
        </div>
      </PageSection>

      <SectionDivider />

      {/* Product Showcase 2: NDVI Map */}
      <PageSection bg="white" maxWidth="7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <WindowChrome title="map --ndvi --pastures">
            <img src="/marketing/ndvi-map.png" alt="NDVI satellite heatmap showing pasture health across paddocks" className="w-full" />
          </WindowChrome>

          <div>
            <span className="rsc-badge mb-6 inline-block">available-now</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              see what&apos;s invisible<br /><span className="text-terracotta">from the ground</span>
            </h2>
            <p className="text-sm mb-8 leading-relaxed text-muted-foreground">
              daily satellite imagery shows vegetation health across your whole farm. track recovery paddock by paddock. spot what you&apos;d miss on foot.
            </p>
            <ul className="space-y-3">
              {[
                'ndvi vegetation health by paddock',
                'rest period and recovery tracking',
                'known gap: grass height needs field notes (for now)',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs">
                  <span className="font-bold mt-0.5 text-terracotta">[x]</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageSection>

      <SectionDivider />

      {/* Product Showcase 3: Analytics */}
      <PageSection maxWidth="7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="rsc-badge mb-6 inline-block">available-now</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              track recovery<br /><span className="text-cobalt">earn trust.</span>
            </h2>
            <p className="text-sm mb-8 leading-relaxed text-muted-foreground">
              the system earns trust by matching your judgment. it earns the right to exceed it by showing better outcomes. land health is the feedback mechanism.
            </p>
            <ul className="space-y-3">
              {[
                'pasture health trends over time',
                'recommendation accuracy vs. your decisions',
                'the land tells you if the system is working',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs">
                  <span className="font-bold mt-0.5 text-cobalt">[x]</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <WindowChrome title="analytics --recovery --trends">
            <img src="/marketing/analytics-dashboard.png" alt="Analytics dashboard with pasture recovery, rest periods, NDVI trends, and recommendation accuracy" className="w-full" />
          </WindowChrome>
        </div>
      </PageSection>

      <SectionDivider />

      {/* How It Works */}
      <PageSection bg="white" maxWidth="6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">how_it_works()</h2>
          <p className="text-sm text-muted-foreground">three steps. satellite to suggestion.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { num: '01', title: 'observe', desc: 'satellite imagery captures vegetation health across your farm daily. resolution: 3m. coverage: every paddock.', color: 'text-olive' },
            { num: '02', title: 'reason', desc: 'the system applies grazing science to your specific conditions. weather, rest periods, recovery rates, herd pressure. then it draws a plan.', color: 'text-terracotta' },
            { num: '03', title: 'decide', desc: 'you wake up to a recommendation and a map. approve, adjust, or override. your correction makes the next suggestion better.', color: 'text-cobalt' },
          ].map((step, idx) => (
            <div key={idx} className="rsc-card">
              <div className={`text-4xl font-bold mb-4 ${step.color}`}>{step.num}</div>
              <h3 className="text-base font-bold mb-3">{step.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </PageSection>

      {/* Open Source */}
      <PageSection maxWidth="4xl">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">license: apache-2.0</h2>
          <p className="text-sm mb-12 text-muted-foreground">
            open source. open data. open development.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { label: 'open_source', desc: 'full source. self-host or use managed.' },
            { label: 'open_data', desc: 'your data stays yours. export anytime.' },
            { label: 'open_development', desc: 'public roadmap. community-driven.' },
          ].map((item, idx) => (
            <div key={idx} className="rsc-card flex gap-4 items-center text-left">
              <Check className="w-5 h-5 flex-shrink-0 text-terracotta" strokeWidth={2.5} />
              <div>
                <span className="text-sm font-bold">{item.label}</span>
                <span className="text-xs ml-3 text-muted-foreground">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      {/* CTA */}
      <section className="px-6 py-16 bg-dark">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-white" style={{ textWrap: 'balance' }}>
            ready to scale<br />
            <span className="text-terracotta">your judgment?</span>
          </h2>
          <p className="text-sm mb-12 max-w-2xl mx-auto text-terracotta-muted">
            join the beta. the system learns how you think about your land.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/sign-in"
              className="px-10 py-4 bg-white font-bold border-2 border-white transition-all shadow-[4px_4px_0_rgba(168,58,50,0.5)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_rgba(168,58,50,0.5)] flex items-center justify-center gap-2 text-xs uppercase tracking-wider group text-dark"
            >
              ./signup --beta
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
            <Link
              to="/demo"
              className="px-10 py-4 bg-transparent text-white font-bold border-2 border-white/40 transition-all shadow-[4px_4px_0_rgba(168,58,50,0.25)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_rgba(168,58,50,0.25)] text-xs uppercase tracking-wider hover:border-white/70"
            >
              ./schedule --demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: LandingPage,
})
