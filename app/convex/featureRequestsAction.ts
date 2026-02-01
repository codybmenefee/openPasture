"use node"

import { v } from 'convex/values'
import { action } from './_generated/server'
import { api } from './_generated/api'

const featureCategory = v.union(
  v.literal('grazing'),
  v.literal('map'),
  v.literal('satellite'),
  v.literal('livestock'),
  v.literal('analytics'),
  v.literal('integrations'),
  v.literal('mobile'),
  v.literal('other')
)

const featureContext = v.object({
  url: v.string(),
  userAgent: v.string(),
  screenSize: v.optional(v.string()),
  timestamp: v.string(),
})

type FeatureCategory = 'grazing' | 'map' | 'satellite' | 'livestock' | 'analytics' | 'integrations' | 'mobile' | 'other'

const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  grazing: 'Grazing Recommendations',
  map: 'Map & Paddocks',
  satellite: 'Satellite Imagery',
  livestock: 'Livestock Management',
  analytics: 'Analytics & Reports',
  integrations: 'Integrations',
  mobile: 'Mobile Experience',
  other: 'Other',
}

interface GitHubIssueResponse {
  html_url: string
  number: number
}

/**
 * Create a GitHub issue for the feature request
 */
async function createGitHubIssue(args: {
  title: string
  description: string
  category: FeatureCategory
  context: {
    url: string
    userAgent: string
    screenSize?: string
    timestamp: string
  }
}): Promise<{ url: string; number: number } | null> {
  const githubToken = process.env.GITHUB_TOKEN
  if (!githubToken) {
    console.warn('GITHUB_TOKEN not configured, skipping GitHub issue creation')
    return null
  }

  const labels = ['enhancement']
  if (args.category !== 'other') {
    labels.push(`category:${args.category}`)
  }

  const body = `## Feature Request
${args.description}

## Context
- **Category:** ${CATEGORY_LABELS[args.category]}
- **URL:** ${args.context.url}
- **User Agent:** ${args.context.userAgent}
${args.context.screenSize ? `- **Screen Size:** ${args.context.screenSize}` : ''}
- **Timestamp:** ${args.context.timestamp}

---
*This issue was automatically created from a user feature request.*`

  try {
    const response = await fetch('https://api.github.com/repos/codybmenefee/pan/issues', {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'OpenPasture/1.0',
      },
      body: JSON.stringify({
        title: args.title,
        body,
        labels,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GitHub API error:', response.status, errorText)
      return null
    }

    const data = await response.json() as GitHubIssueResponse
    return {
      url: data.html_url,
      number: data.number,
    }
  } catch (error) {
    console.error('Failed to create GitHub issue:', error)
    return null
  }
}

/**
 * Submit a feature request - creates a record in the database and a GitHub issue
 */
export const submit = action({
  args: {
    userExternalId: v.optional(v.string()),
    farmExternalId: v.optional(v.string()),
    title: v.string(),
    description: v.string(),
    category: featureCategory,
    context: featureContext,
  },
  handler: async (ctx, args): Promise<{
    success: boolean
    featureRequestId?: string
    githubIssueUrl?: string
    error?: string
  }> => {
    try {
      // Create GitHub issue first
      const githubResult = await createGitHubIssue({
        title: args.title,
        description: args.description,
        category: args.category,
        context: args.context,
      })

      // Insert feature request into database
      const featureRequestId = await ctx.runMutation(api.featureRequests.insertFeatureRequest, {
        userExternalId: args.userExternalId,
        farmExternalId: args.farmExternalId,
        title: args.title,
        description: args.description,
        category: args.category,
        context: args.context,
        githubIssueUrl: githubResult?.url,
        githubIssueNumber: githubResult?.number,
      })

      return {
        success: true,
        featureRequestId: featureRequestId.toString(),
        githubIssueUrl: githubResult?.url,
      }
    } catch (error) {
      console.error('Failed to submit feature request:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
})
