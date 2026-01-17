import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'

interface OnboardingCompleteProps {
  farmName: string
  location: string
  area: string
  paddockCount: number
}

export function OnboardingComplete({
  farmName,
  location,
  area,
  paddockCount,
}: OnboardingCompleteProps) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">You're all set!</h1>
      
      <Card className="w-full max-w-sm my-6">
        <CardContent className="pt-6 text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Farm:</span>
            <span className="font-medium">{farmName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium">{location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Area:</span>
            <span className="font-medium">{area} hectares</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paddocks:</span>
            <span className="font-medium">{paddockCount} defined</span>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-muted-foreground max-w-md mb-6">
        We'll start analyzing satellite imagery for your farm. 
        Your first Morning Brief will be ready by tomorrow at 6:00 AM.
      </p>
      
      <Button size="lg" asChild>
        <Link to="/">Go to Dashboard</Link>
      </Button>
    </div>
  )
}
