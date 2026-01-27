import { Satellite, Brain, FileText } from 'lucide-react'

const steps = [
  {
    icon: Satellite,
    title: 'Observe',
    description: 'Satellite imagery reveals vegetation health patterns invisible from the ground.',
  },
  {
    icon: Brain,
    title: 'Optimize',
    description: 'AI scores each paddock daily based on recovery, animal needs, and constraints.',
  },
  {
    icon: FileText,
    title: 'Orchestrate',
    description: 'Receive actionable recommendations each morning to guide your decisions.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-20 bg-[#233038]" aria-labelledby="how-it-works-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2
              id="how-it-works-heading"
              className="text-2xl md:text-3xl font-bold text-[#FDF6E3] text-balance"
            >
              The Orchestration Layer for Pastured Livestock
            </h2>
          </div>

          {/* Horizontal timeline */}
          <div className="relative">
            {/* Connecting line - hidden on mobile */}
            <div
              className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-[#075056]/50 via-[#075056]/30 to-[#075056]/50"
              aria-hidden="true"
            />

            <ol className="grid md:grid-cols-3 gap-8 list-none">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <li key={index} className="relative text-center">
                    {/* Step number badge */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="rounded-full bg-[#1a2429] border-2 border-[#075056]/50 p-3">
                          <Icon className="h-5 w-5 text-[#075056]" aria-hidden="true" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#075056] rounded-full text-xs font-bold text-[#FDF6E3] flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[#FDF6E3] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#D3DBDD]">{step.description}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
