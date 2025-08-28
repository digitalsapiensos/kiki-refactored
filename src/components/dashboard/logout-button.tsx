/**
 * Botón de logout para el dashboard
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/components/dashboard/logout-button.tsx
 */

'use client'

import { Button } from '../ui/button'
import { LogOut } from 'lucide-react'
import { signOut } from '../../app/actions/auth'

export function LogoutButton() {
  return (
    <form action={signOut}>
      <Button variant="outline" size="sm" type="submit">
        <LogOut className="w-4 h-4 mr-2" />
        Salir
      </Button>
    </form>
  )
}