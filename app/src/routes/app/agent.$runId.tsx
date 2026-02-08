import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Badge, badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading/LoadingSpinner'
import { ErrorState } from '@/components/ui/error/ErrorState'
import { useAgentRunDeepDive } from '@/lib/convex/useAgentDashboard'
import type { AgentRun, AgentRunStep } from '@/lib/types'
import type { Id } from '../../../convex/_generated/dataModel'
import type { VariantProps } from 'class-variance-authority'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

function statusVariant(status: AgentRun['status']): BadgeVariant {
  if (status === 'succeeded') return 'cli-solid'
  if (status === 'failed') return 'destructive'
  if (status === 'blocked') return 'secondary'
  return 'outline'
}

function stepVariant(stepType: AgentRunStep['stepType']): BadgeVariant {
  if (stepType === 'error') return 'destructive'
  if (stepType === 'decision') return 'cli-solid'
  if (stepType === 'tool_call' || stepType === 'tool_result') return 'secondary'
  return 'outline'
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function formatValue(value: unknown): string {
  if (value === undefined) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export const Route = createFileRoute('/app/agent/$runId')({
  component: AgentRunDeepDiveRoute,
})

function AgentRunDeepDiveRoute() {
  const { runId } = Route.useParams()
  const { deepDive, isLoading } = useAgentRunDeepDive(runId as Id<'agentRuns'>)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner message="Loading run deep dive..." />
      </div>
    )
  }

  if (!deepDive) {
    return (
      <div className="h-full overflow-auto p-6">
        <ErrorState
          title="Run Not Found"
          message="The selected run could not be loaded or you do not have access to it."
        />
      </div>
    )
  }

  const { run, steps, hasDeepDive } = deepDive
  const initialPromptStep = steps.find((step) => step.stepType === 'prompt')
  const initialPromptInput = asRecord(initialPromptStep?.input)
  const systemPrompt = typeof initialPromptInput?.systemPrompt === 'string'
    ? initialPromptInput.systemPrompt
    : null
  const textPrompt = typeof initialPromptInput?.textPrompt === 'string'
    ? initialPromptInput.textPrompt
    : null

  return (
    <div className="h-full overflow-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/app/agent">
                <ArrowLeft className="h-4 w-4" />
                Back to Monitor
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Agent Run Deep Dive</h1>
              <p className="text-sm text-muted-foreground">
                Trace what happened in this run, step-by-step.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
            <Badge variant="outline">{run.trigger}</Badge>
            <Badge variant="outline">{run.profileId}</Badge>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Run Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-2">
            <p><span className="text-muted-foreground">Run ID:</span> {run._id}</p>
            <p><span className="text-muted-foreground">Started:</span> {new Date(run.startedAt).toLocaleString()}</p>
            <p><span className="text-muted-foreground">Completed:</span> {run.completedAt ? new Date(run.completedAt).toLocaleString() : '-'}</p>
            <p><span className="text-muted-foreground">Latency:</span> {run.latencyMs ? `${run.latencyMs}ms` : '-'}</p>
            <p><span className="text-muted-foreground">Tool Calls:</span> {run.toolCallCount ?? 0}</p>
            <p><span className="text-muted-foreground">Plan Output:</span> {run.outputPlanId ?? '-'}</p>
          </CardContent>
        </Card>

        {!hasDeepDive ? (
          <Card className="border-2 border-terracotta/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Summary-Only Run</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Summary-only run: this run predates deep-dive instrumentation.
              </p>
              <div className="space-y-1">
                <p><span className="text-muted-foreground">Tool Summary:</span> {run.toolSummary?.join(', ') || '-'}</p>
                <p><span className="text-muted-foreground">Tool Call Count:</span> {run.toolCallCount ?? 0}</p>
                <p><span className="text-muted-foreground">Error:</span> {run.errorMessage || '-'}</p>
                <p><span className="text-muted-foreground">Output Plan:</span> {run.outputPlanId || '-'}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Initial Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {initialPromptStep ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Step {initialPromptStep.stepIndex}: {initialPromptStep.title}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">System Prompt</p>
                      <pre className="max-h-72 overflow-auto rounded border bg-muted/30 p-3 text-xs whitespace-pre-wrap">
                        {systemPrompt || 'No system prompt payload was captured for this step.'}
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">User Prompt</p>
                      <pre className="max-h-96 overflow-auto rounded border bg-muted/30 p-3 text-xs whitespace-pre-wrap">
                        {textPrompt || formatValue(initialPromptStep.input)}
                      </pre>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No prompt step was captured for this run.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Execution Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {steps.map((step) => (
                  <div key={step._id} className="rounded border p-3 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">#{step.stepIndex}</Badge>
                      <Badge variant={stepVariant(step.stepType)}>{step.stepType}</Badge>
                      {step.toolName ? <Badge variant="outline">{step.toolName}</Badge> : null}
                      <p className="text-sm font-medium">{step.title}</p>
                    </div>

                    {step.justification ? (
                      <p className="text-sm text-muted-foreground">{step.justification}</p>
                    ) : null}

                    {step.input !== undefined ? (
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Input</p>
                        <pre className="max-h-72 overflow-auto rounded border bg-muted/30 p-2 text-xs whitespace-pre-wrap">
                          {formatValue(step.input)}
                        </pre>
                      </div>
                    ) : null}

                    {step.output !== undefined ? (
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Output</p>
                        <pre className="max-h-72 overflow-auto rounded border bg-muted/30 p-2 text-xs whitespace-pre-wrap">
                          {formatValue(step.output)}
                        </pre>
                      </div>
                    ) : null}

                    {step.error ? (
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wide text-destructive">Error</p>
                        <pre className="max-h-48 overflow-auto rounded border border-destructive/40 bg-destructive/5 p-2 text-xs whitespace-pre-wrap">
                          {step.error}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
