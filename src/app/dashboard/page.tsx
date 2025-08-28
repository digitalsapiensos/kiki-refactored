/**
 * Dashboard principal del usuario - NUEVO SISTEMA
 * Muestra proyectos del nuevo wizard (localStorage)
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/dashboard/page.tsx
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { 
  Plus, 
  Folder, 
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { LogoutButton } from '../../components/dashboard/logout-button'
import { getProjects, getUserStats, type KikiProject } from '../../lib/project-storage'

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<KikiProject[]>([])
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, completionRate: 0 })
  
  useEffect(() => {
    // Cargar proyectos desde localStorage
    const userProjects = getProjects()
    const userStats = getUserStats()
    setProjects(userProjects)
    setStats(userStats)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b-2 border-border shadow-shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-mono text-foreground">KIKI</h1>
              <span className="text-sm font-mono text-gray-600">Dashboard</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm">Usuario</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-main" />
                  Mi Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="font-mono font-bold">free</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Proyectos</p>
                  <p className="font-mono font-bold">
                    {stats.total} total
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completados</p>
                  <p className="font-mono font-bold">
                    {stats.completed} proyectos
                  </p>
                </div>
                <div className="space-y-2 pt-4">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start">
                      <Folder className="w-4 h-4 mr-2" />
                      Proyectos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Simple Welcome Section */}
            <div className="mb-8">
              <Card className="bg-yellow-400 border-2 border-black">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-mono font-bold mb-1">
                        ¡Bienvenido a KIKI! 
                      </h2>
                      <p className="text-sm text-black/70">
                        Crea proyectos profesionales siguiendo nuestro proceso guiado de 5 pasos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-mono font-bold">{projects?.length || 0}</p>
                      <p className="text-xs text-black/70">proyecto{(projects?.length || 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-retro">Mis Proyectos</h2>
                <Link href="/dashboard/projects/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Proyecto
                  </Button>
                </Link>
              </div>

              {projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((project) => (
                    <Card 
                      key={project.id} 
                      className="hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="font-mono">{project.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {project.description || 'Sin descripción'}
                            </CardDescription>
                          </div>
                          <div className={`
                            px-3 py-1 text-xs font-mono border-2 border-black
                            ${project.currentStep === 1 ? 'bg-yellow-400' : ''}
                            ${project.currentStep === 2 ? 'bg-blue-500' : ''}
                            ${project.currentStep === 3 ? 'bg-green-500' : ''}
                            ${project.currentStep === 4 ? 'bg-orange-500' : ''}
                            ${project.currentStep === 5 || project.isCompleted ? 'bg-purple-500' : ''}
                          `}>
                            {project.isCompleted ? 'Completo' : `Paso ${project.currentStep}`}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(project.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4" />
                              {Math.round((project.completedSteps.length / 5) * 100)}%
                            </span>
                          </div>
                          <Link 
                            href={`/new-wizard/${project.id}`}
                            className="text-primary hover:underline font-mono flex items-center gap-1"
                          >
                            {project.isCompleted ? 'Ver Proyecto' : 'Continuar'}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Folder className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-mono mb-2">No tienes proyectos aún</h3>
                    <p className="text-gray-600 mb-6">
                      Comienza tu primer proyecto con la metodología Vibe Coding
                    </p>
                    <Link href="/dashboard/projects/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Mi Primer Proyecto
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}