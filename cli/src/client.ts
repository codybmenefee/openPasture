import { ConvexHttpClient } from 'convex/browser'

let _client: ConvexHttpClient | null = null

export function getClient(): ConvexHttpClient {
  if (_client) return _client

  const url = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL
  if (!url) {
    console.error('Error: CONVEX_URL environment variable is required.')
    console.error('Set it to your Convex deployment URL.')
    process.exit(1)
  }

  _client = new ConvexHttpClient(url)
  return _client
}
