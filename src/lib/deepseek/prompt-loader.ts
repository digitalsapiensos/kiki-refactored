/**
 * System Prompt Loader for Professional Agents
 * Loads and manages system prompts from markdown files
 */

import * as fs from 'fs'
import * as path from 'path'

export interface AgentPrompt {
  id: string
  name: string
  role: string
  description: string
  systemPrompt: string
  phase: number
  color: string
  files?: string[]
}

// Agent definitions matching the professional system prompts
const AGENT_DEFINITIONS: Record<string, Omit<AgentPrompt, 'systemPrompt'>> = {
  'consultor-virtual': {
    id: 'consultor-virtual',
    name: 'Consultor Virtual',
    role: 'Extractor Conversacional',
    description: 'Consultor de negocio experto que extrae y clarifica ideas mediante conversación estructurada',
    phase: 1,
    color: '#FDE047', // Yellow
    files: ['conversation-summary.md', 'project-vision.md', 'initial-requirements.md']
  },
  'business-analyst': {
    id: 'business-analyst',
    name: 'Business Analyst',
    role: 'Formalizador de Negocio',
    description: 'Especialista en descomponer conversaciones en documentos estructurados de lógica de negocio',
    phase: 2,
    color: '#60A5FA', // Blue
    files: ['01_case_overview.md', '02_logic_breakdown.md', '03_meta_outline.md']
  },
  'arquitecto-senior': {
    id: 'arquitecto-senior',
    name: 'Arquitecto Senior',
    role: 'Generador de Master Plan',
    description: 'Planificador estratégico que crea hojas de ruta técnicas y estratégicas completas',
    phase: 3,
    color: '#34D399', // Green
    files: ['masterplan.md', 'technical-roadmap.md', 'architecture-decisions.md', 'technology-stack.md']
  },
  'arquitecto-estructura': {
    id: 'arquitecto-estructura',
    name: 'Arquitecto de Estructura',
    role: 'Arquitecto de Estructura',
    description: 'Especialista en crear andamiajes de proyecto completos y estructuras funcionales',
    phase: 4,
    color: '#FB923C', // Orange
    files: ['project-structure.md', 'scaffolding-guide.md', 'development-setup.md', 'folder-structure.md']
  },
  'project-operations': {
    id: 'project-operations',
    name: 'Project Operations',
    role: 'Configurador de Proyecto',
    description: 'Especialista en configurar sistemas operativos de proyecto para desarrollo eficiente',
    phase: 5,
    color: '#A78BFA', // Purple
    files: ['BACKLOG.md', 'STATUS_LOG.md', 'project-procedures.md', 'development-workflow.md']
  }
}

class PromptLoader {
  private promptsCache: Map<string, string> = new Map()
  private agentsCache: Map<string, AgentPrompt> = new Map()
  private systemPromptsPath: string

  constructor() {
    // Path to System Prompts directory
    this.systemPromptsPath = path.join(process.cwd(), '..', 'System Prompts')
    this.loadAllPrompts()
  }

  /**
   * Load all system prompts from files
   */
  private loadAllPrompts(): void {
    const promptFiles: Record<string, string> = {
      'consultor-virtual': '1-extractor-conversacional.md',
      'business-analyst': '2-formalizador-negocio.md',
      'arquitecto-senior': '3-generador-masterplan.md',
      'arquitecto-estructura': '4-arquitecto-estructura.md',
      'project-operations': '5-configurador-proyecto.md'
    }

    const basePromptPath = path.join(this.systemPromptsPath, 'situaciones-usuario', '01-inicio-proyecto')

    Object.entries(promptFiles).forEach(([agentId, filename]) => {
      try {
        const promptPath = path.join(basePromptPath, filename)
        
        if (fs.existsSync(promptPath)) {
          const fileContent = fs.readFileSync(promptPath, 'utf-8')
          
          // Extract system prompt content (between <system_prompt> tags)
          const systemPromptMatch = fileContent.match(/<system_prompt>([\s\S]*?)<\/system_prompt>/)
          const systemPrompt = systemPromptMatch 
            ? systemPromptMatch[1].trim()
            : fileContent.trim()

          this.promptsCache.set(agentId, systemPrompt)
          
          // Create complete agent object
          const agentDefinition = AGENT_DEFINITIONS[agentId]
          if (agentDefinition) {
            const completeAgent: AgentPrompt = {
              ...agentDefinition,
              systemPrompt
            }
            this.agentsCache.set(agentId, completeAgent)
          }
        } else {
          console.warn(`System prompt file not found: ${promptPath}`)
          
          // Fallback to hardcoded prompt
          this.loadFallbackPrompt(agentId)
        }
      } catch (error) {
        console.error(`Error loading prompt for ${agentId}:`, error)
        this.loadFallbackPrompt(agentId)
      }
    })
  }

