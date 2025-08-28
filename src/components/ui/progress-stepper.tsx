/**
 * Componente de progreso para mostrar las fases del wizard
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/components/ui/progress-stepper.tsx
 */

// TODO: Importar componentes de shadcn/ui via Magic MCP
// TODO: Importar iconos y estilos

interface Step {
  id: number
  name: string
  description: string
  completed: boolean
  current: boolean
}

interface ProgressStepperProps {
  steps: Step[]
  currentStep: number
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  // TODO: Lógica de navegación entre pasos
  // TODO: Estilos para estados (completado, actual, pendiente)

  return (
    <div className="w-full">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {/* TODO: Renderizar cada paso */}
          {steps.map((step, index) => (
            <li key={step.id} className="flex items-center">
              {/* TODO: Icono y línea conectora */}
              {/* TODO: Nombre del paso */}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}