/**
 * DeepSeek API Client - Production-Ready Integration
 * Secure, cost-aware client with error handling and retry logic
 */

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekRequestOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

interface DeepSeekResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

interface DeepSeekUsageStats {
  totalRequests: number
  totalTokens: number
  estimatedCost: number
  lastRequest: Date
}

class DeepSeekClient {
  private baseUrl = 'https://api.deepseek.com/v1'
  private apiKey: string
  private defaultModel = 'deepseek-chat'
  private usageStats: DeepSeekUsageStats = {
    totalRequests: 0,
    totalTokens: 0,
    estimatedCost: 0,
    lastRequest: new Date()
  }
  
  // Rate limiting - DeepSeek has generous limits but we'll be conservative
  private requestQueue: Array<() => Promise<any>> = []
  private isProcessingQueue = false
  private maxRequestsPerMinute = 50 // Conservative limit
  private requestTimestamps: number[] = []

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || ''
    
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required')
    }
  }

  /**
   * Main method to send chat completion requests to DeepSeek
   */
  async chat(
    messages: DeepSeekMessage[],
    options: DeepSeekRequestOptions = {}
  ): Promise<{
    content: string
    usage: DeepSeekResponse['usage']
    model: string
  }> {
    // Rate limiting check
    if (!this.canMakeRequest()) {
      await this.waitForRateLimit()
    }

    const requestOptions = {
      model: options.model || this.defaultModel,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 4000,
      stream: false, // We'll implement streaming later if needed
      ...options
    }

    const requestBody = {
      ...requestOptions,
      messages
    }

    try {
      const response = await this.makeRequestWithRetry(requestBody)
      
      // Update usage statistics
      this.updateUsageStats(response.usage)
      
      return {
        content: response.choices[0]?.message?.content || '',
        usage: response.usage,
        model: response.model
      }
    } catch (error) {
      console.error('DeepSeek API Error:', error)
      throw new Error(`DeepSeek request failed: ${error.message}`)
    }
  }

  /**
   * Specialized method for agent conversations with system prompts
   */
  async generateAgentResponse(
    systemPrompt: string,
    conversationHistory: DeepSeekMessage[],
    userMessage: string,
    agentId: string,
    options: DeepSeekRequestOptions = {}
  ): Promise<{
    content: string
    usage: DeepSeekResponse['usage']
    shouldTransition: boolean
    nextAgentId?: string
  }> {
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ]

    const result = await this.chat(messages, {
      temperature: 0.8, // Slightly higher for personality
      max_tokens: 2000,
      ...options
    })

    // Analyze response for transition signals
    const shouldTransition = this.analyzeTransitionNeed(result.content, conversationHistory.length)
    const nextAgentId = shouldTransition ? this.getNextAgentId(agentId) : undefined

    return {
      content: result.content,
      usage: result.usage,
      shouldTransition,
      nextAgentId
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequestWithRetry(
    requestBody: any,
    maxRetries: number = 3
  ): Promise<DeepSeekResponse> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'User-Agent': 'Kiki-Agent-System/1.0'
          },
          body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`)
        }

        const data: DeepSeekResponse = await response.json()
        
        // Track successful request
        this.requestTimestamps.push(Date.now())
        this.usageStats.totalRequests++
        this.usageStats.lastRequest = new Date()

        return data
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on client errors (4xx)
        if (error.message.includes('HTTP 4')) {
          throw error
        }
        
        // Wait before retry with exponential backoff
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000
          console.warn(`DeepSeek request attempt ${attempt} failed, retrying in ${waitTime}ms...`, error.message)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
    }

    throw lastError || new Error('Max retries exceeded')
  }

  /**
   * Rate limiting logic
   */
  private canMakeRequest(): boolean {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    
    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneMinuteAgo)
    
    return this.requestTimestamps.length < this.maxRequestsPerMinute
  }

  private async waitForRateLimit(): Promise<void> {
    const oldestRequestTime = this.requestTimestamps[0]
    if (!oldestRequestTime) return

    const waitTime = 60000 - (Date.now() - oldestRequestTime) + 100 // Add small buffer
    if (waitTime > 0) {
      console.log(`Rate limit reached, waiting ${waitTime}ms...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  /**
   * Usage statistics and cost tracking
   */
  private updateUsageStats(usage: DeepSeekResponse['usage']): void {
    this.usageStats.totalTokens += usage.total_tokens
    
    // DeepSeek pricing (as of 2024): $0.14 per 1M input tokens, $0.28 per 1M output tokens
    const inputCost = (usage.prompt_tokens / 1000000) * 0.14
    const outputCost = (usage.completion_tokens / 1000000) * 0.28
    this.usageStats.estimatedCost += inputCost + outputCost
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): DeepSeekUsageStats {
    return { ...this.usageStats }
  }

  /**
   * Reset usage statistics (useful for testing or monthly resets)
   */
  resetUsageStats(): void {
    this.usageStats = {
      totalRequests: 0,
      totalTokens: 0,
      estimatedCost: 0,
      lastRequest: new Date()
    }
  }

  /**
   * Analyze if agent should transition to next agent
   */
  private analyzeTransitionNeed(response: string, conversationLength: number): boolean {
    const transitionKeywords = [
      'he completado',
      'perfecto',
      'listo para',
      'siguiente paso',
      'siguiente prompt',
      'siguiente agente',
      'transferir al',
      'continuar con',
      'proceder con',
      'siguiente fase'
    ]

    const hasTransitionKeywords = transitionKeywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    )

    // Also transition if conversation is getting long (more than 6 exchanges)
    const conversationTooLong = conversationLength >= 12 // 6 user + 6 agent messages

    return hasTransitionKeywords || conversationTooLong
  }

  /**
   * Get next agent ID based on current agent
   */
  private getNextAgentId(currentAgentId: string): string | undefined {
    const agentSequence = [
      'consultor-virtual',      // 1-extractor-conversacional.md
      'business-analyst',       // 2-formalizador-negocio.md
      'arquitecto-senior',      // 3-generador-masterplan.md
      'arquitecto-estructura',  // 4-arquitecto-estructura.md
      'project-operations'      // 5-configurador-proyecto.md
    ]

    const currentIndex = agentSequence.indexOf(currentAgentId)
    
    if (currentIndex === -1 || currentIndex === agentSequence.length - 1) {
      return undefined // No next agent
    }

    return agentSequence[currentIndex + 1]
  }

  /**
   * Health check method
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'error'
    latency: number
    error?: string
  }> {
    const startTime = Date.now()
    
    try {
      await this.chat([
        { role: 'user', content: 'Hello' }
      ], {
        max_tokens: 10,
        temperature: 0
      })
      
      return {
        status: 'healthy',
        latency: Date.now() - startTime
      }
    } catch (error) {
      return {
        status: 'error',
        latency: Date.now() - startTime,
        error: error.message
      }
    }
  }
}

// Export singleton instance
export const deepSeekClient = new DeepSeekClient()

// Export types for external use
export type { DeepSeekMessage, DeepSeekRequestOptions, DeepSeekUsageStats }