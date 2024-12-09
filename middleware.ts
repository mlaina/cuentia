import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const publicRoutes = ['/', '/legal', '/s/', '/api/webhook', '/images', '/validation']

export async function middleware (req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)
  const turnstileVerified = req.cookies.get('turnstile_verified')?.value

  if (!user && !isPublicRoute && turnstileVerified !== 'true') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (user && req.nextUrl.pathname === '/success') {
    return NextResponse.next()
  }

  if (user && req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (user && isPublicRoute) {
    return NextResponse.redirect(new URL('/create', req.url))
  }

  if (user && req.nextUrl.pathname !== '/pricing' && !isPublicRoute && (!user?.user_metadata.credits || user?.user_metadata.credits === 0)) {
    return NextResponse.redirect(new URL('/pricing', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|videos/).*)']
}
