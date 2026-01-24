import { createFileRoute } from '@tanstack/react-router'
import { DocsContent, DocsBreadcrumb } from '@/components/docs'
import { docsConfig } from '@/lib/docs/navigation'

export const Route = createFileRoute('/docs/$category/$article')({
  component: DocsArticlePage,
})

function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function DocsArticlePage() {
  const { category, article } = Route.useParams()

  // Find the section and item in the navigation config
  const section = docsConfig.navigation.find((s) => s.slug === category)
  const item = section?.items.find((i) => i.href === `/docs/${category}/${article}`)

  return (
    <DocsContent>
      <DocsBreadcrumb category={category} article={article} />

      <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
        {item?.title ?? formatSlug(article)}
      </h1>

      {item?.badge && (
        <span
          className={`
            inline-block mb-6 rounded-full px-2 py-1 text-xs font-medium uppercase tracking-wide
            ${item.badge === 'New' ? 'bg-emerald-500/10 text-emerald-500' : ''}
            ${item.badge === 'Beta' ? 'bg-amber-500/10 text-amber-500' : ''}
            ${item.badge === 'Updated' ? 'bg-blue-500/10 text-blue-500' : ''}
          `}
        >
          {item.badge}
        </span>
      )}

      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">
          This is a placeholder for the <strong>{formatSlug(article)}</strong> documentation.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Content will be added here.
        </p>
      </div>
    </DocsContent>
  )
}
