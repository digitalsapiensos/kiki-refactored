/**
 * Agent Management System - Real LLM Integration
 * Replaces MockAgentSystem with DeepSeek-powered professional agents
 */

import { deepSeekClient, DeepSeekMessage } from './client'
import { promptLoader, AgentPrompt } from './prompt-loader'

export interface ConversationContext {
  projectId: string
  currentPhase: number
  messageHistory: ConversationMessage[]
  sessionData: Record<string, any>
  userPreferences: Record<string, any>
}

export interface ConversationMessage {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  agentId?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface AgentResponse {
  content: string
  agentId: string
  shouldTransition: boolean
  nextAgentId?: string
  filesToGenerate?: FileGeneration[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface FileGeneration {
  id: string
  fileName: string
  type: string
  progress: number
  status: 'pending' | 'generating' | 'completed' | 'error'
  agentId: string
  content?: string
}

class AgentManager {
  private contextCache: Map<string, ConversationContext> = new Map()
  
  constructor() {
    console.log('🤖 AgentManager initialized with DeepSeek integration')
  }

  /**
   * Generate agent response using real LLM
   */
  async generateAgentResponse(
    agentId: string,
    userMessage: string,
    context: ConversationContext
  ): Promise<AgentResponse> {
    // Get agent information and system prompt
    const agent = promptLoader.getAgent(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    // Prepare conversation history for LLM
    const conversationHistory: DeepSeekMessage[] = this.buildConversationHistory(
      context.messageHistory,
      agentId
    )

    // Add context enhancement to system prompt
    const enhancedSystemPrompt = this.enhanceSystemPrompt(
      agent.systemPrompt,
      context,
      agentId
    )

    try {
      // Call DeepSeek API
      const response = await deepSeekClient.generateAgentResponse(
        enhancedSystemPrompt,
        conversationHistory,
        userMessage,
        agentId,
        {
          temperature: this.getAgentTemperature(agentId),
          max_tokens: 2000
        }
      )

      // Analyze response for file generation triggers
      const filesToGenerate = this.analyzeFileGenerationTriggers(
        response.content,
        agentId,
        context
      )

      // Update conversation context
      this.updateConversationContext(context, {
        id: `msg-${Date.now()}`,
        content: response.content,
        role: 'assistant',
        agentId: agentId,
        timestamp: new Date()
      })

      return {
        content: response.content,
        agentId,
        shouldTransition: response.shouldTransition,
        nextAgentId: response.nextAgentId,
        filesToGenerate,
        usage: response.usage
      }
    } catch (error) {
      console.error('Error generating agent response:', error)
      
      // Fallback to a generic response
      return {
        content: 'Lo siento, he encontrado un problema técnico. Por favor, inténtalo de nuevo en un momento.',
        agentId,
        shouldTransition: false,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      }
    }
  }

  /**
   * Get agent introduction message for first contact
   */
  async getAgentIntroduction(agentId: string, context: ConversationContext): Promise<string> {
    const agent = promptLoader.getAgent(agentId)
    if (!agent) {
      return 'Hola, soy tu asistente especializado.'
    }

    // Use a simple introduction pattern based on the agent's role
    const introductions: Record<string, string> = {
      'consultor-virtual': `Hola 👋, soy tu ${agent.name} especializado en el primer paso de convertir ideas en proyectos completos.

Mi trabajo es entender profundamente tu visión a través de una conversación estructurada. Al final, generaré un resumen detallado que alimentará el resto del proceso de creación del proyecto.

¿Tienes wireframes, diagramas o sketches que puedan ayudarme a entender mejor tu idea?

**Para comenzar: ¿puedes contarme con tus palabras cuál es la idea general de la app que quieres construir?**`,

      'business-analyst': `Soy el ${agent.name}, segundo paso en la cadena de inicio de proyecto.

He recibido tu conversation_summary.md y procederé a crear tres documentos estructurados: case_overview.md, logic_breakdown.md y meta_outline.md.

Mi trabajo es transformar la conversación en artefactos estructurados sin tocar aspectos de implementación técnica.

**Por favor, comparte conmigo el contenido de tu conversation_summary.md para comenzar el análisis.**`,

      'arquitecto-senior': `Soy tu ${agent.name} y Planificador Estratégico, tercer paso en la cadena de desarrollo.

Crearé un Master Plan completo basado en los documentos de negocio que has generado. Mi función es generar la hoja de ruta técnica y estratégica para todo el desarrollo posterior.

**Por favor, comparte conmigo los archivos: 01_case_overview.md, 02_logic_breakdown.md y 03_meta_outline.md para proceder con el master plan.**`,

      'arquitecto-estructura': `Soy tu ${agent.name}, especializado en crear andamiajes de proyecto completos y funcionales.

He recibido el Master Plan y mi función es transformarlo en estructura de proyecto lista para desarrollo, incluyendo scaffolding completo, estructura de carpetas y documentación técnica inicial.

**Por favor, comparte conmigo el masterplan.md para proceder con la creación de la estructura.**`,

      'project-operations': `Soy el ${agent.name}, responsable de configurar el sistema operativo del proyecto para desarrollo eficiente.

He recibido la estructura completa y mi función es implementar todos los elementos operativos necesarios: sistema de tracking, workflows de desarrollo y documentación operativa completa.

**Por favor, comparte conmigo la estructura del proyecto para proceder con la configuración operativa.**`
    }

    return introductions[agentId] || `Hola, soy ${agent.name}. ${agent.description}`
  }

  /**
   * Handle agent transition between phases
   */
  async handleAgentTransition(
    currentAgentId: string,
    context: ConversationContext
  ): Promise<{
    nextAgent: AgentPrompt | null
    transitionMessage: string
    filesToTransfer?: string[]
  }> {
    const nextAgent = promptLoader.getNextAgent(currentAgentId)
    
    if (!nextAgent) {
      return {
        nextAgent: null,
        transitionMessage: '¡Perfecto! Hemos completado toda la cadena de inicio de proyecto. Tu proyecto está ahora completamente estructurado y listo para desarrollo.',
        filesToTransfer: []
      }
    }

    // Generate transition summary
    const currentAgent = promptLoader.getAgent(currentAgentId)
    const transitionMessage = `Excelente trabajo con ${currentAgent?.name || 'la fase anterior'}. 

Ahora te conectaré con nuestro ${nextAgent.name} (${nextAgent.role}) quien se encargará de la siguiente fase del proyecto.

El ${nextAgent.name} utilizará los documentos generados en esta fase para continuar con el desarrollo de tu proyecto.`

    // Determine files to transfer based on the agent
    const filesToTransfer = this.getAgentOutputFiles(currentAgentId)

    return {
      nextAgent,
      transitionMessage,
      filesToTransfer
    }
  }

  /**
   * Build conversation history for LLM context
   */
  private buildConversationHistory(
    messages: ConversationMessage[],
    currentAgentId: string
  ): DeepSeekMessage[] {
    // Filter messages for current agent context
    const relevantMessages = messages
      .filter(msg => msg.agentId === currentAgentId || msg.role === 'user')
      .slice(-10) // Keep last 10 messages for context

    return relevantMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }))
  }

