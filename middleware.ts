import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

const publicRoutes = ['/', '/legal', '/s/', '/api/webhook', '/image', '/validation', '/auth/callback', '/preview/*']

export async function middleware (req: { nextUrl: {
    searchParams: any; pathname: string
  }; cookies: { get: (arg0: string) => { (): any; new(): any; value: any } }; url: string | URL | undefined }) {
  const res = NextResponse.next()

  if (req.nextUrl.searchParams.has('_cf_chl_tk')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // @ts-ignore
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()
  const isPublicRoute = publicRoutes.some(route => {
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2) // Remove '/*'
      return req.nextUrl.pathname.startsWith(baseRoute)
    }
    return route === req.nextUrl.pathname
  })

  if (req.headers.get('x-error-status') === '400') {
    if (user) {
      return NextResponse.redirect(new URL('/create', req.url))
    } else {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (req.nextUrl.pathname.startsWith('/images')) {
    return res
  }

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
