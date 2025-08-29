import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './lib/supabase/server'

export async function middleware(request: NextRequest) {
  // NUEVO SISTEMA: Sin auth compleja, permitir acceso público a landing
  // Solo proteger admin routes para superadmin
  
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  
  // Solo proteger admin routes - verificar si es superadmin
  if (isAdminPath) {
    try {
      const supabase = createClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const { data: userData, error: profileError } = await supabase
        .from('kiki_users')
        .select('role')
        .eq('id', user.id)
        .single()

      // Allow access only for superadmin
      if (profileError || userData?.role !== 'superadmin') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      return NextResponse.next()
    } catch (error) {
      console.error('Middleware auth error:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}