  /**
   * Load fallback prompts if files are not available
   */
  private loadFallbackPrompt(agentId: string): void {
    const fallbackPrompts: Record<string, string> = {
      'consultor-virtual': `
ERES UN CONSULTOR DE NEGOCIO EXPERTO CON UNA ACTITUD EXTREMADAMENTE AMABLE Y SOLIDARIA. TU MISIÓN ES EXTRAER Y CLARIFICAR LA IDEA DE APLICACIÓN DEL USUARIO MEDIANTE UNA CONVERSACIÓN ESTRUCTURADA PERO NATURAL.

Tu objetivo es entender profundamente la visión del usuario a través de preguntas específicas y generar al final un resumen completo que será usado por el siguiente agente.

METODOLOGÍA:
1. Presentación y captura inicial de la idea
2. Clarificación del problema central que resuelve
3. Exploración de usuarios, procesos, datos e integraciones
4. Profundización en funcionalidades principales
5. Aspectos técnicos y plataforma preferida
6. Validación y resumen completo

REGLAS:
- Una pregunta por vez, construye sobre respuestas anteriores
- Mantén conversación natural y cálida
- Profundiza en el "por qué" de las necesidades
- Valida comprensión antes de avanzar al siguiente tema
- Al final, genera un resumen estructurado en formato markdown
      `,
      'business-analyst': `
ERES UN BUSINESS-LOGIC DECOMPOSER EXPERTO. TU FUNCIÓN ES TRANSFORMAR EL RESUMEN CONVERSACIONAL EN DOCUMENTOS ESTRUCTURADOS DE LÓGICA DE NEGOCIO, SIN TOCAR ASPECTOS DE IMPLEMENTACIÓN FÍSICA.

Descompones la conversación en artefactos crisp y review-ready manteniendo todo en lenguaje de dominio/negocio.

METODOLOGÍA:
1. Extraer caso de negocio principal
2. Identificar entidades del mundo real
3. Clasificar atributos fijos vs propiedades variables
4. Detectar relaciones entre entidades
5. Análisis de operaciones CRUD y políticas de seguridad
6. Construir meta outline de estructura de datos

SALIDA: 3 archivos markdown estructurados
- 01_case_overview.md - Resumen ejecutivo
- 02_logic_breakdown.md - Análisis de entidades y operaciones
- 03_meta_outline.md - Esquema conceptual de datos
      `,
      'arquitecto-senior': `
ERES UN ARQUITECTO SENIOR Y PLANIFICADOR ESTRATÉGICO. TU FUNCIÓN ES CREAR UN MASTER PLAN TÉCNICO COMPLETO BASADO EN LOS DOCUMENTOS DE NEGOCIO.

Generas la hoja de ruta técnica y estratégica para todo el desarrollo posterior, incluyendo selección de stack, arquitectura y planificación de fases.

METODOLOGÍA:
1. Análisis de documentos de negocio recibidos
2. Selección de stack tecnológico óptimo
3. Diseño de arquitectura escalable
4. Planificación de fases de desarrollo
5. Identificación de riesgos y mitigaciones
6. Generación de roadmap técnico completo

Considera tecnologías 2025: Supabase, React 19, TypeScript 5.0, shadcn-ui v2, y herramientas modernas según el contexto del proyecto.
      `,
      'arquitecto-estructura': `
ERES UN ARQUITECTO DE ESTRUCTURA especializado en crear andamiajes de proyecto completos y funcionales.

Tu función es transformar el Master Plan en estructura de proyecto lista para desarrollo, incluyendo organización de carpetas, archivos base y documentación técnica.

METODOLOGÍA:
1. Análisis del Master Plan recibido
2. Diseño de estructura de carpetas óptima
3. Creación de archivos stub y configuraciones base
4. Implementación de convenciones y estándares
5. Documentación técnica de la estructura
6. Guías de desarrollo y mejores prácticas

SALIDA: Estructura completa de proyecto con scaffolding, documentación técnica y guías de implementación.
      `,
      'project-operations': `
ERES UN PROJECT OPERATIONS SPECIALIST responsable de configurar el sistema operativo del proyecto para desarrollo eficiente.

Tu función es implementar todos los elementos operativos necesarios: sistema de tracking, workflows de desarrollo y documentación operativa completa.

METODOLOGÍA:
1. Análisis de estructura de proyecto recibida
2. Configuración de sistema de seguimiento (BACKLOG.md)
3. Implementación de workflows de desarrollo
4. Creación de procedimientos operativos
5. Configuración de herramientas de gestión
6. Documentación operativa completa

SALIDA: Sistema operativo completo del proyecto con BACKLOG, STATUS_LOG, workflows y procedimientos listos para desarrollo.
      `
    }

    const fallbackPrompt = fallbackPrompts[agentId] || 'Eres un asistente especializado en desarrollo de proyectos.'
    
    this.promptsCache.set(agentId, fallbackPrompt)
    
    const agentDefinition = AGENT_DEFINITIONS[agentId]
    if (agentDefinition) {
      const completeAgent: AgentPrompt = {
        ...agentDefinition,
        systemPrompt: fallbackPrompt
      }
      this.agentsCache.set(agentId, completeAgent)
    }
  }

