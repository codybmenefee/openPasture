export type GrassQuality = 'prime' | 'ready' | 'recovering' | 'resting'

export function getGrassQuality(ndvi: number): GrassQuality {
  if (ndvi >= 0.6) return 'prime'
  if (ndvi >= 0.45) return 'ready'
  if (ndvi >= 0.3) return 'recovering'
  return 'resting'
}

export function getGrassQualityLabel(quality: GrassQuality): string {
  const labels: Record<GrassQuality, string> = {
    prime: 'Prime',
    ready: 'Ready',
    recovering: 'Recovering',
    resting: 'Resting',
  }
  return labels[quality]
}

export function getGrassQualityColor(quality: GrassQuality): string {
  const colors: Record<GrassQuality, string> = {
    prime: 'text-green-600',
    ready: 'text-green-500',
    recovering: 'text-amber-500',
    resting: 'text-gray-400',
  }
  return colors[quality]
}

export function getGrassQualityBgColor(quality: GrassQuality): string {
  const colors: Record<GrassQuality, string> = {
    prime: 'bg-green-100 dark:bg-green-900/30',
    ready: 'bg-green-50 dark:bg-green-900/20',
    recovering: 'bg-amber-50 dark:bg-amber-900/20',
    resting: 'bg-gray-100 dark:bg-gray-800/30',
  }
  return colors[quality]
}

export function getGrassQualityBorderColor(quality: GrassQuality): string {
  const colors: Record<GrassQuality, string> = {
    prime: 'border-green-500',
    ready: 'border-green-400',
    recovering: 'border-amber-400',
    resting: 'border-gray-300',
  }
  return colors[quality]
}
