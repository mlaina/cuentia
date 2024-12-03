import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, NextRequest } from 'next/server'

const publicRoutes = ['/', '/legal', '/pricing', '/api/stripe', '/api/webhook', '/images']

export async function middleware (req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // Redirigir si el usuario no está autenticado y la ruta no es pública
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirigir a /create si el usuario está autenticado y está en páginas restringidas
  if (user && ['/login', '/register', '/forgot-password'].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/create', req.url))
  }

  // Validar que /pricing tenga el parámetro `email`
  if (req.nextUrl.pathname === '/pricing' && !req.nextUrl.searchParams.get('email')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|videos/).*)']
}
