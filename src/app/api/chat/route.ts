/**
 * API Route para manejar chat con IA - DeepSeek Integration
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/api/chat/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { agentManager } from '../../../lib/deepseek/agent-manager'
import { promptLoader } from '../../../lib/deepseek/prompt-loader'
import { fileGenerator } from '../../../lib/file-generation'
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
    const { projectId, phase, messages, agentId, userMessage } = await request.json()

    // Validar datos requeridos
    if (!projectId || !agentId || !userMessage) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: projectId, agentId, userMessage' },
        { status: 400 }
      )
    }

    // Verificar autenticación del usuario (opcional para desarrollo)
    const authHeader = request.headers.get('authorization')
    let user = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      
      // Verificar el token con Supabase
      const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token)
      
      if (!authError && authUser) {
        user = authUser
      }
    }

    // Verificar que el agente existe
    const agent = promptLoader.getAgent(agentId)
    if (!agent) {
      return NextResponse.json(
        { error: `Agente no encontrado: ${agentId}` },
        { status: 404 }
      )
    }

    // Generar respuesta del agente usando DeepSeek
    console.log(`🤖 Generating response for agent: ${agentId}`)
    
    const startTime = Date.now()
    const agentResponse = await agentManager.generateAgentResponse(
      agentId,
      userMessage,
      agentManager.getOrCreateContext(projectId, phase || agent.phase)
    )
    const responseTime = Date.now() - startTime
    
    // Calculate estimated cost (DeepSeek pricing: ~$0.14 per 1M input tokens, ~$0.28 per 1M output tokens)
    const estimatedCost = (
      (agentResponse.usage.prompt_tokens * 0.14) + 
      (agentResponse.usage.completion_tokens * 0.28)
    ) / 1000000

    // Guardar conversación en base de datos (si hay usuario autenticado)
    if (user) {
      try {
        // Verificar que el usuario tenga acceso al proyecto
        const { data: project, error: projectError } = await supabaseAdmin
          .from('kiki_projects')
          .select('*')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single()

        if (project && !projectError) {
          // Guardar el mensaje del usuario y la respuesta con nuevos campos
          const batch = [
            {
              project_id: projectId,
              phase: agent.phase,
              assistant_id: agentId,
              role: 'user' as const,
              content: userMessage,
              agent_type: 'professional',
              llm_provider: 'deepseek',
              tokens_used: 0, // User message doesn't consume tokens
              response_time_ms: 0,
              cost: 0.00,
              metadata: {}
            },
            {
              project_id: projectId,
              phase: agent.phase,
              assistant_id: agentId,
              role: 'assistant' as const,
              content: agentResponse.content,
              agent_type: 'professional',
              llm_provider: 'deepseek',
              tokens_used: agentResponse.usage?.total_tokens || 0,
              response_time_ms: responseTime,
              cost: estimatedCost,
              metadata: {
                usage: agentResponse.usage,
                shouldTransition: agentResponse.shouldTransition,
                nextAgentId: agentResponse.nextAgentId,
                prompt_tokens: agentResponse.usage?.prompt_tokens || 0,
                completion_tokens: agentResponse.usage?.completion_tokens || 0
              }
            }
          ]

          const { error: insertError } = await supabaseAdmin
            .from('kiki_chat_messages')
            .insert(batch)

          if (insertError) {
            console.warn('Error guardando mensajes:', insertError)
          }

          // Actualizar progreso del proyecto con nuevos campos
          const phaseKey = `phase_${agent.phase}`
          const currentPhaseData = project.phase_data?.[phaseKey] || {}
          
          const updatedPhaseData = {
            ...project.phase_data,
            [phaseKey]: {
              ...currentPhaseData,
              last_activity: new Date().toISOString(),
              messages_count: (currentPhaseData.messages_count || 0) + 2,
              current_agent: agentId
            }
          }

          // Update workflow data and costs
          const currentWorkflowData = project.workflow_data || {}
          const updatedWorkflowData = {
            ...currentWorkflowData,
            last_interaction: new Date().toISOString(),
            current_phase: agent.phase,
            total_messages: (currentWorkflowData.total_messages || 0) + 2
          }

          // Calculate updated costs
          const newConversationCost = (project.conversation_cost || 0) + estimatedCost
          const newTotalTokens = (project.total_tokens || 0) + (agentResponse.usage?.total_tokens || 0)

          // Create agent handoff history entry if agent changed
          let updatedHandoffHistory = project.agent_handoff_history || []
          if (project.current_agent && project.current_agent !== agentId) {
            updatedHandoffHistory = [
              ...updatedHandoffHistory,
              {
                from_agent: project.current_agent,
                to_agent: agentId,
                timestamp: new Date().toISOString(),
                phase: agent.phase,
                reason: 'user_interaction'
              }
            ]
          }

          await supabaseAdmin
            .from('kiki_projects')
            .update({ 
              phase_data: updatedPhaseData,
              workflow_data: updatedWorkflowData,
              current_agent: agentId,
              agent_handoff_history: updatedHandoffHistory,
              conversation_cost: newConversationCost,
              total_tokens: newTotalTokens,
              updated_at: new Date().toISOString(),
              current_phase: agent.phase
            })
            .eq('id', projectId)
        }
      } catch (dbError) {
        console.warn('Database operation failed, but continuing with response:', dbError)
      }
    }

    // ✅ REAL FILE GENERATION - Generate files from LLM response
    let generatedFiles: any[] = []
    let fileGenerationStats = null
    let fileGenerationWarnings: string[] = []

    try {
      console.log(`📁 Attempting to generate files for agent: ${agentId}`)
      
      const fileResult = await fileGenerator.generateAgentFiles(
        agentId,
        projectId,
        phase || agent.phase,
        agentResponse.content
      )

      generatedFiles = fileResult
      
      console.log(`✅ Generated ${generatedFiles.length} files for ${agentId}`)
      
      if (generatedFiles.length > 0) {
        generatedFiles.forEach(file => {
          console.log(`📄 Generated: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
        })
      }
      
    } catch (fileError) {
      console.error('File generation error (non-blocking):', fileError)
      fileGenerationWarnings.push(`File generation failed: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`)
    }

    // Devolver la respuesta del agente con archivos generados
    return NextResponse.json({
      content: agentResponse.content,
      agentId: agentResponse.agentId,
      shouldTransition: agentResponse.shouldTransition,
      nextAgentId: agentResponse.nextAgentId,
      filesToGenerate: agentResponse.filesToGenerate,
      usage: agentResponse.usage,
      provider: 'deepseek',
      model: 'deepseek-chat',
      // ✅ NEW: Real file generation results
      generatedFiles: generatedFiles.map(f => ({
        id: f.id,
        name: f.name,
        path: f.path,
        type: f.type,
        size: f.size,
        phase: f.phase
      })),
      fileGenerationStats,
      fileGenerationWarnings
    })

  } catch (error) {
    console.error('Error en chat API:', error)
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { 
        error: 'Error procesando la solicitud',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// GET endpoint for agent introductions and system info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const agentId = searchParams.get('agentId')
    const projectId = searchParams.get('projectId')

    if (action === 'introduction' && agentId) {
      // Get agent introduction
      const agent = promptLoader.getAgent(agentId)
      if (!agent) {
        return NextResponse.json(
          { error: `Agente no encontrado: ${agentId}` },
          { status: 404 }
        )
      }

      const introduction = await agentManager.getAgentIntroduction(
        agentId,
        agentManager.getOrCreateContext(projectId || 'temp', agent.phase)
      )

      return NextResponse.json({
        introduction,
        agent: {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          description: agent.description,
          phase: agent.phase,
          color: agent.color
        }
      })
    }

    if (action === 'agents') {
      // Get all available agents
      const agents = promptLoader.getAllAgents()
      return NextResponse.json({
        agents: agents.map(agent => ({
          id: agent.id,
          name: agent.name,
          role: agent.role,
          description: agent.description,
          phase: agent.phase,
          color: agent.color
        }))
      })
    }

    if (action === 'health') {
      // Health check
      const health = await agentManager.healthCheck()
      const usage = agentManager.getUsageStats()
      
      return NextResponse.json({
        status: health.status,
        agentCount: health.agentCount,
        deepSeekHealth: health.deepSeekStatus,
        usage: {
          totalRequests: usage.totalRequests,
          totalTokens: usage.totalTokens,
          estimatedCost: usage.estimatedCost,
          lastRequest: usage.lastRequest
        },
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json(
      { error: 'Action not supported. Use: introduction, agents, health' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error in GET /api/chat:', error)
    return NextResponse.json(
      { error: 'Error procesando la solicitud' },
      { status: 500 }
    )
  }
}