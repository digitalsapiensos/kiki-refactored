/**
 * DeepSeek API integration for intelligent conversation analysis
 */

import { ConceptAnalysis, ResearchAnalysis, TechPlanningAnalysis } from './conversation-analyzer'

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export class DeepSeekAnalyzer {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Analyze conceptualization phase conversation with DeepSeek
   */
  async analyzeConceptualization(messages: any[]): Promise<ConceptAnalysis> {
    const systemPrompt = `Eres un analizador de conversaciones para un wizard de creación de proyectos.
Tu tarea es analizar una conversación y extraer información específica.

Debes identificar y extraer:
1. Concepto/idea principal del proyecto
2. Usuarios objetivo o audiencia
3. Funcionalidades principales del MVP (mínimo 3)
4. Nombre del proyecto
5. Estrategia de validación (opcional)

Responde SIEMPRE en formato JSON con esta estructura exacta:
{
  "hasProjectConcept": boolean,
  "hasTargetUsers": boolean,
  "hasMVPFeatures": boolean,
  "hasValidationStrategy": boolean,
  "hasProjectName": boolean,
  "completeness": number (0-100),
  "missingElements": string[],
  "extractedData": {
    "projectName": "string o null",
    "concept": "string o null",
    "targetUsers": "string o null",
    "mvpFeatures": ["array de strings"] o null,
    "validationStrategy": "string o null"
  }
}

Calcula completeness así:
- Concepto: 25%
- Usuarios: 25%
- MVP Features: 25%
- Nombre: 15%
- Validación: 10% (opcional)

Si no encuentras algún elemento, marca como false y añádelo a missingElements.`

    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
      .join('\n\n')

    const userPrompt = `Analiza esta conversación:\n\n${conversationText}`

    try {
      const response = await this.callDeepSeek([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ])

      return JSON.parse(response) as ConceptAnalysis
    } catch (error) {
      console.error('Error analyzing with DeepSeek:', error)
      // Fallback to basic analysis
      return this.fallbackConceptAnalysis(messages)
    }
  }

  /**
   * Analyze research phase conversation with DeepSeek
   */
  async analyzeResearch(messages: any[]): Promise<ResearchAnalysis> {
    const systemPrompt = `Eres un analizador de conversaciones para la fase de investigación.

Debes identificar y extraer:
1. Competidores mencionados
2. Repositorios de GitHub o referencias de código
3. MCPs (Model Context Protocol) recomendados
4. Inspiración y aprendizajes clave

Responde SIEMPRE en formato JSON con esta estructura exacta:
{
  "hasCompetitors": boolean,
  "hasGithubRepos": boolean,
  "hasRecommendedMCPs": boolean,
  "hasInspiration": boolean,
  "completeness": number (0-100),
  "missingElements": string[],
  "extractedData": {
    "competitors": ["array de strings"] o null,
    "githubRepos": ["array de strings"] o null,
    "mcps": ["array de strings"] o null,
    "inspiration": "string o null"
  }
}

Cada elemento vale 25% para el completeness.`

    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
      .join('\n\n')

    const userPrompt = `Analiza esta conversación de investigación:\n\n${conversationText}`

    try {
      const response = await this.callDeepSeek([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ])

      return JSON.parse(response) as ResearchAnalysis
    } catch (error) {
      console.error('Error analyzing research with DeepSeek:', error)
      return this.fallbackResearchAnalysis(messages)
    }
  }

  /**
   * Analyze tech planning phase conversation with DeepSeek
   */
  async analyzeTechPlanning(messages: any[]): Promise<TechPlanningAnalysis> {
    const systemPrompt = `Eres un analizador de conversaciones para la fase de planificación técnica.

Debes identificar y extraer decisiones sobre:
1. Framework frontend (Next.js, React, Vue, etc.)
2. Librería de UI (shadcn, Material UI, etc.)
3. Backend (Supabase, Firebase, Node.js, etc.)
4. Estrategia de autenticación
5. Plataforma de hosting (Vercel, Netlify, etc.)

Responde SIEMPRE en formato JSON con esta estructura exacta:
{
  "hasFrontendChoice": boolean,
  "hasUILibraryChoice": boolean,
  "hasBackendChoice": boolean,
  "hasAuthStrategy": boolean,
  "hasHostingChoice": boolean,
  "completeness": number (0-100),
  "missingElements": string[],
  "extractedData": {
    "frontend": "string o null",
    "uiLibrary": "string o null",
    "backend": "string o null",
    "auth": "string o null",
    "hosting": "string o null"
  }
}

Cada elemento vale 20% para el completeness.`

    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`)
      .join('\n\n')

    const userPrompt = `Analiza esta conversación técnica:\n\n${conversationText}`

    try {
      const response = await this.callDeepSeek([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ])

      return JSON.parse(response) as TechPlanningAnalysis
    } catch (error) {
      console.error('Error analyzing tech planning with DeepSeek:', error)
      return this.fallbackTechAnalysis(messages)
    }
  }

  /**
   * Call DeepSeek API
   */
  private async callDeepSeek(messages: DeepSeekMessage[]): Promise<string> {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.1, // Low temperature for consistent analysis
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    const data = await response.json() as DeepSeekResponse
    return data.choices[0].message.content
  }

  /**
   * Fallback methods using the original regex-based analysis
   */
  private fallbackConceptAnalysis(messages: any[]): ConceptAnalysis {
    // Import and use the original ConversationAnalyzer as fallback
    const { ConversationAnalyzer } = require('./conversation-analyzer')
    return ConversationAnalyzer.analyzeConceptualization(messages)
  }

  private fallbackResearchAnalysis(messages: any[]): ResearchAnalysis {
    const { ConversationAnalyzer } = require('./conversation-analyzer')
    return ConversationAnalyzer.analyzeResearch(messages)
  }

  private fallbackTechAnalysis(messages: any[]): TechPlanningAnalysis {
    const { ConversationAnalyzer } = require('./conversation-analyzer')
    return ConversationAnalyzer.analyzeTechPlanning(messages)
  }
}

// Singleton instance
let analyzerInstance: DeepSeekAnalyzer | null = null

export function getDeepSeekAnalyzer(): DeepSeekAnalyzer {
  if (!analyzerInstance) {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY
    if (!apiKey) {
      throw new Error('DeepSeek API key not found in environment variables')
    }
    analyzerInstance = new DeepSeekAnalyzer(apiKey)
  }
  return analyzerInstance
}