'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import Link from 'next/link'
import { Users, MessageSquare, FileText, Bot, Settings, Eye } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold mb-2">KIKI ADMIN DASHBOARD</h1>
          <p className="text-gray-600">Panel de administración del sistema</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">9</div>
              <p className="text-xs text-gray-600">En Supabase</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Mensajes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">38</div>
              <p className="text-xs text-gray-600">Conversaciones</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Proyectos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">7</div>
              <p className="text-xs text-gray-600">Activos</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Agentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold">5</div>
              <p className="text-xs text-gray-600">Profesionales</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-mono">System Prompts</CardTitle>
              <CardDescription>5 agentes profesionales</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/prompts">
                <Button className="w-full bg-yellow-400 text-black border-2 border-black font-mono">
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Prompts
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-mono">Usuarios</CardTitle>
              <CardDescription>Gestión de 9 usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full bg-blue-500 text-white border-2 border-black font-mono">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Usuarios
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CardHeader>
              <CardTitle className="font-mono">Chat Demo</CardTitle>
              <CardDescription>Testear sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/chat-demo">
                <Button className="w-full bg-green-500 text-white border-2 border-black font-mono">
                  <Bot className="w-4 h-4 mr-2" />
                  Probar Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="font-mono">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-500">
                <Bot className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-mono text-sm">✅ DeepSeek Integration</p>
                  <p className="text-xs text-gray-600">Agentes funcionando</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-500">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-mono text-sm">✅ File Generation</p>
                  <p className="text-xs text-gray-600">7 archivos generados</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 border-2 border-purple-500">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-mono text-sm">✅ Superadmin</p>
                  <p className="text-xs text-gray-600">higinieduard@gmail.com</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}