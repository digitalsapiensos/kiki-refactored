/**
 * API endpoint for individual system prompt operations
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/api/admin/system-prompts/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../../../lib/supabase/server'
import { refreshPrompts } from '../../../../../lib/deepseek/database-prompt-loader'

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

// GET /api/admin/system-prompts/[id] - Get specific prompt
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const authCheck = await checkSuperAdmin(supabase)
    
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { data: prompt, error } = await supabase
      .from('kiki_system_prompts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // Get version history
    const { data: versions } = await supabase
      .from('kiki_system_prompt_versions')
      .select('*')
      .eq('prompt_id', params.id)
      .order('version', { ascending: false })

    return NextResponse.json({ 
      prompt,
      versions: versions || []
    })

  } catch (error) {
    console.error('System prompt fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/system-prompts/[id] - Update prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const authCheck = await checkSuperAdmin(supabase)
    
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const body = await request.json()
    const { title, content, change_notes } = body

    if (!content) {
      return NextResponse.json({ 
        error: 'Content is required' 
      }, { status: 400 })
    }

    // Get current prompt to check version
    const { data: currentPrompt, error: fetchError } = await supabase
      .from('kiki_system_prompts')
      .select('version, content')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // Check if content actually changed
    if (currentPrompt.content === content && !title) {
      return NextResponse.json({ 
        message: 'No changes detected',
        prompt: currentPrompt 
      })
    }

    const newVersion = currentPrompt.version + 1

    // Update the prompt
    const updateData: any = {
      version: newVersion,
      updated_at: new Date().toISOString()
    }
    
    if (title) updateData.title = title
    if (content !== currentPrompt.content) updateData.content = content

    const { data: updatedPrompt, error: updateError } = await supabase
      .from('kiki_system_prompts')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update prompt',
        details: updateError.message 
      }, { status: 500 })
    }

    // Create version entry if content changed
    if (content !== currentPrompt.content) {
      await supabase
        .from('kiki_system_prompt_versions')
        .insert({
          prompt_id: params.id,
          version: newVersion,
          content,
          change_notes: change_notes || 'Updated via admin panel',
          created_by: authCheck.user.id
        })
    }

    // Log admin action
    await supabase
      .from('kiki_admin_actions')
      .insert({
        admin_user_id: authCheck.user.id,
        action_type: 'prompt_update',
        resource_type: 'system_prompt',
        resource_id: params.id,
        action_data: { 
          version: newVersion,
          change_notes,
          title_changed: !!title,
          content_changed: content !== currentPrompt.content
        }
      })

    // Force refresh the prompts cache to update agents immediately
    try {
      await refreshPrompts()
      console.log('✅ Agent prompts cache refreshed after prompt update')
    } catch (refreshError) {
      console.warn('⚠️ Failed to refresh prompts cache:', refreshError)
      // Don't fail the request if cache refresh fails
    }

    return NextResponse.json({ 
      success: true, 
      prompt: updatedPrompt,
      message: 'Prompt updated successfully and agents refreshed',
      cache_refreshed: true
    })

  } catch (error) {
    console.error('System prompt update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/system-prompts/[id] - Delete prompt
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const authCheck = await checkSuperAdmin(supabase)
    
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    // Get prompt info for logging
    const { data: prompt } = await supabase
      .from('kiki_system_prompts')
      .select('prompt_key, title')
      .eq('id', params.id)
      .single()

    const { error } = await supabase
      .from('kiki_system_prompts')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to delete prompt',
        details: error.message 
      }, { status: 500 })
    }

    // Log admin action
    await supabase
      .from('kiki_admin_actions')
      .insert({
        admin_user_id: authCheck.user.id,
        action_type: 'prompt_delete',
        resource_type: 'system_prompt',
        resource_id: params.id,
        action_data: { 
          prompt_key: prompt?.prompt_key,
          title: prompt?.title
        }
      })

    return NextResponse.json({ 
      success: true,
      message: 'Prompt deleted successfully' 
    })

  } catch (error) {
    console.error('System prompt delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}