import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ThemeProvider } from '@/lib/theme'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GeometryProviderWithConvex } from '@/lib/geometry/GeometryProviderWithConvex'
import { ErrorState } from '@/components/ui/error/ErrorState'
import { routeTree } from './routeTree.gen'
import './index.css'

const router = createRouter({ routeTree })
const convexUrl = import.meta.env.VITE_CONVEX_URL
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {convexClient ? (
      <ConvexProvider client={convexClient}>
        <ThemeProvider>
          <GeometryProviderWithConvex>
            <TooltipProvider delayDuration={300}>
              <RouterProvider router={router} />
            </TooltipProvider>
          </GeometryProviderWithConvex>
        </ThemeProvider>
      </ConvexProvider>
    ) : (
      <ThemeProvider>
        <ErrorState
          title="Convex configuration missing"
          message="Set VITE_CONVEX_URL to your Convex deployment URL before running the app."
          details={[
            'Run `npx convex dev` in app/ to create a local deployment.',
            'Copy the deployment URL into a .env file as VITE_CONVEX_URL.',
          ]}
          className="min-h-screen"
        />
      </ThemeProvider>
    )}
  </StrictMode>,
)
