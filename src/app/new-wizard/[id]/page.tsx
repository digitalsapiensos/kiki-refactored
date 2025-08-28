/**
 * Nuevo wizard dinámico para proyectos específicos
 * Reemplaza el sistema anterior de chat con AI
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PromptStepCard from '../../../components/wizard/PromptStepCard'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Progress } from '../../../components/ui/progress'
import { getProject, completeProjectStep } from '../../../lib/project-storage'

interface PageProps {
  params: { id: string }
}

export default function ProjectWizardPage({ params }: PageProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Record<number, {url: string, notes?: string}>>({})
  const [promptData, setPromptData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [projectName] = useState('Mi Proyecto')

  // Cargar prompt data del API
  useEffect(() => {
    const loadPromptData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/prompts/${currentStep}`)
        if (!response.ok) throw new Error('Failed to load prompt')
        const data = await response.json()
        setPromptData(data)
      } catch (error) {
        console.error('Error loading prompt:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadPromptData()
  }, [currentStep])

  const handleStepComplete = (stepNumber: number, url: string, notes?: string) => {
    // Actualizar estado local
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: { url, notes }
    }))
    
    // Guardar en localStorage
    completeProjectStep(params.id, stepNumber, url, notes)
    
    // Automáticamente avanzar al siguiente paso
    if (stepNumber < 5) {
      setCurrentStep(stepNumber + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (Object.keys(completedSteps).length / 5) * 100
  const stepTitles = ['Conversación de Negocio', 'Formalización de Negocio', 'Master Plan Técnico', 'Estructura del Proyecto', 'Configuración Operativa']

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-mono">Cargando system prompt...</p>
        </div>
      </div>
    )
  }

  if (!promptData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <p className="font-mono text-red-600 mb-4">Error cargando prompt</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b-2 border-border shadow-shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-mono">Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-mono font-bold">{projectName}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-gray-600">
                Paso {currentStep} de 5
              </span>
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePreviousStep}
                  className="font-mono"
                >
                  ← Anterior
                </Button>
              )}
              {currentStep < 5 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="font-mono"
                >
                  Siguiente →
                </Button>
              )}
              
              {/* Step selector dropdown */}
              <select 
                value={currentStep}
                onChange={(e) => setCurrentStep(parseInt(e.target.value))}
                className="ml-2 px-2 py-1 border-2 border-black font-mono text-sm"
              >
                <option value={1}>Paso 1</option>
                <option value={2}>Paso 2</option>
                <option value={3}>Paso 3</option>
                <option value={4}>Paso 4</option>
                <option value={5}>Paso 5</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b-2 border-black">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm font-mono text-gray-600">{Math.round(progress)}% completado</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Dynamic Prompt Card */}
        <PromptStepCard
          stepNumber={promptData.step}
          title={promptData.title}
          role={promptData.role}
          description={promptData.description}
          systemPrompt={promptData.systemPrompt}
          instructions={promptData.instructions.join('\n')}
          aiRecommendation={promptData.aiRecommendation}
          expectedOutput={promptData.expectedOutput}
          pedagogicalExplanation={promptData.pedagogicalExplanation}
          onComplete={(url, notes) => handleStepComplete(currentStep, url, notes)}
          isCompleted={!!completedSteps[currentStep]}
          conversationUrl={completedSteps[currentStep]?.url || ''}
        />

        {/* Progress Summary */}
        {Object.keys(completedSteps).length > 0 && (
          <div className="mt-8 p-6 bg-green-100 border-2 border-green-500">
            <h3 className="font-mono font-bold text-green-800 mb-4">
              🎯 Progreso del Proyecto
            </h3>
            <div className="space-y-2">
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1
                return (
                  <div key={stepNumber} className="flex items-center gap-3">
                    {completedSteps[stepNumber] ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-mono text-sm">
                          Paso {stepNumber}: {title} ✓
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                        <span className="font-mono text-sm text-gray-500">
                          Paso {stepNumber}: {title}
                        </span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Completion Message */}
        {Object.keys(completedSteps).length === 5 && (
          <div className="mt-8 p-8 bg-yellow-400 border-2 border-black text-center">
            <h2 className="text-2xl font-mono font-bold mb-4">
              🎉 ¡PROYECTO COMPLETO!
            </h2>
            <p className="font-mono mb-6">
              Has completado los 5 pasos. Tu proyecto está listo para development.
            </p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-green-500 text-white border-2 border-black font-mono"
            >
              Volver al Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}