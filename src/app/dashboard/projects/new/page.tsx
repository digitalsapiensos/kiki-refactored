/**
 * Página para crear un nuevo proyecto
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/dashboard/projects/new/page.tsx
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { Textarea } from '../../../../components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card'
import toast from 'react-hot-toast'
import { ArrowLeft, Rocket, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { createProject } from '../../../../lib/project-storage'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectName.trim()) {
      toast.error('El nombre del proyecto es requerido')
      return
    }

    setLoading(true)

    try {
      // Crear proyecto en localStorage (nuevo sistema)
      const project = createProject(projectName, projectDescription)
      
      toast.success('¡Proyecto creado exitosamente!')
      
      // Redirigir al nuevo wizard dinámico
      router.push(`/new-wizard/${project.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear el proyecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-green-500">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-white hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-mono">Volver al Dashboard</span>
          </Link>
        </div>

        {/* Main Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center space-y-2">
            <div className="w-20 h-20 bg-yellow-400 border-2 border-border shadow-shadow mx-auto flex items-center justify-center mb-4">
              <Rocket className="w-10 h-10" />
            </div>
            <CardTitle className="text-3xl font-mono">NUEVO PROYECTO</CardTitle>
            <CardDescription className="text-lg">
              Comienza tu aventura con Vibe Coding
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleCreateProject}>
            <CardContent className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-lg font-mono">
                  Nombre del Proyecto *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Mi Proyecto Increíble"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  disabled={loading}
                  className="text-lg"
                  maxLength={100}
                />
                <p className="text-sm text-gray-600">
                  Un nombre memorable para tu proyecto
                </p>
              </div>

              {/* Project Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-lg font-mono">
                  Descripción (Opcional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="¿De qué trata tu proyecto? ¿Qué problema resuelve?"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  disabled={loading}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-gray-600">
                  {projectDescription.length}/500 caracteres
                </p>
              </div>

              {/* Info Box */}
              <Card className="bg-green-100 border-2 border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    ¿Qué pasará después?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>1. <strong>Paso 1:</strong> Conversación de negocio guiada para clarificar tu idea</p>
                  <p>2. <strong>Paso 2-3:</strong> Documentación de negocio y master plan técnico</p>
                  <p>3. <strong>Paso 4-5:</strong> Estructura completa del proyecto y configuración</p>
                  <p>4. <strong>Resultado:</strong> Proyecto listo para programar con toda la documentación</p>
                </CardContent>
              </Card>
            </CardContent>

            <CardFooter className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !projectName.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Crear Proyecto
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}