'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CounselingStudent {
  id: string;
  student_name: string;
  grade_level: number;
  class_section: string;
}

export interface StudentProfile {
  id: string;
  full_name: string;
  nis: string;
}

export interface CounselingLog {
  id: string;
  created_at: string;
  student_id: string;
  date: string;
  category: string;
  intervention_type: string;
  notes: string | null;
  requires_followup: boolean;
  created_by: string;
  counseling_students?: {
    student_name: string;
    grade_level: number;
    class_section: string;
  };
}

export async function getStudentProfiles() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, nis')
    .eq('role', 'student')
    .order('full_name')
    
  if (error) {
    console.error('Error fetching student profiles:', error)
    return []
  }
  return data as StudentProfile[]
}

export async function logCounselingSession(data: {
  student_id: string;
  student_name: string;
  grade_level: number;
  class_section: string;
  date: string;
  category: string;
  intervention_type: string;
  notes?: string;
  requires_followup: boolean;
}) {
  const supabase = createClient()
  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError || !userData?.user) {
    throw new Error('Not authenticated')
  }

  // 1. Upsert into counseling_students
  const { error: studentError } = await supabase
    .from('counseling_students')
    .upsert({
      id: data.student_id,
      student_name: data.student_name,
      grade_level: data.grade_level,
      class_section: data.class_section
    })

  if (studentError) {
    console.error('Error upserting student:', studentError)
    throw new Error('Failed to save student details')
  }

  // 2. Insert into counseling_logs
  const { error: logError } = await supabase
    .from('counseling_logs')
    .insert({
      student_id: data.student_id,
      date: data.date,
      category: data.category,
      intervention_type: data.intervention_type,
      notes: data.notes,
      requires_followup: data.requires_followup,
      created_by: userData.user.id
    })

  if (logError) {
    console.error('Error inserting log:', logError)
    throw new Error('Failed to log session')
  }

  revalidatePath('/admin/dashboard/counseling')
  revalidatePath('/admin/dashboard/counseling/logs')
}

export async function getCounselingLogs() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('counseling_logs')
    .select(`
      *,
      counseling_students (
        student_name,
        grade_level,
        class_section
      )
    `)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching logs:', error)
    return []
  }

  return data as CounselingLog[]
}

export async function getCounselingAnalytics() {
  const supabase = createClient()
  
  const { data: logs, error } = await supabase
    .from('counseling_logs')
    .select(`
      id,
      category,
      intervention_type,
      requires_followup,
      student_id,
      counseling_students (
        student_name
      )
    `)

  if (error || !logs) {
    console.error('Error fetching analytics:', error)
    return {
      totalSessions: 0,
      categoryCounts: [],
      interventionCounts: [],
      followupStudents: []
    }
  }

  const totalSessions = logs.length
  
  const categoryMap = new Map<string, number>()
  const interventionMap = new Map<string, number>()
  const followupStudents = []

  for (const log of logs) {
    categoryMap.set(log.category, (categoryMap.get(log.category) || 0) + 1)
    interventionMap.set(log.intervention_type, (interventionMap.get(log.intervention_type) || 0) + 1)
    
    if (log.requires_followup) {
      followupStudents.push({
        id: log.id,
        student_id: log.student_id,
        student_name: (log.counseling_students as any)?.student_name || 'Unknown',
        category: log.category
      })
    }
  }

  return {
    totalSessions,
    categoryCounts: Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })),
    interventionCounts: Array.from(interventionMap.entries()).map(([name, value]) => ({ name, value })),
    followupStudents
  }
}
