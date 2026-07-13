'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitMabbeppaLog(formData: FormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const assignment_id = formData.get('assignment_id') as string
  const indicator_id = formData.get('indicator_id') as string

  // Fetch the assignment to get area_id and student_id
  const { data: assignment } = await supabase
    .from('mabbeppa_assignments')
    .select('area_id, student_id')
    .eq('id', assignment_id)
    .single()

  if (!assignment) {
    return { error: 'Assignment not found' }
  }

  const { error } = await supabase.from('mabbeppa_logs').insert({
    area_id: assignment.area_id,
    student_id: assignment.student_id,
    indicator_id,
    reported_by: user.id
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/student/mabbeppa')
  return { success: true }
}
