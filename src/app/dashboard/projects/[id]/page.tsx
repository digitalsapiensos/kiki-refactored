/**
 * Página del wizard del proyecto - Viaje de las 5 fases
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/dashboard/projects/[id]/page.tsx
 */

/**
 * NUEVO: Redirige a wizard dinámico sin AI chat
 * Página del wizard del proyecto - Nuevo sistema con prompts dinámicos
 */

import { redirect } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

export default function ProjectPage({ params }: PageProps) {
  // Redirigir al nuevo wizard dinámico
  redirect(`/new-wizard/${params.id}`)
}