/**
 * Shared types for the agent harness layer.
 */

export type AgentRunStepType = 'prompt' | 'tool_call' | 'tool_result' | 'decision' | 'error' | 'info'

export type AgentRunStepPayload = {
  stepType: AgentRunStepType
  title: string
  toolName?: string
  justification?: string
  input?: unknown
  output?: unknown
  error?: string
}

export type AgentRunStepRecorder = {
  recordStep: (payload: AgentRunStepPayload) => Promise<void>
}

export type TraceSpan = { log: (data: unknown) => void }

export type TraceLogger = {
  traced: <T>(
    fn: (span: TraceSpan) => Promise<T>,
    options?: { name?: string; metadata?: Record<string, unknown> }
  ) => Promise<T>
}
