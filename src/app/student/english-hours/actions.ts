'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getStartOfDayMakassar } from '@/lib/utils'

export async function submitSelfLog(formData: FormData) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const statement_id = formData.get('statement_id') as string

    // Check for duplicate today
    const startOfDay = getStartOfDayMakassar()
    
    const { data: existingLog, error: fetchError } = await supabase
      .from('english_self_logs')
      .select('id')
      .eq('student_id', user.id)
      .eq('statement_id', statement_id)
      .gte('created_at', startOfDay)
      .maybeSingle()

    if (fetchError) {
      return { error: fetchError.message }
    }

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
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred on the server.' }
  }
}

export async function submitPeerReport(formData: FormData) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const reported_student_id = formData.get('reported_student_id') as string
    const notes = formData.get('notes') as string

    if (reported_student_id === user.id) {
      return { error: 'You cannot report yourself here.' }
    }

    const startOfDay = getStartOfDayMakassar()
    
    // Check for duplicate report for the same student on the same day
    const { data: existingLog, error: fetchError } = await supabase
      .from('english_peer_reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('reported_student_id', reported_student_id)
      .gte('created_at', startOfDay)
      .maybeSingle()

    if (fetchError) {
      return { error: fetchError.message }
    }

    if (existingLog) {
      return { error: 'You have already reported this student today.' }
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
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred on the server.' }
  }
}
