import { createFileRoute } from '@tanstack/react-router'
import {
  MarketingHeader,
  HeroSection,
  ProblemSolution,
  HowItWorks,
  FeaturesGrid,
  TechnologyTrust,
  SocialProof,
  CTASection,
  Footer,
} from '@/components/marketing'

function MarketingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      <HeroSection />
      <ProblemSolution />
      <HowItWorks />
      <FeaturesGrid />
      <TechnologyTrust />
      <SocialProof />
      <CTASection />
      <Footer />
    </div>
  )
}

export const Route = createFileRoute('/marketing')({
  component: MarketingPage,
})
