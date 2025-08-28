/**
 * Cliente de AI para llamadas desde el frontend
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/lib/ai/client.ts
 */

'use client'

import { createClient } from '../supabase/client'

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CallAIOptions {
  messages: AIMessage[]
  phase: number
  projectId?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export async function callAI({
  messages,
  phase,
  projectId,
  model,
  temperature = 0.7,
  maxTokens = 2000
}: CallAIOptions): Promise<string> {
  try {
    // Obtener el token de autenticación
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('No hay sesión activa')
    }

    // Si no hay projectId, obtener el proyecto actual o usar uno temporal
    const finalProjectId = projectId || await getCurrentProjectId() || 'temp-project'

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        projectId: finalProjectId,
        phase,
        messages,
        modelOverride: model,
        temperature,
        maxTokens
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `Error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error('Error calling AI:', error)
    throw error
  }
}

// Función auxiliar para obtener el ID del proyecto actual
async function getCurrentProjectId(): Promise<string | null> {
  // Intentar obtener el projectId de la URL
  if (typeof window !== 'undefined') {
    const pathParts = window.location.pathname.split('/')
    const projectIndex = pathParts.indexOf('projects')
    if (projectIndex !== -1 && pathParts[projectIndex + 1]) {
      return pathParts[projectIndex + 1]
    }
  }
  return null
}