'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

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

  // Set role cookie for faster middleware routing
  cookies().set('user-role', profile.role, { path: '/' })

  if (profile.role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/student/dashboard')
  }
}
