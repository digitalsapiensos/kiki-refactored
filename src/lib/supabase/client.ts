/**
 * Cliente de Supabase para el lado del cliente
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/lib/supabase/client.ts
 */

import { createBrowserClient } from '@supabase/ssr'

// TODO: Importar tipos de la base de datos

export function createClient() {
  // TODO: Obtener variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}