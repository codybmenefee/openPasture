# Vision

## The Real Bottleneck

The limiting factor in regenerative grazing is not data. Farmers don't say they're blocked by lack of soil sensors or nutrient analysis. The real bottleneck is time on pasture — the attention required to physically observe land conditions and make daily movement decisions across a whole farm.

Soil analysis and dense sensor networks feel like solutions, but they address a problem farmers don't actually have. Threading the needle means avoiding two failure modes:

- **Over-indexing on trackable metrics** reduces a complex living system to numbers, repeating the reductionist mistakes regenerative agriculture was built to correct.
- **Over-indexing on physical observation** doesn't scale. A farmer cannot be everywhere every day.

The optimal solution scales the farmer's visual monitoring capability without replacing their judgment.

## Thesis

A farmer needs two things to make a movement decision:

1. **Accumulated industry knowledge** — the principles developed by practitioners like Greg Judy, Joel Salatin, and Richard Perkins: move at least weekly, ideally daily; don't overgraze; leave residual; rest periods matter; context of the broader ecosystem.
2. **Visual confirmation of pasture health** plus a mental model of prior conditions.

The first can be captured in text and reasoned over by an LLM. Combined with pasture imagery, this creates a feedback loop capable of generating movement suggestions comparable to farmer intuition.

## The Product

Imagine Greg Judy, Joel Salatin, or Richard Perkins staring at images of your farm all day. Every morning they send you a text and a map: *"Move the animals here today."* The suggestion is adjacent to where the animals currently are, timed and measured to benefit both the paddock being vacated and the broader farm system — accounting for forward projections, weather, rest periods, and herd pressure.

That is what this system builds.

The recommendation is rendered as a polygon on an orthomosaic representation of the farm. The farmer approves, adjusts, or rejects. That feedback improves future suggestions.

## What We Need to Build It

**Starting inputs:**
- Satellite imagery (available today, free, global)
- Farmer field notes, optionally with photos

These two inputs are sufficient to architect the core decision engine. The digital twin of the farm needs to exist only in imagery — satellite, drone, or fixed camera — not in soil probes or collar telemetry.

**Optimization path (once the engine exists):**
- Farmer approval rate as a training signal (RLHF)
- Drone imagery for higher resolution
- Soil and moisture monitoring for finer tuning
- Direct push to virtual fencing collars

## What We Are Not Building

This is a recommendation engine, not a control system. We are not building:

- Automated fence actuation
- Livestock tracking or collar firmware
- Soil monitoring infrastructure
- Real-time herd movement systems

Those are downstream of a working recommendation engine. We build the brain first.

## Success

The product succeeds when a farmer says: "This matches how I think about my land" — and they say it without having walked the pasture that morning.
