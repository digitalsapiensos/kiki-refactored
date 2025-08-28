/**
 * API Route para manejar chat con IA
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/api/chat/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAIProvider, callProvider } from '../../../lib/ai/providers'
import type { Database } from '../../../lib/database.types'

// Configurar Supabase Admin Client
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    // Obtener datos del request
    const { projectId, phase, messages, modelOverride } = await request.json()

    // Validar datos requeridos
    if (!projectId || !phase || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Verificar autenticación del usuario
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verificar el token con Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    // Verificar que el usuario tenga acceso al proyecto
    const { data: project, error: projectError } = await supabaseAdmin
      .from('kiki_projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }

    // Obtener el proveedor de IA para la fase
    const provider = await getAIProvider(phase, modelOverride)
    
    if (!provider) {
      return NextResponse.json(
        { error: 'No hay proveedores de IA configurados' },
        { status: 500 }
      )
    }

    // Llamar al proveedor de IA
    const response = await callProvider(provider, messages, {
      temperature: 0.7,
      maxTokens: 2000
    })

    // Guardar el mensaje del usuario y la respuesta
    const batch = [
      {
        project_id: projectId,
        phase: phase,
        role: 'user' as const,
        content: messages[messages.length - 1].content,
        provider: provider.provider,
        model: provider.model
      },
      {
        project_id: projectId,
        phase: phase,
        role: 'assistant' as const,
        content: response,
        provider: provider.provider,
        model: provider.model
      }
    ]

    const { error: insertError } = await supabaseAdmin
      .from('kiki_chat_messages')
      .insert(batch)

    if (insertError) {
      console.error('Error guardando mensajes:', insertError)
    }

    // Actualizar el progreso del proyecto si es necesario
    const phaseKey = `phase_${phase}` as keyof Database['public']['Tables']['kiki_projects']['Row']['phase_data']
    const currentPhaseData = project.phase_data?.[phaseKey] || {}
    
    if (!currentPhaseData.completed_at) {
      // Marcar que hay actividad en la fase
      const updatedPhaseData = {
        ...project.phase_data,
        [phaseKey]: {
          ...currentPhaseData,
          last_activity: new Date().toISOString()
        }
      }

      await supabaseAdmin
        .from('kiki_projects')
        .update({ 
          phase_data: updatedPhaseData,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
    }

    // Devolver la respuesta
    return NextResponse.json({
      content: response,
      provider: provider.provider,
      model: provider.model
    })

  } catch (error) {
    console.error('Error en chat API:', error)
    return NextResponse.json(
      { error: 'Error procesando la solicitud' },
      { status: 500 }
    )
  }
}