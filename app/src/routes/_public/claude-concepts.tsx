import { createFileRoute } from '@tanstack/react-router'
import { Concept50OliveCobalt } from '@/components/landing-concepts/Concept50OliveCobalt'

export const Route = createFileRoute('/_public/claude-concepts')({
  component: Concept50OliveCobalt,
})
