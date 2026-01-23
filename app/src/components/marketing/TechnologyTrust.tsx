import { Shield, Database, Clock, Archive } from 'lucide-react'

const trustPoints = [
  {
    icon: Shield,
    text: 'Free and open satellite imagery',
  },
  {
    icon: Database,
    text: '10-meter resolution',
  },
  {
    icon: Clock,
    text: '2-3 day revisit frequency',
  },
  {
    icon: Archive,
    text: 'Historical archive since 2015',
  },
]

export function TechnologyTrust() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4">Powered by Free, Open Satellite Data</h2>
            <p className="text-xl text-muted-foreground">
              We use publicly available Sentinel-2 imagery from the European Space Agency. No proprietary data lock-in.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
            {trustPoints.map((point, index) => {
              const Icon = point.icon
              return (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">{point.text}</p>
                </div>
              )
            })}
          </div>

          <div className="pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              Data provided by{' '}
              <a 
                href="https://planetarycomputer.microsoft.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Microsoft Planetary Computer
              </a>
              {' '}and{' '}
              <a 
                href="https://sentinels.copernicus.eu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Copernicus Sentinel-2
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