  /**
   * Enhance system prompt with context
   */
  private enhanceSystemPrompt(
    basePrompt: string,
    context: ConversationContext,
    agentId: string
  ): string {
    const contextInfo = `
CONTEXTO ACTUAL:
- Proyecto ID: ${context.projectId}
- Fase actual: ${context.currentPhase}
- Mensajes en conversación: ${context.messageHistory.length}
- Agente activo: ${agentId}

INSTRUCCIONES ADICIONALES:
- Mantén el tono profesional pero amable establecido en los prompts
- Si el usuario parece confundido, ofrece ejemplos concretos
- Cuando sientas que has recolectado suficiente información, indica que estás listo para generar documentos o pasar al siguiente agente
- Usa el formato de salida especificado en tu prompt base
`

    return `${basePrompt}\n\n${contextInfo}`
  }

  /**
   * Get appropriate temperature for different agents
   */
  private getAgentTemperature(agentId: string): number {
    const temperatureMap: Record<string, number> = {
      'consultor-virtual': 0.8,      // More creative for conversation
      'business-analyst': 0.6,       // Structured but some flexibility
      'arquitecto-senior': 0.7,      // Creative for technical solutions
      'arquitecto-estructura': 0.5,  // More deterministic for structure
      'project-operations': 0.4      // Most deterministic for procedures
    }

    return temperatureMap[agentId] || 0.7
  }

