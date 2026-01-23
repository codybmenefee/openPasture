/**
 * Braintrust integration for agent trace logging.
 *
 * Logs all agent interactions, prompts, tool calls, and responses
 * for observability and debugging.
 */

export interface TraceContext {
  traceId: string
  projectName: string
  experimentName?: string
}

export interface LogPromptParams {
  traceId: string
  systemPrompt: string
  userPrompt: string
  metadata?: Record<string, any>
}

export interface LogToolCallParams {
  traceId: string
  toolName: string
  input: any
  output?: any
  error?: string
  metadata?: Record<string, any>
}

export interface LogResponseParams {
  traceId: string
  response: string
  metadata?: Record<string, any>
}

class BraintrustClient {
  private apiKey: string | null = null
  private baseUrl = 'https://www.braintrust.dev/api'

  constructor() {
    // Braintrust API key from environment
    if (typeof window === 'undefined') {
      // Server-side: use process.env
      this.apiKey = process.env.BRAINTRUST_API_KEY || null
    } else {
      // Client-side: Braintrust should be initialized server-side only
      this.apiKey = null
    }
  }

  /**
   * Start a new trace session.
   */
  async startTrace(
    projectName: string,
    experimentName?: string
  ): Promise<TraceContext> {
    if (!this.apiKey) {
      // Return mock trace ID if Braintrust is not configured
      return {
        traceId: `mock-${Date.now()}`,
        projectName,
        experimentName,
      }
    }

    // In a real implementation, this would call Braintrust API
    // For now, generate a trace ID
    const traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return {
      traceId,
      projectName,
      experimentName,
    }
  }

  /**
   * Log a prompt to Braintrust.
   */
  async logPrompt(params: LogPromptParams): Promise<void> {
    if (!this.apiKey) {
      console.log('[Braintrust] Log prompt:', params)
      return
    }

    // In a real implementation, this would POST to Braintrust API
    // POST /api/log
    // {
    //   "trace_id": params.traceId,
    //   "type": "prompt",
    //   "system": params.systemPrompt,
    //   "user": params.userPrompt,
    //   "metadata": params.metadata,
    // }
    console.log('[Braintrust] Log prompt:', params)
  }

  /**
   * Log a tool call to Braintrust.
   */
  async logToolCall(params: LogToolCallParams): Promise<void> {
    if (!this.apiKey) {
      console.log('[Braintrust] Log tool call:', params)
      return
    }

    // In a real implementation, this would POST to Braintrust API
    console.log('[Braintrust] Log tool call:', params)
  }

  /**
   * Log an agent response to Braintrust.
   */
  async logResponse(params: LogResponseParams): Promise<void> {
    if (!this.apiKey) {
      console.log('[Braintrust] Log response:', params)
      return
    }

    // In a real implementation, this would POST to Braintrust API
    console.log('[Braintrust] Log response:', params)
  }

  /**
   * End a trace session.
   */
  async endTrace(traceId: string): Promise<void> {
    if (!this.apiKey) {
      console.log('[Braintrust] End trace:', traceId)
      return
    }

    // In a real implementation, this would POST to Braintrust API
    console.log('[Braintrust] End trace:', traceId)
  }
}

// Singleton instance
let client: BraintrustClient | null = null

export function getBraintrustClient(): BraintrustClient {
  if (!client) {
    client = new BraintrustClient()
  }
  return client
}

// Convenience functions
export async function startTrace(
  projectName: string,
  experimentName?: string
): Promise<TraceContext> {
  return getBraintrustClient().startTrace(projectName, experimentName)
}

export async function logPrompt(params: LogPromptParams): Promise<void> {
  return getBraintrustClient().logPrompt(params)
}

export async function logToolCall(params: LogToolCallParams): Promise<void> {
  return getBraintrustClient().logToolCall(params)
}

export async function logResponse(params: LogResponseParams): Promise<void> {
  return getBraintrustClient().logResponse(params)
}

export async function endTrace(traceId: string): Promise<void> {
  return getBraintrustClient().endTrace(traceId)
}
