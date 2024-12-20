import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const publicRoutes = ['/', '/legal', '/s/', '/api/webhook', '/images', '/validation', 'auth/callback']

export async function middleware (req: { nextUrl: { pathname: string }; cookies: { get: (arg0: string) => { (): any; new(): any; value: any } }; url: string | URL | undefined }) {
  const res = NextResponse.next()
  // @ts-ignore
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  if (!user && !isPublicRoute) {
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
