import { Satellite, Cloud, MapPin, FileText, Brain, RefreshCw } from 'lucide-react'

export function SystemArchitectureDiagram() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-2">
        {/* Layer 1: Farm Data Hub */}
        <div className="bg-[#233038]/80 border border-[#075056]/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#075056]" />
            <h3 className="text-sm font-semibold text-[#FDF6E3]">Farm Data Hub</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#D3DBDD]">
              <Satellite className="h-3 w-3 text-[#075056]" />
              <span>Satellite imagery</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#D3DBDD]">
              <Cloud className="h-3 w-3 text-[#075056]" />
              <span>Weather data</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#D3DBDD]">
              <MapPin className="h-3 w-3 text-[#075056]" />
              <span>GPS tracking</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#D3DBDD]">
              <FileText className="h-3 w-3 text-[#075056]" />
              <span>Farmer notes</span>
            </div>
          </div>
        </div>

        {/* Arrow down */}
        <div className="flex justify-center">
          <div className="w-px h-3 bg-gradient-to-b from-[#075056]/50 to-[#075056]/30" />
        </div>

        {/* Layer 2: Decision Engine */}
        <div className="bg-[#233038]/80 border border-[#FF5B04]/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5B04]" />
            <h3 className="text-sm font-semibold text-[#FDF6E3]">Decision Engine</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#D3DBDD]">
            <Brain className="h-3 w-3 text-[#FF5B04]" />
            <span>Scores paddocks, generates daily grazing plans with confidence levels</span>
          </div>
        </div>

        {/* Arrow down */}
        <div className="flex justify-center">
          <div className="w-px h-3 bg-gradient-to-b from-[#FF5B04]/30 to-[#F4D47C]/30" />
        </div>

        {/* Layer 3: Learning System */}
        <div className="bg-[#233038]/80 border border-[#F4D47C]/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F4D47C]" />
            <h3 className="text-sm font-semibold text-[#FDF6E3]">Learning System</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#D3DBDD]">
            <RefreshCw className="h-3 w-3 text-[#F4D47C]" />
            <span>Improves from farmer feedback, tracks outcomes, adapts to your land</span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-[#FDF6E3]/90 mt-4 font-medium">
        Decisions are the product. Not dashboards.
      </p>
    </div>
  )
}
