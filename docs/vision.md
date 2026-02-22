# Vision

## Founding Principle

Complex systems — like nature itself — are best utilized when you work within them, not when you abstract away from them. Regenerative agriculture was built on this insight. This product is built on the same one.

The decision of when to move animals across pasture is a multi-variable analysis: labor availability, animal stress and condition, the health of the currently grazed paddock, the next paddock, the pasture as a whole, the farm as a whole, projected weather in the near and intermediate term, and the historic performance of the land over time. A farmer with the right training has proven capable of weighing all of this — some of it empirically, much of it intuitively. We seek to augment that decision-making layer by predicting what a trained farmer would do.

## The Real Bottleneck

The limiting factor in regenerative grazing is not data. Farmers don't say they're blocked by lack of soil sensors or nutrient analysis. The real bottleneck is time on pasture — the attention required to physically observe land conditions and make daily movement decisions across a whole farm.

Soil analysis and dense sensor networks feel like solutions, but they address a problem farmers don't actually have. Threading the needle means avoiding two failure modes:

- **Over-indexing on trackable metrics** reduces a complex living system to numbers, repeating the reductionist mistakes regenerative agriculture was built to correct.
- **Over-indexing on physical observation** doesn't scale. A farmer cannot be everywhere every day.

The optimal solution scales the farmer's visual monitoring capability without replacing their judgment.

## The Value Proposition

Regenerative grazing increases stocking density — more animals on the same acreage because the land is healthier and more productive. Our system increases operational scale — more acres managed by the same farmer because daily observation and decision-making is handled autonomously.

These are multiplicative, not additive. A farmer who adopts regenerative practices and uses this system doesn't just farm more profitably — they begin to compete with operations far larger than their own. This is the unlock for the small and mid-size farmer.

## Thesis

A farmer needs two things to make a movement decision:

1. **Accumulated industry knowledge** — the principles developed by practitioners like Greg Judy, Joel Salatin, and Richard Perkins: move at least weekly, ideally daily; don't overgraze; leave residual; rest periods matter; context of the broader ecosystem.
2. **Visual confirmation of pasture health** plus a mental model of prior conditions.

The first can be captured in text and reasoned over by an LLM. Combined with pasture imagery, this creates a feedback loop capable of generating movement suggestions comparable to farmer intuition.

## The Product

Imagine Greg Judy, Joel Salatin, or Richard Perkins staring at images of your farm all day. Every morning they send you a text and a map: *"Move the animals here today."* The suggestion is adjacent to where the animals currently are, timed and measured to benefit both the paddock being vacated and the broader farm system — accounting for forward projections, weather, rest periods, and herd pressure.

That is what this system builds.

The recommendation is rendered as a polygon on an orthomosaic representation of the farm. The farmer approves, adjusts, or rejects. That feedback improves future suggestions.

Critically, the system does not just receive farmer input — it directs the farmer's observational attention. Each morning report includes a request for the specific field observation that would most reduce uncertainty in that day's recommendation: a grass height sample, a gut read on time left in the current paddock. The farmer spends less time walking the farm randomly and more time collecting targeted signal. This is how the system scales a farmer's attention rather than replacing it.

## The Farmer as Benchmark

The farmer is the benchmark of efficiency, not the ceiling.

The system earns trust by matching farmer judgment. It earns the right to exceed farmer judgment by showing better outcomes — tracked over time through pasture health trends, stocking performance, and land recovery rates. The land itself is the feedback mechanism.

This design prevents the atrophy risk: a farmer who always defers to the system does not lose their intuition as long as the outcomes confirm the decisions were right. Outcome tracking is how the system proves it is working — and how it surfaces when it isn't.

## What We Need to Build It

**Starting inputs:**
- Satellite imagery — daily, global, up to 3m resolution on paid plans, providing NDVI and biomass proxies sufficient for farm and pasture-level health assessment
- Farmer field notes, optionally with photos

These two inputs are sufficient to architect the core decision engine. The farm's digital representation lives in imagery — not soil probes or collar telemetry.

**Known gap:** Satellite cannot reliably assess precise grass height or growth stage at the paddock level. The decision to graze just before seed, taking only the top third of the plant, requires this information. Field notes close this gap initially. Fixed pasture cameras are the likely near-term bridge. Drone imagery or improved satellite analysis resolves it long-term.

**Optimization path (once the engine exists):**
- Farmer approval rate as a training signal (RLHF)
- Fixed pasture cameras for growth stage visibility
- Drone imagery for higher resolution
- Direct push to virtual fencing collars

## The Collar Dependency

Collar integration is the unlock that converts this system from decision support into autonomous operation. Without it, the system reduces cognitive burden but not labor burden — a harder value proposition to sustain at scale. With it, the farmer's role shifts from daily physical execution to daily review and approval. That is the equivalent shift that coding agents brought to software development.

The collar market is currently locked behind proprietary software with no open APIs.

Our strategy: build the decision-making layer aggressively and let its value create pressure on collar companies to integrate. If they don't open their APIs, we will compete at the hardware layer with a cheap, COTS-based, open-source collar design that commoditizes the market and breaks the lock. The brain is the defensible asset. The collar is not.

## What We Are Not Building

This is a recommendation engine, not a control system. We are not building:

- Automated fence actuation
- Livestock tracking or collar firmware
- Soil monitoring infrastructure
- Real-time herd movement systems

Those are downstream of a working recommendation engine. We build the brain first.

## Why Now

Three vectors are converging:

**Satellite resolution** — SpaceX and Blue Origin dramatically reduced the cost of reaching orbit. Cheaper launch economics enabled commercial operators like Planet Labs to deploy large constellations, increasing revisit frequency and resolution while driving down cost. Daily 3m imagery at commercial prices is a direct downstream effect of the reusable rocket era.

**LLM and agent maturity** — The ability to reason over complex, multi-variable decisions using codified domain knowledge — and to do so as an autonomous agent operating on a daily loop — has only recently become viable and affordable.

**Drone accessibility** — Falling hardware costs and loosening regulations make drone imagery a credible near-term input, though it is not required to begin.

These three vectors arriving simultaneously is what makes the core architecture buildable today.

## Success

The product succeeds when a farmer says: "This matches how I think about my land" — and they say it without having walked the pasture that morning.

The product wins when a farmer says: "I couldn't run this many acres without it."
