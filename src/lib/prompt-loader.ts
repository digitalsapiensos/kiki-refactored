/**
 * Utility para cargar system prompts dinámicamente desde archivos markdown
 * Single source of truth - editas el .md, se actualiza automáticamente en el wizard
 */

import * as fs from 'fs'
import * as path from 'path'

interface SystemPromptData {
  title: string
  role: string
  description: string
  aiRecommendation: string
  expectedOutput: string
  instructions: string
  systemPrompt: string
}

// Path base a los system prompts
const PROMPTS_BASE_PATH = '/Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/System Prompts/situaciones-usuario/01-inicio-proyecto'

// Configuración de cada step
const STEP_CONFIG = {
  1: {
    fileName: '1-extractor-conversacional.md',
    title: 'Conversación de Negocio',
    role: 'Consultor virtual',
    description: 'Extraemos y clarificamos tu idea mediante preguntas guiadas estructuradas',
    aiRecommendation: 'ChatGPT o Claude',
    expectedOutput: 'conversation_summary.md',
    instructions: `Copia el system prompt completo
Ve a ChatGPT o Claude (recomendado para este paso)
Pega el prompt en una nueva conversación
Comparte tu idea de aplicación cuando te lo pida
Sigue la conversación hasta generar conversation_summary.md
Vuelve aquí y pega la URL de tu conversación`
  },
  2: {
    fileName: '2-formalizador-negocio.md',
    title: 'Formalización de Negocio',
    role: 'Business Analyst',
    description: 'Transformamos la conversación en documentos estructurados de negocio',
    aiRecommendation: 'Claude (análisis profundo)',
    expectedOutput: '3 documentos de negocio formales',
    instructions: `Copia el system prompt del Paso 2
Usa Claude (recomendado para análisis profundo)
Pega el conversation_summary.md del paso anterior
Sigue las instrucciones para generar los 3 documentos
Guarda los archivos generados
Vuelve aquí y pega la URL de tu conversación`
  },
  3: {
    fileName: '3-generador-masterplan.md',
    title: 'Master Plan Técnico',
    role: 'Arquitecto Senior',
    description: 'Creamos hoja de ruta completa con stack tecnológico y arquitectura',
    aiRecommendation: 'Claude o Perplexity',
    expectedOutput: 'masterplan.md completo',
    instructions: `Copia el system prompt del Paso 3
Usa Claude o Perplexity para análisis técnico
Proporciona los 3 documentos del paso anterior
Genera el masterplan.md técnico completo
Guarda el archivo masterplan.md
Vuelve aquí y pega la URL de tu conversación`
  },
  4: {
    fileName: '4-arquitecto-estructura.md',
    title: 'Estructura del Proyecto',
    role: 'Arquitecto de Estructura',
    description: 'Generamos andamiaje completo con carpetas y archivos stub organizados',
    aiRecommendation: 'Claude Code (IDE)',
    expectedOutput: 'Proyecto estructurado',
    instructions: `Copia el system prompt del Paso 4
CAMBIO: Usa Claude Code en tu IDE favorito
Proporciona el masterplan.md del paso anterior
Genera la estructura completa del proyecto
Crea carpetas, archivos stub y documentación
Vuelve aquí y pega la URL de tu conversación`
  },
  5: {
    fileName: '5-configurador-proyecto.md',
    title: 'Configuración Operativa',
    role: 'Project Operations',
    description: 'Configuramos backlog, tracking y sistema operativo del proyecto',
    aiRecommendation: 'Claude Code (IDE)',
    expectedOutput: 'Proyecto listo para development',
    instructions: `Copia el system prompt del Paso 5 (FINAL)
Usa Claude Code en tu IDE 
Proporciona la estructura del paso anterior
Genera BACKLOG.md, STATUS_LOG.md, configuraciones
Configura el sistema operativo del proyecto
Tu proyecto estará 100% listo para development`
  }
}

/**
 * Carga el system prompt para un step específico
 */
export function getSystemPromptForStep(stepNumber: number): SystemPromptData {
  const config = STEP_CONFIG[stepNumber as keyof typeof STEP_CONFIG]
  
  if (!config) {
    throw new Error(`Step ${stepNumber} not found`)
  }

  try {
    // Leer el archivo markdown
    const filePath = path.join(PROMPTS_BASE_PATH, config.fileName)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    // Extraer el contenido entre <system_prompt> tags
    const systemPromptMatch = fileContent.match(/<system_prompt>([\s\S]*?)<\/system_prompt>/)
    const systemPrompt = systemPromptMatch ? systemPromptMatch[1].trim() : fileContent
    
    return {
      title: config.title,
      role: config.role,
      description: config.description,
      aiRecommendation: config.aiRecommendation,
      expectedOutput: config.expectedOutput,
      instructions: config.instructions,
      systemPrompt: systemPrompt
    }
  } catch (error) {
    console.error(`Error loading prompt for step ${stepNumber}:`, error)
    throw new Error(`Could not load system prompt for step ${stepNumber}`)
  }
}

/**
 * Carga todos los prompts de una vez (para pre-loading)
 */
export function getAllSystemPrompts(): Record<number, SystemPromptData> {
  const prompts: Record<number, SystemPromptData> = {}
  
  for (let i = 1; i <= 5; i++) {
    prompts[i] = getSystemPromptForStep(i)
  }
  
  return prompts
}

/**
 * Valida que todos los archivos de prompts existen
 */
export function validatePromptFiles(): { valid: boolean, errors: string[] } {
  const errors: string[] = []
  
  for (let i = 1; i <= 5; i++) {
    const config = STEP_CONFIG[i as keyof typeof STEP_CONFIG]
    const filePath = path.join(PROMPTS_BASE_PATH, config.fileName)
    
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing prompt file: ${config.fileName}`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}