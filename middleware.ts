// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/about', '/contact', '/api/stripe', '/api/webhook']

export async function middleware (req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user && ['/login', '/register', '/forgot-password'].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/create', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|videos/).*)']
}
