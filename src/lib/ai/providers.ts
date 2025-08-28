/**
 * Configuración y gestión de proveedores de IA
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/lib/ai/providers.ts
 */

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AIProvider {
  id: string
  name: string
  models: string[]
  chat: (messages: ChatMessage[], options?: { model?: string; temperature?: number; maxTokens?: number }) => Promise<string>
  validateConfig: () => boolean
  isConfigured: () => boolean
}

// Claude (Anthropic)
export const claudeProvider: AIProvider = {
  id: 'claude',
  name: 'Anthropic Claude',
  models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  
  validateConfig: () => {
    return !!process.env.CLAUDE_API_KEY
  },
  
  isConfigured: () => {
    return !!process.env.CLAUDE_API_KEY
  },
  
  chat: async (messages, options = {}) => {
    const apiKey = process.env.CLAUDE_API_KEY
    if (!apiKey) throw new Error('CLAUDE_API_KEY no configurada')
    
    const anthropic = new Anthropic({ apiKey })
    
    // Convertir mensajes al formato de Claude
    const systemMessage = messages.find(m => m.role === 'system')?.content || ''
    const claudeMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    
    const response = await anthropic.messages.create({
      model: options.model || 'claude-3-sonnet-20240229',
      max_tokens: options.maxTokens || 4096,
      system: systemMessage,
      messages: claudeMessages,
      temperature: options.temperature || 0.7
    })
    
    return response.content[0].type === 'text' ? response.content[0].text : ''
  }
}

// OpenAI
export const openaiProvider: AIProvider = {
  id: 'openai',
  name: 'OpenAI',
  models: ['gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  
  validateConfig: () => {
    return !!process.env.OPENAI_API_KEY
  },
  
  isConfigured: () => {
    return !!process.env.OPENAI_API_KEY
  },
  
  chat: async (messages, options = {}) => {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error('OPENAI_API_KEY no configurada')
    
    const openai = new OpenAI({ apiKey })
    
    const response = await openai.chat.completions.create({
      model: options.model || 'gpt-4-turbo',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096
    })
    
    return response.choices[0]?.message?.content || ''
  }
}

// Google Gemini
export const geminiProvider: AIProvider = {
  id: 'gemini',
  name: 'Google Gemini',
  models: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  
  validateConfig: () => {
    return !!process.env.GEMINI_API_KEY
  },
  
  isConfigured: () => {
    return !!process.env.GEMINI_API_KEY
  },
  
  chat: async (messages, options = {}) => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY no configurada')
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const geminiModel = genAI.getGenerativeModel({ model: options.model || 'gemini-pro' })
    
    // Convertir mensajes al formato de Gemini
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))
    
    const lastMessage = messages[messages.length - 1]
    const chat = geminiModel.startChat({ history })
    
    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    
    return response.text()
  }
}

// DeepSeek
export const deepseekProvider: AIProvider = {
  id: 'deepseek',
  name: 'DeepSeek',
  models: ['deepseek-chat', 'deepseek-coder'],
  
  validateConfig: () => {
    return !!process.env.DEEPSEEK_API_KEY
  },
  
  isConfigured: () => {
    return !!process.env.DEEPSEEK_API_KEY
  },
  
  chat: async (messages, options = {}) => {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY no configurada')
    
    // DeepSeek usa la API compatible con OpenAI
    const deepseek = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com'
    })
    
    const response = await deepseek.chat.completions.create({
      model: options.model || 'deepseek-chat',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096
    })
    
    return response.choices[0]?.message?.content || ''
  }
}

// Qwen (por ahora deshabilitado, se puede implementar más adelante)
export const qwenProvider: AIProvider = {
  id: 'qwen',
  name: 'Qwen',
  models: ['qwen-turbo', 'qwen-plus'],
  
  validateConfig: () => {
    return false // Deshabilitado por ahora
  },
  
  isConfigured: () => {
    return false // Deshabilitado por ahora
  },
  
  chat: async (messages, options = {}) => {
    throw new Error('Proveedor Qwen no implementado aún')
  }
}

// Registro de proveedores
export const providers = {
  claude: claudeProvider,
  openai: openaiProvider,
  gemini: geminiProvider,
  deepseek: deepseekProvider,
  qwen: qwenProvider
}

