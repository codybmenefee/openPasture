import { Satellite, MapPin, Cpu, Brain, Check } from 'lucide-react'

const technologies = [
  {
    icon: Satellite,
    label: 'Daily satellite observation',
    year: '2015+',
  },
  {
    icon: MapPin,
    label: 'GPS-enabled animal tracking',
    year: '2018+',
  },
  {
    icon: Cpu,
    label: 'Cheap sensors & cloud',
    year: '2020+',
  },
  {
    icon: Brain,
    label: 'AI for multi-variable decisions',
    year: '2023+',
  },
]

export function TechnologyConvergence() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[#1a2429]/50 border border-[#075056]/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#FDF6E3] mb-4 text-center">
          Technology Convergence
        </h3>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[#075056]/50 via-[#075056] to-[#FF5B04]" />

          <div className="space-y-3">
            {technologies.map((tech, index) => {
              const Icon = tech.icon
              return (
                <div key={index} className="relative flex items-center gap-4 pl-10">
                  {/* Circle on timeline */}
                  <div className="absolute left-2.5 w-3.5 h-3.5 rounded-full bg-[#233038] border-2 border-[#075056] flex items-center justify-center">
                    <Check className="h-2 w-2 text-[#075056]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex items-center justify-between bg-[#233038]/50 rounded-md p-2.5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-[#075056]" />
                      <span className="text-xs text-[#FDF6E3]/90">{tech.label}</span>
                    </div>
                    <span className="text-[10px] text-[#D3DBDD]/70">{tech.year}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#075056]/30 text-center">
          <p className="text-xs text-[#FDF6E3]/90">
            These existed separately.{' '}
            <span className="text-[#FF5B04] font-semibold">Now they're one system.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
