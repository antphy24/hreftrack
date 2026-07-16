'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'

export async function changePassword(formData: FormData) {
  const supabase = createClient()
  
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'New passwords do not match.' }
  }
  
  // Password strength requirements
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long.' }
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return { error: 'Password must contain uppercase, lowercase, and a number.' }
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user || !user.email) {
    return { error: 'Not authenticated.' }
  }


  const { error: updateError } = await supabase.auth.updateUser({
    password: password
  })

  if (updateError) {
    return { error: updateError.message }
  }

  // Set needs_password_change to false
  const adminSupabase = createAdminClient()
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .update({ needs_password_change: false })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  // SECURITY FIX: Removed cookie-setting for needs-password-change.
  // The middleware now always queries the database for this value,
  // so no client-side cookie is needed.

  redirect('/student/dashboard')
}
