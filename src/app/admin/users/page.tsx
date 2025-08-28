/**
 * Gestión de usuarios - Panel administrativo
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/admin/users/page.tsx
 */

// TODO: Importar componentes de tabla y filtros
// TODO: Importar hooks para gestión de usuarios

export default function AdminUsersPage() {
  // TODO: Cargar lista de usuarios con paginación
  // TODO: Implementar filtros y búsqueda
  // TODO: Gestión de límites y planes

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        {/* TODO: Botón para invitar usuario */}
        <button className="btn-primary">
          Invitar Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="filters mb-6">
        {/* TODO: Filtros por plan, estado, fecha */}
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow">
        {/* TODO: DataTable component */}
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Usuario</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Plan</th>
              <th className="p-4 text-left">Proyectos</th>
              <th className="p-4 text-left">Registro</th>
              <th className="p-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Filas de usuarios */}
          </tbody>
        </table>
      </div>

      {/* TODO: Paginación */}
    </div>
  )
}