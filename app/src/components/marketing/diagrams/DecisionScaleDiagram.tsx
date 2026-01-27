export function DecisionScaleDiagram() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-[#1a2429]/50 border border-[#075056]/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-[#FDF6E3]/90 mb-3 text-center">
          Decision Complexity vs. Herd Size
        </h3>

        {/* Chart area */}
        <div className="relative h-40">
          {/* Y-axis label */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-[#D3DBDD]/70 whitespace-nowrap">
            Decision Complexity
          </div>

          {/* Chart grid */}
          <div className="ml-6 h-full relative border-l border-b border-[#075056]/30">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-t border-[#075056]/20 w-full" />
              ))}
            </div>

            {/* Exponential curve (SVG) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#075056" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <path
                d="M 5 95 Q 30 90, 50 70 Q 70 45, 85 15 L 95 5"
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Threshold line */}
              <line
                x1="0"
                y1="35"
                x2="100"
                y2="35"
                stroke="#F4D47C"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            </svg>

            {/* Threshold label */}
            <div className="absolute right-1 top-[28%] text-[10px] text-[#F4D47C]">
              Human capacity
            </div>

            {/* Zone labels */}
            <div className="absolute left-2 bottom-2 text-[10px] text-[#075056]">
              Manageable
            </div>
            <div className="absolute right-2 top-2 text-[10px] text-red-400">
              Execution collapse
            </div>
          </div>

          {/* X-axis label */}
          <div className="text-center text-[10px] text-[#D3DBDD]/70 mt-1 ml-6">
            Herd Size / Paddock Count
          </div>
        </div>

        <p className="text-center text-xs text-[#D3DBDD] mt-3">
          The biology can go further. Execution collapses first.
        </p>
      </div>
    </div>
  )
}
