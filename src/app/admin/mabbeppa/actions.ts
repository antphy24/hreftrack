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

// Areas
export async function addArea(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const name = formData.get('name')?.toString().trim()
  if (!name || name.length < 2) throw new Error('Invalid area name')
  
  const { error } = await supabase.from('mabbeppa_areas').insert({ name })
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/mabbeppa')
}
export async function deleteArea(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id') as string
  await supabase.from('mabbeppa_areas').delete().eq('id', id)
  revalidatePath('/admin/mabbeppa')
}
export async function updateArea(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id')?.toString().trim()
  const name = formData.get('name')?.toString().trim()
  if (!id) throw new Error('Missing ID')
  if (!name || name.length < 2) throw new Error('Invalid area name')
  
  const { error } = await supabase.from('mabbeppa_areas').update({ name }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/mabbeppa')
}

// Indicators
export async function addIndicator(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const label = formData.get('label')?.toString().trim()
  if (!label || label.length < 2) throw new Error('Invalid indicator label')
  
  const { error } = await supabase.from('mabbeppa_indicators').insert({ label })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/mabbeppa')
}
export async function deleteIndicator(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id') as string
  await supabase.from('mabbeppa_indicators').delete().eq('id', id)
  revalidatePath('/admin/mabbeppa')
}
export async function updateIndicator(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id')?.toString().trim()
  const label = formData.get('label')?.toString().trim()
  if (!id) throw new Error('Missing ID')
  if (!label || label.length < 2) throw new Error('Invalid indicator label')
  
  const { error } = await supabase.from('mabbeppa_indicators').update({ label }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/mabbeppa')
}

// Assignments
export async function addAssignment(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const area_id = formData.get('area_id')?.toString().trim()
  const student_ids = formData.getAll('student_id') as string[]
  const reporter_id = formData.get('reporter_id')?.toString().trim()
  
  if (!area_id || !reporter_id) throw new Error('Missing area or reporter')
  if (student_ids.length > 50) throw new Error('Too many students assigned at once (max 50)')
  
  if (student_ids.length > 0) {
    const inserts = student_ids.map(student_id => ({
      area_id,
      student_id,
      reporter_id
    }))
    const { error } = await supabase.from('mabbeppa_assignments').insert(inserts)
    if (error) throw new Error(error.message)
  }
  
  revalidatePath('/admin/mabbeppa')
}
export async function deleteAssignment(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) throw new Error(authError)

  const id = formData.get('id') as string
  await supabase.from('mabbeppa_assignments').delete().eq('id', id)
  revalidatePath('/admin/mabbeppa')
}

// Bulk Import
export async function bulkAddMabbeppaAreas(rows: { areaName: string, cleanerNis: string[], reporterNis: string }[]) {
  const { error: authError, supabase } = await requireAdmin()
  if (authError) return { error: authError }

  if (!Array.isArray(rows)) return { error: 'Invalid input format' }
  if (rows.length > 100) return { error: 'Maximum 100 areas allowed per batch' }

  for (const row of rows) {
    // 1. Create Area
    const { data: areaData, error: areaError } = await supabase.from('mabbeppa_areas').insert({ name: row.areaName }).select().single()
    if (areaError || !areaData) continue
    
    // 2. Find Reporter
    const { data: reporter } = await supabase.from('profiles').select('id').eq('nis', row.reporterNis).single()
    if (!reporter) continue
    
    // 3. Find Cleaners
    const { data: cleaners } = await supabase.from('profiles').select('id').in('nis', row.cleanerNis)
    if (!cleaners || cleaners.length === 0) continue

    // 4. Create Assignments
    const inserts = cleaners.map(c => ({
      area_id: areaData.id,
      student_id: c.id,
      reporter_id: reporter.id
    }))
    
    await supabase.from('mabbeppa_assignments').insert(inserts)
  }
  
  revalidatePath('/admin/mabbeppa')
}
