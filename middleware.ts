import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const publicRoutes = ['/', '/legal', '/pricing', '/api/stripe', '/api/webhook', '/images', '/validation']

export async function middleware (req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)
  const turnstileVerified = req.cookies.get('turnstile_verified')?.value

  if (!user && !isPublicRoute && turnstileVerified !== 'true') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (user && ['/login', '/register', '/forgot-password'].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/create', req.url))
  }

  if (req.nextUrl.pathname === '/pricing' && !req.nextUrl.searchParams.get('email')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|videos/).*)']
}
