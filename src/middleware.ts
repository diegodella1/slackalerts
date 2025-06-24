import { createClient } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession()

    // Get the current path
    const path = request.nextUrl.pathname

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/auth/callback']
    const isPublicRoute = publicRoutes.includes(path)

    // If user is not authenticated and trying to access protected route
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated and trying to access login page
    if (session && isPublicRoute) {
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Continue with the request
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // If there's an error, redirect to login
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 