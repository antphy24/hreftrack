import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { EnglishHoursManager } from './EnglishHoursManager'

async function EnglishHoursData() {
  const supabase = createClient()
  
  const [
    { data: statements },
    { data: selfLogs },
    { data: peerReports },
  ] = await Promise.all([
    supabase.from('english_statements').select('*').order('created_at', { ascending: false }),
    supabase.from('english_self_logs').select(`
      id, created_at,
      student:profiles!english_self_logs_student_id_fkey(full_name, nis),
      statement:english_statements(statement)
    `).order('created_at', { ascending: false }),
    supabase.from('english_peer_reports').select(`
      id, created_at, notes,
      reporter:profiles!english_peer_reports_reporter_id_fkey(full_name, nis),
      reported_student:profiles!english_peer_reports_reported_student_id_fkey(full_name, nis)
    `).order('created_at', { ascending: false })
  ])

  return (
    <EnglishHoursManager 
      statements={statements || []} 
      selfLogs={selfLogs || []} 
      peerReports={peerReports || []} 
    />
  )
}

function EnglishHoursSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse space-y-6">
      <div className="h-10 bg-slate-200 rounded w-1/4"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded"></div>
        ))}
      </div>
    </div>
  )
}

export default function EnglishHoursPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">English Hours Management</h2>
        <p className="text-sm text-slate-500 mt-1">Manage statements, self logs, and peer reports.</p>
      </div>

      <Suspense fallback={<EnglishHoursSkeleton />}>
        <EnglishHoursData />
      </Suspense>
    </div>
  )
}