// Función para obtener proveedor por ID
export function getProviderById(id: string): AIProvider | null {
  return providers[id as keyof typeof providers] || null
}

// Función para obtener proveedores disponibles (configurados)
export function getAvailableProviders(): AIProvider[] {
  return Object.values(providers).filter(provider => provider.validateConfig())
}

// Función para obtener el mejor proveedor para una fase
export function getProviderForPhase(phase: number): AIProvider | null {
  // Preferencias por fase (puedes personalizar esto)
  const phasePreferences: Record<number, string[]> = {
    1: ['deepseek', 'claude', 'openai', 'gemini'], // Conceptualización: DeepSeek como primera opción
    2: ['deepseek', 'openai', 'gemini', 'claude'], // Research: DeepSeek como primera opción
    3: ['deepseek', 'openai', 'claude'], // Técnico: DeepSeek es bueno para código
    4: ['deepseek', 'claude', 'openai', 'gemini'], // Documentación: DeepSeek como primera opción
    5: ['deepseek', 'openai', 'claude', 'gemini']  // Exportación: DeepSeek como primera opción
  }
  
  const preferences = phasePreferences[phase] || ['claude', 'openai', 'gemini']
  
  // Buscar el primer proveedor disponible según las preferencias
  for (const providerId of preferences) {
    const provider = getProviderById(providerId)
    if (provider && provider.validateConfig()) {
      return provider
    }
  }
  
  // Si no hay ninguno preferido disponible, devolver cualquiera que esté configurado
  return getAvailableProviders()[0] || null
}

// Preferencias de proveedores por fase
const phasePreferences: Record<number, string[]> = {
  1: ['deepseek', 'claude', 'openai', 'gemini'], // Conceptualización
  2: ['deepseek', 'openai', 'gemini', 'claude'], // Research
  3: ['deepseek', 'openai', 'claude'], // Técnico
  4: ['deepseek', 'claude', 'openai', 'gemini'], // Documentación
  5: ['deepseek', 'openai', 'claude', 'gemini']  // Exportación
}

// Función para obtener el proveedor preferido por fase
export function getProvider(phase: number): string {
  const preferences = phasePreferences[phase] || phasePreferences[1]
  
  // Verificar disponibilidad de proveedores en orden de preferencia
  for (const provider of preferences) {
    if (providers[provider as keyof typeof providers] && providers[provider as keyof typeof providers].isConfigured()) {
      return provider
    }
  }
  
  // Fallback a cualquier proveedor disponible
  for (const [key, provider] of Object.entries(providers)) {
    if (provider.isConfigured()) {
      return key
    }
  }
  
  throw new Error('No hay proveedores de IA configurados')
}

// Función para obtener datos del proveedor de IA
export async function getAIProvider(phase: number, modelOverride?: string) {
  const providerName = getProvider(phase)
  const provider = providers[providerName as keyof typeof providers]
  
  return {
    provider: providerName,
    model: modelOverride || provider.models[0],
    instance: provider
  }
}

// Función para llamar a un proveedor con fallback automático
export async function callProvider(
  provider: { provider: string; model: string; instance: AIProvider },
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
) {
  const { instance, model } = provider
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await instance.chat(messages as ChatMessage[], {
        model,
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 2000
      })
      
      return response
    } catch (error) {
      lastError = error as Error
      console.warn(`Provider ${provider.provider} attempt ${attempt} failed:`, error)
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
  
  throw new Error(`Provider ${provider.provider} failed after ${maxRetries} attempts: ${lastError?.message}`)
}

// Función para llamar con fallback automático a otros proveedores
export async function callProviderWithFallback(
  phase: number,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
) {
  const preferences = phasePreferences[phase] || phasePreferences[1]
  
  for (const providerName of preferences) {
    try {
      const provider = await getAIProvider(phase, undefined)
      if (provider.provider === providerName) {
        return await callProvider(provider, messages, options)
      }
    } catch (error) {
      console.warn(`Fallback: Provider ${providerName} failed, trying next...`, error)
      continue
    }
  }
  
  throw new Error('All AI providers failed')
}