'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitSelfLog(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const statement_id = formData.get('statement_id') as string

  // Check for duplicate today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: existingLog } = await supabase
    .from('english_self_logs')
    .select('id')
    .eq('student_id', user.id)
    .eq('statement_id', statement_id)
    .gte('created_at', today.toISOString())
    .single()

  if (existingLog) {
    return { error: 'You have already submitted this statement today.' }
  }

  const { error } = await supabase.from('english_self_logs').insert({
    student_id: user.id,
    statement_id
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/student/english-hours')
  return { success: true }
}

export async function submitPeerReport(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const reported_student_id = formData.get('reported_student_id') as string
  const notes = formData.get('notes') as string

  if (reported_student_id === user.id) {
    return { error: 'You cannot report yourself here.' }
  }

  const { error } = await supabase.from('english_peer_reports').insert({
    reporter_id: user.id,
    reported_student_id,
    notes
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/student/english-hours')
  return { success: true }
}
