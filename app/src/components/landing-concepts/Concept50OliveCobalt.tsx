import { ArrowRight, Check, Terminal, Layers } from 'lucide-react'

export function Concept50OliveCobalt() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Libre+Baskerville:wght@400;700&display=swap');

        .rsc-page {
          --red: #4a6a2e;
          --red-bright: #5a7a38;
          --red-muted: #c0d0a8;
          --red-light: #f2f6ee;
          --green: #a83a32;
          --green-muted: #c06a62;
          --accent2: #0047AB;
          --accent2-muted: #4a7abf;
          --dark: #1a1e18;
          --charcoal: #2a3028;
          --cream: #f6f8f4;
          --panel: #ffffff;
          --border: #c4d0c0;
          --text: #1a1e18;
          --text-muted: #647060;
          font-family: 'JetBrains Mono', monospace;
          background: var(--cream);
          min-height: 100vh;
          color: var(--text);
          overflow-x: hidden;
        }

        .rsc-serif { font-family: 'Libre Baskerville', Georgia, serif; }

        .rsc-grid-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image:
            linear-gradient(var(--dark) 1px, transparent 1px),
            linear-gradient(90deg, var(--dark) 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.02;
          pointer-events: none;
        }

        .rsc-card {
          background: var(--panel);
          border: 2px solid var(--border);
          padding: 32px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .rsc-card:hover {
          border-color: var(--red);
          box-shadow: 4px 4px 0 var(--red-muted);
          transform: translate(-2px, -2px);
        }

        .rsc-badge {
          display: inline-block;
          padding: 4px 12px;
          border: 2px solid var(--red);
          color: var(--red);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .rsc-badge-solid {
          display: inline-block;
          padding: 4px 12px;
          background: var(--red);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .rsc-divider {
          height: 4px;
          background: var(--red);
        }

        .rsc-window {
          background: var(--red-light);
          border: 3px solid var(--dark);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .rsc-window:hover {
          transform: translate(-3px, -3px);
          box-shadow: 6px 6px 0 var(--red);
        }

        .rsc-window-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-bottom: 2px solid var(--dark);
          background: var(--dark);
        }

        .rsc-window-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .rsc-window-body {
          aspect-ratio: 16/10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px;
        }

        .rsc-cta {
          padding: 14px 36px;
          background: var(--red);
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
          border: 2px solid var(--red);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          box-shadow: 3px 3px 0 var(--dark);
        }

        .rsc-cta:hover {
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0 var(--dark);
        }

        .rsc-cta:focus-visible {
          outline: 2px solid var(--red);
          outline-offset: 2px;
        }

        .rsc-cta-outline {
          padding: 14px 36px;
          background: var(--panel);
          color: var(--dark);
          font-weight: 700;
          font-size: 0.85rem;
          border: 2px solid var(--border);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          box-shadow: 3px 3px 0 var(--border);
        }

        .rsc-cta-outline:hover {
          border-color: var(--red);
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0 var(--red-muted);
        }

        .rsc-cta-outline:focus-visible {
          outline: 2px solid var(--red);
          outline-offset: 2px;
        }

        .rsc-prompt::before {
          content: '$ ';
          color: var(--red);
          font-weight: 700;
        }

        @keyframes rscBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .rsc-cursor::after {
          content: '_';
          animation: rscBlink 1s step-end infinite;
          color: var(--red);
        }

        .rsc-bar {
          width: 5px;
          background: var(--red);
          transition: transform 0.3s ease, opacity 0.3s ease;
          border-top: 1px solid var(--red-bright);
        }

        .rsc-bar:hover {
          transform: scaleY(1.1);
          opacity: 0.8;
        }

        .rsc-bar-muted {
          width: 3px;
          background: var(--red-muted);
        }

        @keyframes rscFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .rsc-fade { animation: rscFadeUp 0.5s ease forwards; }
        .rsc-d1 { animation-delay: 0.1s; opacity: 0; }
        .rsc-d2 { animation-delay: 0.2s; opacity: 0; }
        .rsc-d3 { animation-delay: 0.3s; opacity: 0; }

        @media (prefers-reduced-motion: reduce) {
          .rsc-fade { animation: none; opacity: 1; }
          .rsc-cursor::after { animation: none; opacity: 1; }
        }
      `}</style>

      <div className="rsc-page">
        {/* Header */}
        <header className="border-b-2 border-[var(--border)] sticky top-0 z-50 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-[var(--dark)] flex items-center justify-center" style={{ background: 'var(--red)' }}>
                <Terminal className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold">openpasture</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>v0.9.2</span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
              <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>product</a>
              <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>docs</a>
              <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-muted)' }}>source</a>
              <button className="rsc-cta" style={{ padding: '6px 16px', fontSize: '0.7rem' }}>
                get-started
              </button>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section className="px-6 py-28 relative">
          <div className="rsc-grid-bg" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-8 rsc-fade rsc-d1">
              <span className="rsc-badge">satellite-input</span>
              <span className="font-bold" style={{ color: 'var(--red)' }}>&rarr;</span>
              <span className="rsc-badge">probability-output</span>
            </div>

            <h1 className="rsc-serif text-5xl md:text-6xl lg:text-8xl font-bold leading-[0.92] mb-8 rsc-fade rsc-d2" style={{ textWrap: 'balance' }}>
              Two Layers.<br />
              <span style={{ color: 'var(--red)' }} className="italic">One Intelligence.</span>
            </h1>

            <p className="text-lg md:text-xl max-w-3xl leading-relaxed mb-10 rsc-fade rsc-d3" style={{ color: 'var(--text-muted)' }}>
              Satellite imagery meets probability theory. Your morning brief delivers
              gradient confidence, not binary answers. All data, all reasoning, all open source.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 rsc-fade rsc-d3">
              <button className="rsc-cta flex items-center gap-2 group">
                ./demo --interactive
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
              <button className="rsc-cta-outline">
                cat README.md
              </button>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="rsc-divider" />

        {/* Hero Screenshot */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="rsc-window">
              <div className="rsc-window-bar">
                <div className="rsc-window-dot" style={{ background: '#d45a5a' }} />
                <div className="rsc-window-dot" style={{ background: '#d4a84a' }} />
                <div className="rsc-window-dot" style={{ background: '#5aaa5a' }} />
                <span className="text-xs text-white/60 ml-2">openpasture -- morning-brief</span>
              </div>
              <div className="rsc-window-body">
                <Layers className="w-16 h-16" style={{ color: 'var(--red-muted)' }} strokeWidth={1} />
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>[Morning Brief Dashboard]</span>
                <span className="text-xs" style={{ color: 'var(--border)' }}>1440 x 900</span>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="rsc-divider" />

        {/* Beta Banner */}
        <section className="px-6 py-14 bg-white border-b-2 border-[var(--border)]">
          <div className="max-w-4xl mx-auto text-center">
            <span className="rsc-badge-solid mb-4 inline-block">early-access-beta</span>
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ textWrap: 'balance' }}>
              join ranchers testing probability-powered grazing
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              be among the first to experience gradient intelligence. free during beta.
            </p>
          </div>
        </section>

        {/* Product Showcase 1 */}
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="rsc-badge mb-6 inline-block">available-now</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  <span className="rsc-prompt">morning_brief</span><br />
                  <span style={{ color: 'var(--red)' }}>--probability-scored</span>
                </h2>
                <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  AI analyzes satellite data overnight and delivers a recommended grazing plan
                  with probability distributions and reasoning you can interrogate.
                </p>
                <ul className="space-y-3">
                  {[
                    'confidence scores replace yes/no',
                    'probability reasoning for each suggestion',
                    'override --force when conditions change',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs">
                      <span className="font-bold mt-0.5" style={{ color: 'var(--red)' }}>[x]</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rsc-window">
                <div className="rsc-window-bar">
                  <div className="rsc-window-dot" style={{ background: '#d45a5a' }} />
                  <div className="rsc-window-dot" style={{ background: '#d4a84a' }} />
                  <div className="rsc-window-dot" style={{ background: '#5aaa5a' }} />
                  <span className="text-xs text-white/60 ml-2">brief --daily</span>
                </div>
                <div className="rsc-window-body">
                  <Terminal className="w-12 h-12" style={{ color: 'var(--red-muted)' }} strokeWidth={1} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>[Morning Brief View]</span>
                  <span className="text-xs" style={{ color: 'var(--border)' }}>probability distribution + recommendations</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="rsc-divider" />

        {/* Product Showcase 2 */}
        <section className="px-6 py-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="rsc-window lg:order-1">
                <div className="rsc-window-bar">
                  <div className="rsc-window-dot" style={{ background: '#d45a5a' }} />
                  <div className="rsc-window-dot" style={{ background: '#d4a84a' }} />
                  <div className="rsc-window-dot" style={{ background: '#5aaa5a' }} />
                  <span className="text-xs text-white/60 ml-2">map --ndvi --pastures</span>
                </div>
                <div className="rsc-window-body">
                  <Layers className="w-12 h-12" style={{ color: 'var(--red-muted)' }} strokeWidth={1} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>[NDVI Heatmap View]</span>
                  <span className="text-xs" style={{ color: 'var(--border)' }}>pasture health + recovery zones</span>
                </div>
              </div>

              <div className="lg:order-2">
                <span className="rsc-badge mb-6 inline-block">available-now</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  see what&apos;s invisible<br /><span style={{ color: 'var(--green)' }}>from the ground</span>
                </h2>
                <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  NDVI heatmaps reveal vegetation health as probability distributions.
                  Historical patterns show recovery trends as continuous fields.
                </p>
                <ul className="space-y-3">
                  {[
                    'probability-colored vegetation health',
                    'recovery distributions over time',
                    'uncertainty zones flagged early',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs">
                      <span className="font-bold mt-0.5" style={{ color: 'var(--green)' }}>[x]</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="rsc-divider" />

        {/* Product Showcase 3 */}
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="rsc-badge mb-6 inline-block">available-now</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  track recovery<br /><span style={{ color: 'var(--accent2)' }}>quantify certainty</span>
                </h2>
                <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Monitor rest periods as probability distributions. Recovery rates as data fields.
                  Know not just if ready, but how confident.
                </p>
                <ul className="space-y-3">
                  {[
                    'real-time pasture probability tracking',
                    'historical confidence trend analysis',
                    'uncertainty-aware rotation planning',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs">
                      <span className="font-bold mt-0.5" style={{ color: 'var(--accent2)' }}>[x]</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rsc-window">
                <div className="rsc-window-bar">
                  <div className="rsc-window-dot" style={{ background: '#d45a5a' }} />
                  <div className="rsc-window-dot" style={{ background: '#d4a84a' }} />
                  <div className="rsc-window-dot" style={{ background: '#5aaa5a' }} />
                  <span className="text-xs text-white/60 ml-2">analytics --recovery --trends</span>
                </div>
                <div className="rsc-window-body">
                  <Terminal className="w-12 h-12" style={{ color: 'var(--red-muted)' }} strokeWidth={1} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>[Recovery Analytics View]</span>
                  <span className="text-xs" style={{ color: 'var(--border)' }}>trend data + confidence intervals</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="rsc-divider" />

        {/* How It Works */}
        <section className="px-6 py-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">how_it_works()</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>three steps to probability-powered grazing</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { num: '01', title: 'capture', desc: 'sentinel-2 delivers multispectral imagery every 5 days. discrete pixels become raw material.', color: 'var(--red)' },
                { num: '02', title: 'process', desc: 'models transform point measurements into continuous probability fields. uncertainty is a feature.', color: 'var(--green)' },
                { num: '03', title: 'harvest', desc: 'wake up to probability-scored guidance. not just where to graze but how certain we are.', color: 'var(--accent2)' },
              ].map((step, idx) => (
                <div key={idx} className="rsc-card">
                  <div className="text-4xl font-bold mb-4" style={{ color: step.color }}>{step.num}</div>
                  <h3 className="text-base font-bold mb-3">{step.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Source */}
        <section className="px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">license: apache-2.0</h2>
            <p className="text-sm mb-12" style={{ color: 'var(--text-muted)' }}>
              open source. open data. open development.
            </p>
            <div className="space-y-4">
              {[
                { label: 'open_source', desc: 'full source. self-host or use managed.' },
                { label: 'open_data', desc: 'your data stays yours. export anytime.' },
                { label: 'open_development', desc: 'public roadmap. community-driven.' },
              ].map((item, idx) => (
                <div key={idx} className="rsc-card flex gap-4 items-center text-left">
                  <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--green)' }} strokeWidth={2.5} />
                  <div>
                    <span className="text-sm font-bold">{item.label}</span>
                    <span className="text-xs ml-3" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-28" style={{ background: 'var(--dark)' }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-white" style={{ textWrap: 'balance' }}>
              ready to harvest<br />
              <span style={{ color: 'var(--green)' }}>probability?</span>
            </h2>
            <p className="text-sm mb-12 max-w-2xl mx-auto" style={{ color: 'var(--green-muted)' }}>
              join the beta. start using data intelligence for adaptive grazing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-4 bg-white font-bold border-2 border-white transition-all shadow-[4px_4px_0_rgba(168,58,50,0.5)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_rgba(168,58,50,0.5)] flex items-center justify-center gap-2 text-xs uppercase tracking-wider group" style={{ color: 'var(--dark)' }}>
                ./signup --free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
              <button className="px-10 py-4 bg-transparent text-white font-bold border-2 border-white/40 transition-all shadow-[4px_4px_0_rgba(168,58,50,0.25)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_rgba(168,58,50,0.25)] text-xs uppercase tracking-wider hover:border-white/70">
                ./schedule --demo
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8" style={{ background: 'var(--dark)', borderTop: '1px solid rgba(168,58,50,0.2)' }}>
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs" style={{ color: 'var(--green-muted)' }}>
            <span>&copy; 2024 openpasture | apache-2.0</span>
            <div className="flex gap-6">
              <a href="#" className="hover:opacity-70 transition-opacity">docs</a>
              <a href="#" className="hover:opacity-70 transition-opacity">github</a>
              <a href="#" className="hover:opacity-70 transition-opacity">support</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
