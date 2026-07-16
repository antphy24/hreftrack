'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Verifies the current user is an authenticated admin.
 * Returns the user object and supabase client on success, or an error object on failure.
 */
async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', supabase }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Forbidden: admin access required', supabase }
  }

  return { error: null, supabase }
}

// Statements
export async function addStatement(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const statement = formData.get('statement') as string
  await supabase.from('english_statements').insert({ statement, is_active: true })
  revalidatePath('/admin/english-hours')
}

export async function deleteStatement(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id') as string
  await supabase.from('english_statements').delete().eq('id', id)
  revalidatePath('/admin/english-hours')
}

export async function toggleStatementActive(id: string, currentStatus: boolean) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) return { error: authError }

  await supabase.from('english_statements').update({ is_active: !currentStatus }).eq('id', id)
  revalidatePath('/admin/english-hours')
}

export async function updateStatement(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) return { error: authError }

  const id = formData.get('id') as string
  const statement = formData.get('statement') as string
  await supabase.from('english_statements').update({ statement }).eq('id', id)
  revalidatePath('/admin/english-hours')
}
