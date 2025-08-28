/**
 * Página de registro de nuevos usuarios
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/(auth)/signup/page.tsx
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase/client'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import toast from 'react-hot-toast'
import { Loader2, Rocket } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Crear cuenta
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })

      if (authError) {
        toast.error(authError.message)
        return
      }

      // Verificar si el email necesita confirmación
      if (authData?.user?.identities?.length === 0) {
        toast.success('Por favor, revisa tu email para confirmar tu cuenta')
        return
      }

      // Crear registro en kiki_users (fallback por si el trigger falla)
      if (authData?.user) {
        try {
          const { error: userError } = await supabase
            .from('kiki_users')
            .insert({
              id: authData.user.id,
              email: authData.user.email!,
              full_name: fullName
            })
          
          if (userError && !userError.message.includes('duplicate key')) {
            console.error('Error creating kiki_user:', userError)
          }
        } catch (error) {
          console.error('Fallback user creation failed:', error)
        }
      }

      toast.success('¡Cuenta creada exitosamente!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
      
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-main border-2 border-border shadow-shadow flex items-center justify-center">
              <Rocket className="w-8 h-8 text-main-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-mono text-center">
            ÚNETE A KIKI
          </CardTitle>
          <CardDescription className="text-center">
            Crea tu cuenta y comienza a desarrollar proyectos increíbles
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Tu nombre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
            </Button>
            
            <div className="text-sm text-center text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link 
                href="/login" 
                className="font-medium text-primary hover:underline"
              >
                Inicia sesión
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}