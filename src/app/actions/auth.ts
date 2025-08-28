/**
 * Server actions para autenticación
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/actions/auth.ts
 */

'use server'

import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}