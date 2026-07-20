'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

/**
 * Verifies the current user is an authenticated admin.
 * Returns the user object on success, or an error object on failure.
 */
async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', user: null, supabase }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Forbidden: admin access required', user: null, supabase }
  }

  return { error: null, user, supabase }
}

export async function createStudent(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) return { error: authError }

  const fullName = formData.get('fullName')?.toString().trim()
  const nis = formData.get('nis')?.toString().trim()
  
  if (!fullName || fullName.length < 2 || fullName.length > 100) return { error: 'Full name must be between 2 and 100 characters.' }
  if (!nis || nis.length < 3 || nis.length > 20) return { error: 'NIS must be between 3 and 20 characters.' }
  
  // Revert back to using NIS as the initial password
  const password = nis

  // We use nis@athirah.bone as the dummy email to satisfy Supabase Auth requirements
  const email = `${nis}@athirah.bone`

  const adminSupabase = createAdminClient()

  const { data: authData, error: signUpError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    }
  })

  if (signUpError) {
    return { error: signUpError.message }
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      role: 'student',
      full_name: fullName,
      nis: nis,
      needs_password_change: true
    })

    if (profileError) {
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      return { error: profileError.message }
    }
  }

  revalidatePath('/admin/students')
  revalidatePath('/login')
  return { password } // Return the generated password to the client
}

export async function deleteStudent(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id')?.toString().trim()
  
  if (!id) throw new Error('Student ID is required')

  // SECURITY FIX: Also delete from auth.users to prevent orphaned accounts
  const adminSupabase = createAdminClient()
  const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(id)
  
  if (authDeleteError) {
    throw new Error(`Failed to delete auth user: ${authDeleteError.message}`)
  }

  const { error } = await supabase.from('profiles').delete().eq('id', id)
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/students')
  revalidatePath('/login')
}

export async function updateStudentPassword(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) return { error: authError }

  const id = formData.get('id') as string

  // Fetch the student's NIS
  const { data: profile, error: profileFetchError } = await supabase
    .from('profiles')
    .select('nis')
    .eq('id', id)
    .single()

  if (profileFetchError || !profile?.nis) {
    return { error: 'Failed to retrieve student NIS.' }
  }

  // Revert back to using NIS as the reset password
  const newPassword = profile.nis

  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase.auth.admin.updateUserById(id, {
    password: newPassword
  })

  if (error) {
    return { error: error.message }
  }

  await supabase.from('profiles').update({ needs_password_change: true }).eq('id', id)

  return { success: true, password: newPassword }
}

export async function bulkCreateStudents(students: { fullName: string, nis: string }[]) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) return { successCount: 0, errors: [authError] }

  if (!Array.isArray(students)) return { successCount: 0, errors: ['Invalid input format'] }
  if (students.length === 0) return { successCount: 0, errors: ['No students provided'] }
  if (students.length > 500) return { successCount: 0, errors: ['Maximum 500 students allowed per batch'] }

  // SECURITY FIX: Use the centralized service-role admin client
  const adminSupabase = createAdminClient()

  let successCount = 0
  const errors = []

  for (const student of students) {
    const email = `${student.nis}@athirah.bone`
    
    // 1. Create Auth User using admin API
    const { data: authData, error: signUpError } = await adminSupabase.auth.admin.createUser({
      email,
      password: student.nis,
      email_confirm: true,
      user_metadata: { full_name: student.fullName }
    })

    if (signUpError) {
      errors.push(`Row failed for NIS ${student.nis}: ${signUpError.message}`)
      continue
    }

    // 2. Create Profile
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        role: 'student',
        full_name: student.fullName,
        nis: student.nis,
        needs_password_change: true
      })

      if (profileError) {
        // Cleanup orphaned auth user
        await adminSupabase.auth.admin.deleteUser(authData.user.id)
        errors.push(`Profile creation failed for NIS ${student.nis}: ${profileError.message}`)
      } else {
        successCount++
      }
    }
  }

  revalidatePath('/admin/students')
  revalidatePath('/login')
  return { successCount, errors }
}

export async function deleteAllStudents() {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const adminSupabase = createAdminClient()

  // Fetch all students
  const { data: students, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'student')

  if (fetchError) {
    throw new Error(`Failed to fetch students: ${fetchError.message}`)
  }

  if (students && students.length > 0) {
    // Delete auth users in parallel chunks to prevent timeouts
    const chunkSize = 50
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk = students.slice(i, i + chunkSize)
      await Promise.all(
        chunk.map(async (student) => {
          const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(student.id)
          if (authDeleteError) {
            console.error(`Failed to delete auth user ${student.id}: ${authDeleteError.message}`)
          }
        })
      )
    }
  }

  // Delete all student profiles
  const { error } = await supabase.from('profiles').delete().eq('role', 'student')
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/students')
  revalidatePath('/login')
}
