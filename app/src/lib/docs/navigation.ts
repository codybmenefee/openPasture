import {
  BookOpen,
  Map,
  Calendar,
  Code,
  Plug,
} from 'lucide-react'
import type { DocsConfig } from './types'

export const docsConfig: DocsConfig = {
  title: 'Morning Farm Brief',
  description: 'Documentation for the AI-powered grazing decision support system',
  navigation: [
    {
      title: 'Getting Started',
      slug: 'getting-started',
      icon: BookOpen,
      defaultOpen: true,
      items: [
        { title: 'Introduction', href: '/docs/getting-started/introduction' },
        { title: 'Quick Start', href: '/docs/getting-started/quick-start' },
        { title: 'Installation', href: '/docs/getting-started/installation' },
        { title: 'Core Concepts', href: '/docs/getting-started/concepts' },
      ],
    },
    {
      title: 'Farm Setup',
      slug: 'farm-setup',
      icon: Map,
      items: [
        { title: 'Paddocks', href: '/docs/farm-setup/paddocks' },
        { title: 'Sections', href: '/docs/farm-setup/sections' },
        { title: 'Water Sources', href: '/docs/farm-setup/water-sources' },
        { title: 'Importing Data', href: '/docs/farm-setup/import' },
      ],
    },
    {
      title: 'Daily Briefs',
      slug: 'daily-briefs',
      icon: Calendar,
      items: [
        { title: 'Recommendations', href: '/docs/daily-briefs/recommendations' },
        { title: 'NDVI Analysis', href: '/docs/daily-briefs/ndvi', badge: 'New' },
        { title: 'Weather Integration', href: '/docs/daily-briefs/weather' },
        { title: 'Confidence Scoring', href: '/docs/daily-briefs/confidence' },
      ],
    },
    {
      title: 'API Reference',
      slug: 'api-reference',
      icon: Code,
      items: [
        { title: 'Overview', href: '/docs/api-reference/overview' },
        { title: 'Authentication', href: '/docs/api-reference/auth' },
        { title: 'Endpoints', href: '/docs/api-reference/endpoints' },
        { title: 'Webhooks', href: '/docs/api-reference/webhooks', badge: 'Beta' },
      ],
    },
    {
      title: 'Integrations',
      slug: 'integrations',
      icon: Plug,
      items: [
        { title: 'Satellite Providers', href: '/docs/integrations/satellites' },
        { title: 'Weather Services', href: '/docs/integrations/weather' },
        { title: 'Farm Management Systems', href: '/docs/integrations/fms' },
      ],
    },
  ],
}
