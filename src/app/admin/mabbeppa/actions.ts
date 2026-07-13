'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Areas
export async function addArea(formData: FormData) {
  const supabase = createClient()
  const name = formData.get('name') as string
  await supabase.from('mabbeppa_areas').insert({ name })
  revalidatePath('/admin/mabbeppa')
}
export async function deleteArea(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string
  await supabase.from('mabbeppa_areas').delete().eq('id', id)
  revalidatePath('/admin/mabbeppa')
}

// Indicators
export async function addIndicator(formData: FormData) {
  const supabase = createClient()
  const label = formData.get('label') as string
  await supabase.from('mabbeppa_indicators').insert({ label })
  revalidatePath('/admin/mabbeppa')
}
export async function deleteIndicator(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string
  await supabase.from('mabbeppa_indicators').delete().eq('id', id)
  revalidatePath('/admin/mabbeppa')
}

// Assignments
export async function addAssignment(formData: FormData) {
  const supabase = createClient()
  const area_id = formData.get('area_id') as string
  const student_ids = formData.getAll('student_id') as string[]
  const reporter_id = formData.get('reporter_id') as string
  
  if (student_ids.length > 0) {
    const inserts = student_ids.map(student_id => ({
      area_id,
      student_id,
      reporter_id
    }))
    await supabase.from('mabbeppa_assignments').insert(inserts)
  }
  
  revalidatePath('/admin/mabbeppa')
}
export async function deleteAssignment(formData: FormData) {
  const supabase = createClient()
  const id = formData.get('id') as string
  await supabase.from('mabbeppa_assignments').delete().eq('id', id)
  revalidatePath('/admin/mabbeppa')
}

// Bulk Import
export async function bulkAddMabbeppaAreas(rows: { areaName: string, cleanerNis: string[], reporterNis: string }[]) {
  const supabase = createClient()
  
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
