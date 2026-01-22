import { createFileRoute } from '@tanstack/react-router'
import { MorningBrief } from '@/components/brief/MorningBrief'

export const Route = createFileRoute('/')({
  component: () => <MorningBrief farmExternalId="farm-1" />,
})
