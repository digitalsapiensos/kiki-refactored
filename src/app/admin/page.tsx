/**
 * Dashboard principal del panel de administración
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/admin/page.tsx
 */

// TODO: Importar componentes de estadísticas (StatCard, Chart)
// TODO: Importar hooks para datos de analytics

export default function AdminDashboard() {
  // TODO: Cargar estadísticas desde Supabase
  // TODO: Obtener métricas de uso

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Administrativo</h1>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* TODO: StatCard components */}
        <div className="stat-card">
          {/* Total usuarios */}
        </div>
        <div className="stat-card">
          {/* Proyectos activos */}
        </div>
        <div className="stat-card">
          {/* Documentos generados */}
        </div>
        <div className="stat-card">
          {/* Uso de IA */}
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          {/* TODO: Gráfico de uso por tiempo */}
        </div>
        <div className="chart-container">
          {/* TODO: Distribución de fases completadas */}
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        {/* TODO: Lista de actividades */}
      </div>
    </div>
  )
}