import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const publicRoutes = [
  '/',
  '/legal',
  '/s/',
  '/api/webhook',
  '/image',
  '/validation',
  '/auth/callback',
  '/preview/*'
]

export async function middleware (req) {
  let res = NextResponse.next()

  if (req.nextUrl.pathname.startsWith('/images')) {
    return res
  }

  if (req.nextUrl.pathname.startsWith('/preview')) {
    return res
  }

  // Si se detecta el parámetro _cf_chl_tk, forzar redirección con status 303 y eliminar header duplicado.
  if (req.nextUrl.searchParams.has('_cf_chl_tk')) {
    res = NextResponse.redirect(new URL('/', req.url), { status: 303 })
    res.headers.delete('x-middleware-set-cookie')
    return res
  }

  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res // Permitir el flujo de autenticación sin interrupciones
  }

  // Inicializa Supabase en el middleware
  const supabase = createMiddlewareClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (req.nextUrl.pathname !== '/') {
      res = NextResponse.redirect(new URL('/', req.url), { status: 303 })
      res.headers.delete('x-middleware-set-cookie')
      return res
    }
    return res
  }

  // Verifica si la ruta es pública
  const isPublicRoute = publicRoutes.some(route => {
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2)
      return req.nextUrl.pathname.startsWith(baseRoute)
    }
    return route === req.nextUrl.pathname
  })

  // Si el header x-error-status es 400, redirige según el estado del usuario
  if (req.headers.get('x-error-status') === '400') {
    res = NextResponse.redirect(
      new URL(user ? '/create' : '/', req.url),
      { status: 303 }
    )
    res.headers.delete('x-middleware-set-cookie')
    return res
  }

  if (!user && !isPublicRoute) {
    res = NextResponse.redirect(new URL('/', req.url), { status: 303 })
    res.headers.delete('x-middleware-set-cookie')
    return res
  }

  if (user && req.nextUrl.pathname === '/success') {
    return res
  }

  if (user && req.nextUrl.pathname.startsWith('/api/')) {
    return res
  }

  if (user && isPublicRoute) {
    res = NextResponse.redirect(new URL('/create', req.url), { status: 303 })
    res.headers.delete('x-middleware-set-cookie')
    return res
  }

  if (
    user &&
    req.nextUrl.pathname !== '/pricing' &&
    !isPublicRoute &&
    (!user?.user_metadata.credits || user?.user_metadata.credits === 0)
  ) {
    res = NextResponse.redirect(new URL('/pricing', req.url), { status: 303 })
    res.headers.delete('x-middleware-set-cookie')
    return res
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|videos/).*)']
}
