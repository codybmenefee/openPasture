import { createFileRoute, Outlet } from '@tanstack/react-router'
import { DocsLayout } from '@/components/docs'

export const Route = createFileRoute('/docs')({
  component: DocsLayoutRoute,
})

function DocsLayoutRoute() {
  return (
    <DocsLayout>
      <Outlet />
    </DocsLayout>
  )
}
