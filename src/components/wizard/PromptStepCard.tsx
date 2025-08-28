/**
 * Componente para mostrar un step del wizard con system prompt
 * Reemplaza el chat AI con copy-to-clipboard y URL tracking
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  FileText,
  Bot,
  Clipboard,
  Code2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PromptStepCardProps {
  stepNumber: number
  title: string
  role: string
  description: string
  systemPrompt: string
  instructions: string
  aiRecommendation: string
  expectedOutput: string
  pedagogicalExplanation?: string
  onComplete: (conversationUrl: string, notes?: string) => void
  isCompleted?: boolean
  conversationUrl?: string
}

export default function PromptStepCard({
  stepNumber,
  title,
  role,
  description,
  systemPrompt,
  instructions,
  aiRecommendation,
  expectedOutput,
  pedagogicalExplanation,
  onComplete,
  isCompleted = false,
  conversationUrl = ''
}: PromptStepCardProps) {
  const [url, setUrl] = useState(conversationUrl)
  const [notes, setNotes] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(systemPrompt)
      toast.success('System prompt copiado al clipboard!')
      setShowPrompt(true)
    } catch (error) {
      toast.error('Error al copiar. Usa el botón de selección manual.')
    }
  }

  const handleSubmit = () => {
    if (!url.trim()) {
      toast.error('Por favor ingresa la URL de tu conversación')
      return
    }

    onComplete(url.trim(), notes.trim())
  }

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-400 border-2 border-black flex items-center justify-center font-mono font-bold text-xl">
          {stepNumber}
        </div>
        <div>
          <h2 className="text-2xl font-mono font-bold">{title}</h2>
          <p className="text-sm text-gray-600">📝 {role}</p>
        </div>
        {isCompleted && (
          <CheckCircle className="w-6 h-6 text-green-600 ml-auto" />
        )}
      </div>

      {/* Instructions FIRST - More engaging */}
      <Card className="border-2 border-black bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-mono">🎯 Objetivo de Esta Fase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-100 border-2 border-yellow-600">
            <div className="prose prose-sm max-w-none">
              <div 
                className="text-sm text-yellow-800"
                dangerouslySetInnerHTML={{ 
                  __html: pedagogicalExplanation?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') || 'Cargando explicación...'
                }}
              />
            </div>
          </div>

          <div>
            <h4 className="font-mono font-bold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Cómo Funciona Este Paso:
            </h4>
            <div className="space-y-2">
              {instructions.split('\n').map((line, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="w-8 h-8 bg-green-500 border-2 border-black flex items-center justify-center text-sm font-mono font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm font-mono leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm p-3 bg-blue-100 border-2 border-blue-500">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <span><strong>Recomendado:</strong> {aiRecommendation}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600" />
              <span><strong>Resultado:</strong> {expectedOutput}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt Display - Now AFTER instructions */}
      <Card className="border-2 border-black">
        <CardHeader className="border-b-2 border-black">
          <CardTitle className="flex items-center gap-2 font-mono">
            <Clipboard className="w-5 h-5" />
            System Prompt Profesional
          </CardTitle>
          <CardDescription>
            Este es el prompt enterprise-grade que usarás en {aiRecommendation}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!showPrompt ? (
            <div className="p-6 text-center">
              <Button 
                onClick={handleCopyPrompt}
                className="bg-yellow-400 text-black border-2 border-black hover:bg-yellow-500"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar System Prompt
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                El prompt se copiará automáticamente al clipboard
              </p>
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-gray-50 p-4 text-sm overflow-x-auto whitespace-pre-wrap font-mono border-t-2 border-black max-h-60 overflow-y-auto">
                {systemPrompt}
              </pre>
              <Button
                onClick={handleCopyPrompt}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* URL Collection or IDE Notice */}
      {stepNumber <= 3 ? (
        <Card className="border-2 border-black">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Tracking de Conversación
            </CardTitle>
            <CardDescription>
              Pega aquí la URL de tu conversación para hacer tracking del progreso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="font-mono">
                URL de la Conversación *
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="Ej: https://chat.openai.com/c/abc123 o https://claude.ai/chat/xyz789"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isCompleted}
                className="font-mono text-sm"
              />
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="bg-green-600 text-white px-2 py-1 border border-black">ChatGPT</span>
                <span className="bg-amber-600 text-white px-2 py-1 border border-black">Claude</span>  
                <span className="bg-indigo-600 text-white px-2 py-1 border border-black">Perplexity</span>
                <span className="bg-blue-500 text-white px-2 py-1 border border-black">Gemini</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-mono">
                Notas (Opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Ej: 'El usuario quiere enfoque en mobile-first' o 'Mencionó integración con Stripe'"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                disabled={isCompleted}
                className="text-sm"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!url.trim() || isCompleted}
              className="w-full bg-yellow-400 text-black border-2 border-black hover:bg-yellow-500 font-mono"
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Paso Completado
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Marcar como Completado
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-black bg-purple-50">
          <CardHeader>
            <CardTitle className="font-mono flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Trabajo en IDE
            </CardTitle>
            <CardDescription>
              Este paso se realiza directamente en tu IDE favorito (VS Code, Cursor, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-purple-100 border-2 border-purple-500">
              <p className="font-mono font-bold text-purple-800 mb-2">
                💻 Cambio de Entorno
              </p>
              <p className="text-sm text-purple-700">
                {stepNumber === 4 && "Ahora trabajarás en tu IDE para crear la estructura completa del proyecto con carpetas y archivos."}
                {stepNumber === 5 && "Configurarás el sistema operativo del proyecto con BACKLOG.md, STATUS_LOG.md y procedimientos operativos."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-mono">
                Notas de Implementación
              </Label>
              <Textarea
                id="notes"
                placeholder={stepNumber === 4 ? "Ej: 'Generé estructura monorepo con apps/ y packages/'" : "Ej: 'Configuré BACKLOG.md con 3 EPICs y STATUS_LOG.md'"}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                disabled={isCompleted}
                className="text-sm"
              />
            </div>

            <Button
              onClick={() => onComplete('IDE-WORK-COMPLETED', notes.trim())}
              disabled={isCompleted}
              className="w-full bg-purple-500 text-white border-2 border-black hover:bg-purple-600 font-mono"
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Trabajo en IDE Completado
                </>
              ) : (
                <>
                  <Code2 className="w-4 h-4 mr-2" />
                  Marcar IDE Work como Completado
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}