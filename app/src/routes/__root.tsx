import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const router = useRouterState()
  const isFullPageLayout =
    router.location.pathname === '/marketing' ||
    router.location.pathname.startsWith('/docs')

  // Marketing and docs pages use their own full-page layout
  if (isFullPageLayout) {
    return <Outlet />
  }

  // App pages use sidebar and header
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
