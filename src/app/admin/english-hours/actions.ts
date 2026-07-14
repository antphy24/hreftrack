'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Statements
export async function addStatement(formData: FormData) {
  const supabase = createClient()
  const statement = formData.get('statement') as string
  await supabase.from('english_statements').insert({ statement, is_active: true })
  revalidatePath('/admin/english-hours')
}

export async function deleteStatement(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string
  await supabase.from('english_statements').delete().eq('id', id)
  revalidatePath('/admin/english-hours')
}

export async function toggleStatementActive(id: string, currentStatus: boolean) {
  const supabase = createClient()
  await supabase.from('english_statements').update({ is_active: !currentStatus }).eq('id', id)
  revalidatePath('/admin/english-hours')
}

export async function updateStatement(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string
  const statement = formData.get('statement') as string
  await supabase.from('english_statements').update({ statement }).eq('id', id)
  revalidatePath('/admin/english-hours')
}
