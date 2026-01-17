import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dataStatus } from '@/data/mock/farm'

export function DataStatusCard() {
  const qualityColors = {
    good: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    limited: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    poor: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  }

  return (
    <Card>
      <CardHeader className="pb-3 xl:pb-4">
        <CardTitle className="text-sm xl:text-base font-medium">Data Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 xl:space-y-3 text-xs xl:text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last satellite pass</span>
          <span>{dataStatus.lastSatellitePass}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Next satellite pass</span>
          <span>{dataStatus.nextExpectedPass}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Cloud coverage</span>
          <div className="flex items-center gap-2">
            <span>{dataStatus.cloudCoverage}%</span>
            <div className="w-16 xl:w-20 h-1.5 xl:h-2 rounded-full bg-muted">
              <div 
                className="h-full rounded-full bg-primary"
                style={{ width: `${dataStatus.cloudCoverage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Observation quality</span>
          <Badge variant="outline" className={qualityColors[dataStatus.observationQuality]}>
            {dataStatus.observationQuality.charAt(0).toUpperCase() + dataStatus.observationQuality.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