  /**
   * Get system prompt for a specific agent
   */
  getSystemPrompt(agentId: string): string {
    const prompt = this.promptsCache.get(agentId)
    if (!prompt) {
      console.warn(`No system prompt found for agent: ${agentId}`)
      return 'Eres un asistente especializado en desarrollo de proyectos.'
    }
    return prompt
  }

  /**
   * Get complete agent information
   */
  getAgent(agentId: string): AgentPrompt | null {
    const agent = this.agentsCache.get(agentId)
    if (!agent) {
      console.warn(`No agent found: ${agentId}`)
      return null
    }
    return agent
  }

  /**
   * Get all available agents
   */
  getAllAgents(): AgentPrompt[] {
    return Array.from(this.agentsCache.values()).sort((a, b) => a.phase - b.phase)
  }

  /**
   * Get agent by phase number
   */
  getAgentByPhase(phase: number): AgentPrompt | null {
    const agents = this.getAllAgents()
    return agents.find(agent => agent.phase === phase) || null
  }

  /**
   * Get next agent in sequence
   */
  getNextAgent(currentAgentId: string): AgentPrompt | null {
    const currentAgent = this.getAgent(currentAgentId)
    if (!currentAgent) return null
    
    return this.getAgentByPhase(currentAgent.phase + 1)
  }

  /**
   * Check if agent exists
   */
  hasAgent(agentId: string): boolean {
    return this.agentsCache.has(agentId)
  }

  /**
   * Reload all prompts (useful for development)
   */
  reloadPrompts(): void {
    this.promptsCache.clear()
    this.agentsCache.clear()
    this.loadAllPrompts()
  }

  /**
   * Get agent IDs in execution order
   */
  getAgentSequence(): string[] {
    return this.getAllAgents().map(agent => agent.id)
  }
}

// Export singleton instance
export const promptLoader = new PromptLoader()

// Export utility functions
export const getSystemPrompt = (agentId: string): string => 
  promptLoader.getSystemPrompt(agentId)

export const getAgent = (agentId: string): AgentPrompt | null =>
  promptLoader.getAgent(agentId)

export const getAllAgents = (): AgentPrompt[] =>
  promptLoader.getAllAgents()

export const getNextAgent = (currentAgentId: string): AgentPrompt | null =>
  promptLoader.getNextAgent(currentAgentId)