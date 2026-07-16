import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')

  const response = NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })

  // SECURITY FIX: Clear custom auth cookies on sign-out to prevent
  // stale role data from being inherited by the next user who logs in.
  response.cookies.delete('user-role')
  response.cookies.delete('needs-password-change')

  return response
}
