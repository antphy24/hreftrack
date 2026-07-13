import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  const user = session?.user

  const pathname = request.nextUrl.pathname

  async function getUserRole() {
    let role = request.cookies.get('user-role')?.value
    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single()
      role = profile?.role
      if (role) {
        supabaseResponse.cookies.set('user-role', role, { path: '/' })
      }
    }
    return role
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const role = await getUserRole()
    if (role === 'student') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
    // If role is missing but user exists, we assume they have access to prevent redirect loops,
    // or they will be stopped by RLS on the page anyway.
  }

  // Protect /student routes
  if (pathname.startsWith('/student')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const role = await getUserRole()
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // If user is already logged in and hits /login or root, redirect to their dashboard
  if ((pathname === '/login' || pathname === '/') && user) {
    const role = await getUserRole()
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    if (role === 'student') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
