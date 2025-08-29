/**
 * API endpoint to refresh system prompts cache across all agents
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/api/admin/system-prompts/refresh/route.ts
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

// POST /api/admin/system-prompts/refresh - Force refresh of all agent prompts
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const authCheck = await checkSuperAdmin(supabase)
    
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    // Force refresh the prompts cache
    await refreshPrompts()

    // Log admin action
    await supabase
      .from('kiki_admin_actions')
      .insert({
        admin_user_id: authCheck.user.id,
        action_type: 'prompts_cache_refresh',
        resource_type: 'system_prompt',
        resource_id: 'all',
        action_data: {
          triggered_at: new Date().toISOString(),
          reason: 'Manual refresh from admin panel'
        }
      })

    return NextResponse.json({
      success: true,
      message: 'System prompts cache refreshed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('System prompts refresh error:', error)
    return NextResponse.json({ 
      error: 'Failed to refresh system prompts cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}