/**
 * API Route para gestión de proyectos
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/api/projects/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '../../../lib/supabase/server'

// GET - Obtener proyectos del usuario
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Obtener proyectos del usuario desde Supabase
    const { data: projects, error } = await supabase
      .from('kiki_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      projects: projects || []
    })
  } catch (error) {
    console.error('Error getting projects:', error)
    return NextResponse.json(
      { error: 'Error obteniendo proyectos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nombre del proyecto requerido' }, { status: 400 })
    }

    // Verificar si el usuario existe en kiki_users, si no, crearlo
    const { data: existingUser } = await supabase
      .from('kiki_users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingUser) {
      // Crear usuario en kiki_users si no existe usando service role
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      
      const { error: userError } = await supabaseAdmin
        .from('kiki_users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
        })

      if (userError && !userError.message.includes('duplicate key')) {
        console.error('Error creating kiki_user:', userError)
        return NextResponse.json({ error: 'Error configurando usuario' }, { status: 500 })
      }
    }

    // Verificar límites del plan del usuario
    const { data: userData } = await supabase
      .from('kiki_users')
      .select('project_limit')
      .eq('id', user.id)
      .single()

    const { count } = await supabase
      .from('kiki_projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (count && userData && count >= userData.project_limit) {
      return NextResponse.json({ 
        error: `Has alcanzado el límite de ${userData.project_limit} proyectos` 
      }, { status: 403 })
    }

    // Crear proyecto en Supabase
    const { data: project, error } = await supabase
      .from('kiki_projects')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        current_phase: 1,
        phase_data: {},
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: 'Error creando proyecto' }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Project creation error:', error)
    return NextResponse.json(
      { error: 'Error creando proyecto' },
      { status: 500 }
    )
  }
}