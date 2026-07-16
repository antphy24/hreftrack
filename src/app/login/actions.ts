'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { error: 'Please enter both email and password' }
  }

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Fetch role to redirect correctly
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (!profile) {
    return { error: 'No profile found. Please ensure the admin profile is inserted in the database via SQL.' }
  }

  // SECURITY FIX: Removed cookie-setting for user-role.
  // The middleware now always queries the database for role verification.

  if (profile.role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/student/dashboard')
  }
}

export async function studentLogin(formData: FormData) {
  const nis = formData.get('nis') as string
  const password = formData.get('password') as string
  
  if (!nis) return { error: 'Please enter your NIS' }
  if (!password) return { error: 'Please enter your password' }

  // 1. Get student's email by NIS
  const adminClient = createAdminClient()
  const { data: profiles, error: profileError } = await adminClient
    .from('profiles')
    .select('id')
    .eq('nis', nis)
    .eq('role', 'student')
    .single()

  if (profileError || !profiles) {
    return { error: 'Invalid NIS or password' }
  }

  const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(profiles.id)
  if (authError || !authUser?.user?.email) {
    return { error: 'Invalid NIS or password' }
  }

  // 2. Log them in using standard client to set cookies
  const supabase = createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authUser.user.email,
    password: password,
  })

  if (signInError) return { error: 'Invalid NIS or password' }
  
  // SECURITY FIX: Removed cookie-setting for user-role.
  // The middleware now always queries the database for role verification.
  redirect('/student/dashboard')
}
