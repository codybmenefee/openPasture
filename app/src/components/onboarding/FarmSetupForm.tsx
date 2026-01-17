import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FarmData {
  name: string
  location: string
  area: string
}

interface FarmSetupFormProps {
  onNext: (data: FarmData) => void
  onBack: () => void
  initialData?: FarmData
}

export function FarmSetupForm({ onNext, onBack, initialData }: FarmSetupFormProps) {
  const [formData, setFormData] = useState<FarmData>(initialData || {
    name: '',
    location: '',
    area: '',
  })

  const isValid = formData.name.trim() && formData.location.trim() && formData.area.trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onNext(formData)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Tell us about your farm</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Farm Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Clearview Farm"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Canterbury, NZ"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="area" className="text-sm font-medium">
              Total Area (approximate)
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="450"
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">hectares</span>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={!isValid}>
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