  /**
   * Analyze response for file generation triggers
   */
  private analyzeFileGenerationTriggers(
    response: string,
    agentId: string,
    context: ConversationContext
  ): FileGeneration[] {
    const files: FileGeneration[] = []
    
    // Check for file generation keywords
    const fileKeywords = [
      'generar',
      'crear documento',
      'archivo',
      'summary.md',
      'overview.md',
      'masterplan.md',
      'BACKLOG.md'
    ]

    const shouldGenerateFiles = fileKeywords.some(keyword =>
      response.toLowerCase().includes(keyword.toLowerCase())
    )

    if (shouldGenerateFiles) {
      const agent = promptLoader.getAgent(agentId)
      if (agent?.files) {
        agent.files.forEach((fileName, index) => {
          files.push({
            id: `file-${agentId}-${Date.now()}-${index}`,
            fileName,
            type: this.getFileType(fileName),
            progress: 0,
            status: 'pending',
            agentId
          })
        })
      }
    }

    return files
  }

  /**
   * Get file type from filename
   */
  private getFileType(fileName: string): string {
    if (fileName.endsWith('.md')) return 'Documentation'
    if (fileName.endsWith('.json')) return 'Configuration'
    if (fileName.endsWith('.sql')) return 'Database'
    if (fileName.includes('backlog')) return 'Project Management'
    if (fileName.includes('overview')) return 'Business Analysis'
    return 'Documentation'
  }

  /**
   * Get output files for agent
   */
  private getAgentOutputFiles(agentId: string): string[] {
    const agent = promptLoader.getAgent(agentId)
    return agent?.files || []
  }

  /**
   * Update conversation context
   */
  private updateConversationContext(
    context: ConversationContext,
    newMessage: ConversationMessage
  ): void {
    context.messageHistory.push(newMessage)
    
    // Keep context manageable (last 50 messages)
    if (context.messageHistory.length > 50) {
      context.messageHistory = context.messageHistory.slice(-50)
    }

    // Cache the updated context
    this.contextCache.set(context.projectId, context)
  }

  /**
   * Get or create conversation context
   */
  getOrCreateContext(projectId: string, initialPhase: number = 1): ConversationContext {
    let context = this.contextCache.get(projectId)
    
    if (!context) {
      context = {
        projectId,
        currentPhase: initialPhase,
        messageHistory: [],
        sessionData: {},
        userPreferences: {}
      }
      this.contextCache.set(projectId, context)
    }

    return context
  }

  /**
   * Clear context for project (useful for testing)
   */
  clearContext(projectId: string): void {
    this.contextCache.delete(projectId)
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return deepSeekClient.getUsageStats()
  }

  /**
   * Health check for the agent system
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'error'
    agentCount: number
    deepSeekStatus: any
  }> {
    const deepSeekHealth = await deepSeekClient.healthCheck()
    const agentCount = promptLoader.getAllAgents().length

    return {
      status: deepSeekHealth.status === 'healthy' ? 'healthy' : 'error',
      agentCount,
      deepSeekStatus: deepSeekHealth
    }
  }
}

// Export singleton instance
export const agentManager = new AgentManager()

// Export utility functions
export const generateAgentResponse = async (
  agentId: string,
  userMessage: string,
  projectId: string,
  currentPhase: number = 1
): Promise<AgentResponse> => {
  const context = agentManager.getOrCreateContext(projectId, currentPhase)
  return agentManager.generateAgentResponse(agentId, userMessage, context)
}

export const getAgentIntroduction = async (
  agentId: string,
  projectId: string,
  currentPhase: number = 1
): Promise<string> => {
  const context = agentManager.getOrCreateContext(projectId, currentPhase)
  return agentManager.getAgentIntroduction(agentId, context)
}