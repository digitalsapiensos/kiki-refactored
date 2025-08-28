/**
 * Página principal (Landing) de Kiki
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/page.tsx
 */

import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { 
  Sparkles, 
  Users, 
  Rocket, 
  BookOpen, 
  Code2, 
  MessageSquare 
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: MessageSquare,
      title: "Asistentes IA Especializados",
      description: "Cinco expertos digitales que te guían paso a paso en cada fase del desarrollo"
    },
    {
      icon: Code2,
      title: "Metodología 'Vibe Coding'",
      description: "Construye primero, aprende después. Resultados rápidos sin complejidad innecesaria."
    },
    {
      icon: BookOpen,
      title: "Aprendizaje Just-in-Time",
      description: "Información precisa en el momento exacto que la necesitas, sin sobrecarga"
    },
    {
      icon: Users,
      title: "Accesible para Todos",
      description: "Democratizamos el desarrollo. Tu creatividad es más valiosa que tu experiencia técnica."
    },
    {
      icon: Rocket,
      title: "De la Idea al Prototipo",
      description: "Transformamos conceptos en prototipos funcionales con documentación profesional"
    },
    {
      icon: Sparkles,
      title: "IA Práctica",
      description: "Herramientas inteligentes que potencian tu creatividad sin complejidad técnica"
    }
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-yellow-400 py-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-mono font-heading text-black">
              KIKI
            </h1>
            <p className="text-xl md:text-2xl font-mono text-black max-w-3xl mx-auto">
              Tu compañero para crear aplicaciones profesionales usando metodología Vibe Coding.
              <br className="hidden md:block" />
              <span className="text-lg md:text-xl">Construye primero, perfecciona después.</span>
            </p>
            <div className="flex gap-4 justify-center pt-8">
              <Link href="/signup">
                <Button size="lg" variant="default">
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="neutral">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-blue-100">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-mono font-heading text-center mb-12 text-black">
            ¿Por qué KIKI y no otro tutorial de YouTube?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer bg-white"
              >
                <CardHeader className="border-b-2 border-black">
                  <feature.icon className="w-12 h-12 text-pink-500 mb-4" />
                  <CardTitle className="font-mono">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-700">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 bg-green-200">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-mono font-heading text-center mb-12 text-black">
            Tu viaje en 5 fases
          </h2>
          <div className="space-y-8">
            {[
              { phase: 1, name: "Conceptualización", assistant: "Peter", color: "bg-yellow-400", subtitle: "Define claramente tu visión y objetivos del proyecto" },
              { phase: 2, name: "Investigación", assistant: "Sara", color: "bg-blue-500", subtitle: "Análisis de mercado y validación de la propuesta" },
              { phase: 3, name: "Planificación Técnica", assistant: "Tony", color: "bg-green-500", subtitle: "Arquitectura y stack tecnológico optimizado" },
              { phase: 4, name: "Documentación", assistant: "Chris", color: "bg-orange-500", subtitle: "Especificaciones técnicas y guías de usuario" },
              { phase: 5, name: "Implementación", assistant: "Quentin", color: "bg-purple-500", subtitle: "Despliegue y puesta en producción" }
            ].map((step) => (
              <div 
                key={step.phase} 
                className="flex items-center gap-6 p-6 bg-white border-2 border-black shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none transition-all"
              >
                <div className={`${step.color} text-white font-mono font-heading text-2xl w-16 h-16 flex items-center justify-center border-2 border-black shadow-shadow`}>
                  {step.phase}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-mono font-bold mb-1">{step.name}</h3>
                  <p className="text-gray-600 text-sm">{step.subtitle}</p>
                  <p className="text-gray-500 text-xs mt-1">Asistido por {step.assistant}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-purple-500 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-mono font-heading mb-6">
            ¿Listo para crear tu próximo proyecto?
          </h2>
          <p className="text-xl font-mono mb-8">
            Únete a quienes han elegido la eficiencia sobre la complejidad innecesaria.
            <br className="hidden md:block" />
            <span className="text-lg opacity-80">La creatividad no requiere años de experiencia técnica.</span>
          </p>
          <Link href="/signup">
            <Button size="lg" variant="reverse" className="bg-yellow-400 text-black">
              Comenzar Mi Proyecto →
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}