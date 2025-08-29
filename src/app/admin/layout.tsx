/**
 * Layout del panel de administración
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/admin/layout.tsx
 */

// TODO: Importar componentes de navegación admin
// TODO: Importar verificación de rol admin

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Verificar autenticación y rol admin
  // TODO: Redirigir si no es admin

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">Kiki Admin</h2>
          <nav className="space-y-2">
            <a href="/admin" className="block p-2 hover:bg-gray-800 rounded">
              📊 Dashboard
            </a>
            <a href="/admin/prompts" className="block p-2 hover:bg-gray-800 rounded bg-gray-800">
              🤖 System Prompts
            </a>
            <a href="/admin/users" className="block p-2 hover:bg-gray-800 rounded">
              👥 Usuarios
            </a>
            <a href="/admin/projects" className="block p-2 hover:bg-gray-800 rounded">
              📁 Proyectos
            </a>
            <a href="/admin/llm-config" className="block p-2 hover:bg-gray-800 rounded">
              ⚙️ Configuración LLM
            </a>
            <a href="/admin/analytics" className="block p-2 hover:bg-gray-800 rounded">
              📈 Analytics
            </a>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm border-b">
          <div className="px-8 py-4">
            {/* TODO: Breadcrumbs y user info */}
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}