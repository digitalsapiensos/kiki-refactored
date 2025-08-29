/**
 * Frontend Adapter for DeepSeek Agent System
 * Bridges existing frontend components with new DeepSeek-powered backend
 */

import { ChatMessage, Agent, ChatSession, FileGeneration } from '../../components/chat/types'

interface DeepSeekApiResponse {
  content: string
  agentId: string
  shouldTransition: boolean
  nextAgentId?: string
  filesToGenerate?: Array<{
    id: string
    fileName: string
    type: string
    progress: number
    status: string
    agentId: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  provider: string
  model: string
}

interface AgentIntroResponse {
  introduction: string
  agent: {
    id: string
    name: string
    role: string
    description: string
    phase: number
    color: string
  }
}

class DeepSeekFrontendAdapter {
  private baseUrl = '/api/chat'

  /**
   * Generate agent response using DeepSeek API
   * Compatible with existing MockAgentSystem interface
   */
  async generateAgentResponse(
    agent: Agent,
    userMessage: string,
    session: ChatSession
  ): Promise<{
    response: string
    shouldTransition: boolean
    filesToGenerate: FileGeneration[]
    nextAgent?: Agent
  }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: session.projectId || 'demo-project',
          agentId: agent.id,
          userMessage,
          phase: agent.phase
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data: DeepSeekApiResponse = await response.json()

      // Convert DeepSeek response to MockAgentSystem format
      return {
        response: data.content,
        shouldTransition: data.shouldTransition,
        filesToGenerate: this.convertFilesToGeneration(data.filesToGenerate || []),
        nextAgent: data.nextAgentId ? await this.getAgentById(data.nextAgentId) : undefined
      }

    } catch (error) {
      console.error('DeepSeek API Error:', error)
      
      // Fallback to friendly error message
      return {
        response: `Lo siento, he encontrado un problema técnico momentáneo. Por favor, inténtalo de nuevo. 

Si el problema persiste, el sistema está funcionando en modo DeepSeek integrado - esto significa que estás viendo respuestas reales de IA en lugar de respuestas simuladas.

Error: ${error.message}`,
        shouldTransition: false,
        filesToGenerate: [],
        nextAgent: undefined
      }
    }
  }

  /**
   * Get agent introduction message
   */
  async getAgentIntroduction(agent: Agent, currentStep: number): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}?action=introduction&agentId=${agent.id}&projectId=demo-${Date.now()}`,
        { method: 'GET' }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data: AgentIntroResponse = await response.json()
      return data.introduction

    } catch (error) {
      console.warn('Failed to get agent introduction:', error)
      
      // Fallback to agent description
      return `Hola, soy ${agent.name}. ${agent.description}`
    }
  }

  /**
   * Get agent by ID (for frontend compatibility)
   */
  private async getAgentById(agentId: string): Promise<Agent | undefined> {
    try {
      const response = await fetch(`${this.baseUrl}?action=agents`, { method: 'GET' })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const agent = data.agents.find((a: any) => a.id === agentId)
      
      if (!agent) return undefined

      // Convert to frontend Agent format
      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        phase: agent.phase,
        description: agent.description,
        color: agent.color,
        personality: agent.description, // Use description as personality
        expertise: [agent.role], // Use role as expertise
      }

    } catch (error) {
      console.warn('Failed to get agent by ID:', error)
      return undefined
    }
  }

  /**
   * Convert DeepSeek file format to frontend format
   */
  private convertFilesToGeneration(files: DeepSeekApiResponse['filesToGenerate']): FileGeneration[] {
    if (!files) return []

    return files.map(file => ({
      id: file.id,
      fileName: file.fileName,
      type: file.type,
      progress: file.progress,
      status: file.status as 'pending' | 'generating' | 'completed' | 'error',
      agentId: file.agentId
    }))
  }

  /**
   * Get system health and usage stats
   */
  async getSystemHealth() {
    try {
      const response = await fetch(`${this.baseUrl}?action=health`, { method: 'GET' })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()

    } catch (error) {
      console.warn('Failed to get system health:', error)
      return { status: 'error', error: error.message }
    }
  }

  /**
   * Simulate typing delay (for UX compatibility)
   */
  async simulateTypingDelay(messageLength: number): Promise<void> {
    // Real API already has natural delay, but we add a small UX delay
    const baseDelay = 500 // Minimum delay for UX
    const dynamicDelay = Math.min(messageLength * 10, 2000) // Max 2s additional
    const totalDelay = baseDelay + dynamicDelay

    return new Promise(resolve => setTimeout(resolve, totalDelay))
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const health = await this.getSystemHealth()
      return health.status === 'healthy'
    } catch {
      return false
    }
  }
}

// Create singleton instance
export const deepSeekAdapter = new DeepSeekFrontendAdapter()

// Export compatibility functions for existing code
export const generateMockResponse = async (
  agent: Agent,
  userMessage: string,
  session: ChatSession
) => {
  return deepSeekAdapter.generateAgentResponse(agent, userMessage, session)
}

export const simulateTypingDelay = async (messageLength: number): Promise<void> => {
  return deepSeekAdapter.simulateTypingDelay(messageLength)
}

// Export the adapter instance
export default deepSeekAdapter