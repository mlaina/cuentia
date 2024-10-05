// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/about', '/contact']

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

    // Si el usuario no está autenticado y está tratando de acceder a una ruta protegida
    if (!session && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // Si el usuario está autenticado y está tratando de acceder a una página de autenticación
    if (session && ['/login', '/register', '/forgot-password'].includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
