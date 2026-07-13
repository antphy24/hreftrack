'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createStudent(formData: FormData) {
  const supabase = createClient()
  
  const fullName = formData.get('fullName') as string
  const nis = formData.get('nis') as string
  const password = formData.get('password') as string

  // We use nis@student.local as the dummy email to satisfy Supabase Auth requirements
  const email = `${nis}@student.local`

  // We use a basic client with persistSession: false for sign up so it doesn't overwrite the admin's cookies
  const { createClient: createBasicClient } = await import('@supabase/supabase-js')
  const authSupabase = createBasicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: authData, error: authError } = await authSupabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    // Insert profile using the original admin client, so RLS passes
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      role: 'student',
      full_name: fullName,
      nis: nis
    })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  revalidatePath('/admin/students')
}

export async function deleteStudent(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string

  // Note: Deleting a user from the 'profiles' table will NOT delete them from auth.users
  // unless we use the service_role key to call supabase.auth.admin.deleteUser(id).
  // For now, we will just delete their profile (and RLS cascades or denies it).
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  
  if (!error) {
    revalidatePath('/admin/students')
  }
}

export async function updateStudentPassword(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string
  const newPassword = formData.get('password') as string

  // We MUST use the service role key to update another user's password.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return { error: 'SUPABASE_SERVICE_ROLE_KEY is not set in environment variables. Cannot reset passwords.' }
  }

  const { createClient: createAdminClient } = await import('@supabase/supabase-js')
  const adminAuthClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false } }
  )

  const { error } = await adminAuthClient.auth.admin.updateUserById(id, {
    password: newPassword
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function bulkCreateStudents(students: { fullName: string, nis: string, password: string }[]) {
  const supabase = createClient()
  
  const { createClient: createBasicClient } = await import('@supabase/supabase-js')
  const authSupabase = createBasicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  let successCount = 0
  const errors = []

  for (const student of students) {
    const email = `${student.nis}@student.local`
    
    // 1. Create Auth User
    const { data: authData, error: authError } = await authSupabase.auth.signUp({
      email,
      password: student.password,
      options: {
        data: { full_name: student.fullName }
      }
    })

    if (authError) {
      errors.push(`Row failed for NIS ${student.nis}: ${authError.message}`)
      continue
    }

    // 2. Create Profile
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        role: 'student',
        full_name: student.fullName,
        nis: student.nis
      })

      if (profileError) {
        errors.push(`Profile creation failed for NIS ${student.nis}: ${profileError.message}`)
      } else {
        successCount++
      }
    }
  }

  revalidatePath('/admin/students')
  return { successCount, errors }
}
