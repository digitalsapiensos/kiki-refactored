/**
 * Tarjeta de proyecto para el dashboard
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/components/ui/project-card.tsx
 */

// TODO: Importar componentes de shadcn/ui via Magic MCP
// TODO: Importar tipos de proyecto

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string
    phase: number
    created_at: string
    updated_at: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  // TODO: Calcular progreso del proyecto
  // TODO: Mostrar fase actual con icono

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        {/* TODO: Badge de fase */}
      </div>

      {/* Descripción */}
      <p className="text-gray-600 mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Progress */}
      <div className="mb-4">
        {/* TODO: Barra de progreso */}
        <div className="text-sm text-gray-500">
          Fase {project.phase} de 5
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {/* TODO: Formatear fecha */}
          Actualizado: {project.updated_at}
        </span>
        {/* TODO: Botón de continuar */}
        <button className="btn-secondary btn-sm">
          Continuar
        </button>
      </div>
    </div>
  )
}