/**
 * API endpoint to load system prompts from filesystem into database
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/api/admin/system-prompts/load/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { promises as fs } from 'fs'
import * as path from 'path'

const SYSTEM_PROMPTS_PATH = '/Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/System Prompts'

const PROMPT_DEFINITIONS = [
  {
    prompt_key: 'extractor-conversacional',
    title: 'Extractor Conversacional',
    category: 'startup',
    subcategory: '01-inicio-proyecto',
    file_path: 'situaciones-usuario/01-inicio-proyecto/1-extractor-conversacional.md'
  },
  {
    prompt_key: 'formalizador-negocio',
    title: 'Formalizador de Negocio',
    category: 'startup',
    subcategory: '01-inicio-proyecto',
    file_path: 'situaciones-usuario/01-inicio-proyecto/2-formalizador-negocio.md'
  },
  {
    prompt_key: 'generador-masterplan',
    title: 'Generador de Master Plan',
    category: 'startup',
    subcategory: '01-inicio-proyecto',
    file_path: 'situaciones-usuario/01-inicio-proyecto/3-generador-masterplan.md'
  },
  {
    prompt_key: 'arquitecto-estructura',
    title: 'Arquitecto de Estructura',
    category: 'startup',
    subcategory: '01-inicio-proyecto',
    file_path: 'situaciones-usuario/01-inicio-proyecto/4-arquitecto-estructura.md'
  },
  {
    prompt_key: 'configurador-proyecto',
    title: 'Configurador de Proyecto',
    category: 'startup',
    subcategory: '01-inicio-proyecto',
    file_path: 'situaciones-usuario/01-inicio-proyecto/5-configurador-proyecto.md'
  }
]

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Check if user is superadmin
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: userData, error: profileError } = await supabase
      .from('kiki_users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || userData?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Access denied - superadmin required' }, { status: 403 })
    }

    const loadedPrompts = []
    const errors = []

    for (const promptDef of PROMPT_DEFINITIONS) {
      try {
        const fullPath = path.join(SYSTEM_PROMPTS_PATH, promptDef.file_path)
        const content = await fs.readFile(fullPath, 'utf-8')

        // Extract content from <system_prompt> tags if present
        let promptContent = content
        const systemPromptMatch = content.match(/<system_prompt>([\s\S]*?)<\/system_prompt>/)
        if (systemPromptMatch) {
          promptContent = systemPromptMatch[1].trim()
        }

        // Upsert the prompt
        const { data, error } = await supabase
          .from('kiki_system_prompts')
          .upsert({
            prompt_key: promptDef.prompt_key,
            title: promptDef.title,
            content: promptContent,
            category: promptDef.category,
            subcategory: promptDef.subcategory,
            file_path: promptDef.file_path,
            created_by: user.id
          }, {
            onConflict: 'prompt_key'
          })
          .select()
          .single()

        if (error) {
          errors.push({ prompt: promptDef.prompt_key, error: error.message })
        } else {
          // Create version entry
          await supabase
            .from('kiki_system_prompt_versions')
            .insert({
              prompt_id: data.id,
              version: data.version,
              content: promptContent,
              change_notes: 'Initial load from filesystem',
              created_by: user.id
            })

          loadedPrompts.push({
            prompt_key: promptDef.prompt_key,
            title: promptDef.title,
            content_length: promptContent.length
          })
        }
      } catch (fileError) {
        errors.push({ 
          prompt: promptDef.prompt_key, 
          error: `File read error: ${fileError instanceof Error ? fileError.message : 'Unknown error'}` 
        })
      }
    }

    // Log admin action
    await supabase
      .from('kiki_admin_actions')
      .insert({
        admin_user_id: user.id,
        action_type: 'system_prompts_bulk_load',
        resource_type: 'system_prompt',
        resource_id: 'bulk',
        action_data: {
          loaded_count: loadedPrompts.length,
          error_count: errors.length,
          loaded_prompts: loadedPrompts.map(p => p.prompt_key),
          errors: errors
        }
      })

    return NextResponse.json({
      success: true,
      loaded: loadedPrompts,
      errors: errors,
      message: `Loaded ${loadedPrompts.length} prompts${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
    })

  } catch (error) {
    console.error('System prompts load error:', error)
    return NextResponse.json({ 
      error: 'Failed to load system prompts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}