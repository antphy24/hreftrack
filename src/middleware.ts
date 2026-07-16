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

  // SECURITY FIX: Use getUser() instead of getSession() to validate the JWT
  // server-side. getSession() only reads from cookies and can be forged.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // SECURITY FIX: Always fetch role from the database. Never trust client cookies
  // for authorization decisions — they can be tampered with.
  async function getUserRoleAndStatus() {
    if (!user) {
      return { role: null, needsPasswordChange: false }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, needs_password_change')
      .eq('id', user.id)
      .single()

    return {
      role: profile?.role ?? null,
      needsPasswordChange: profile?.needs_password_change === true,
    }
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { role } = await getUserRoleAndStatus()
    // SECURITY FIX: Positive check — only allow confirmed admins.
    // Previously only blocked role === 'student', allowing undefined/null roles through.
    if (role !== 'admin') {
      if (role === 'student') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protect /student routes
  if (pathname.startsWith('/student')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { role, needsPasswordChange } = await getUserRoleAndStatus()
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    if (role !== 'student') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (needsPasswordChange && pathname !== '/student/change-password') {
      return NextResponse.redirect(new URL('/student/change-password', request.url))
    }
  }

  // If user is already logged in and hits /login or root, redirect to their dashboard
  if ((pathname === '/login' || pathname === '/') && user) {
    const { role, needsPasswordChange } = await getUserRoleAndStatus()
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    if (role === 'student') {
      if (needsPasswordChange) {
        return NextResponse.redirect(new URL('/student/change-password', request.url))
      }
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
