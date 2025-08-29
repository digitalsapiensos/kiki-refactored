/**
 * API endpoint for managing system prompts (CRUD operations)
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/api/admin/system-prompts/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase/server'

async function checkSuperAdmin(supabase: any) {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'Not authenticated', status: 401 }
  }

  const { data: userData, error: profileError } = await supabase
    .from('kiki_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || userData?.role !== 'superadmin') {
    return { error: 'Access denied - superadmin required', status: 403 }
  }

  return { user, userData }
}

// GET /api/admin/system-prompts - List all prompts
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const authCheck = await checkSuperAdmin(supabase)
    
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { data: prompts, error } = await supabase
      .from('kiki_system_prompts')
      .select('*')
      .order('category, subcategory, prompt_key')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
    }

    return NextResponse.json({ prompts })

  } catch (error) {
    console.error('System prompts fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/system-prompts - Create new prompt
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const authCheck = await checkSuperAdmin(supabase)
    
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const body = await request.json()
    const { prompt_key, title, content, category, subcategory } = body

    if (!prompt_key || !title || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: prompt_key, title, content' 
      }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('kiki_system_prompts')
      .insert({
        prompt_key,
        title,
        content,
        category: category || 'custom',
        subcategory: subcategory || null,
        created_by: authCheck.user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to create prompt',
        details: error.message 
      }, { status: 500 })
    }

    // Create initial version
    await supabase
      .from('kiki_system_prompt_versions')
      .insert({
        prompt_id: data.id,
        version: 1,
        content,
        change_notes: 'Initial creation',
        created_by: authCheck.user.id
      })

    // Log admin action
    await supabase
      .from('kiki_admin_actions')
      .insert({
        admin_user_id: authCheck.user.id,
        action_type: 'prompt_create',
        resource_type: 'system_prompt',
        resource_id: data.id,
        action_data: { prompt_key, title }
      })

    return NextResponse.json({ 
      success: true, 
      prompt: data,
      message: 'Prompt created successfully' 
    })

  } catch (error) {
    console.error('System prompt creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}