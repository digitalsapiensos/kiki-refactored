/**
 * Hook para acceder al cliente de Supabase
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/hooks/use-supabase.ts
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

export function useSupabase() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return {
    supabase,
    session,
    loading
  }
}