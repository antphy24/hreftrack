import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { MabbeppaManager } from './MabbeppaManager'

async function MabbeppaData() {
  const supabase = createClient()
  
  const [
    { data: areas },
    { data: indicators },
    { data: assignments },
    { data: logs },
    { data: students }
  ] = await Promise.all([
    supabase.from('mabbeppa_areas').select('*').order('created_at', { ascending: false }),
    supabase.from('mabbeppa_indicators').select('*').order('created_at', { ascending: false }),
    supabase.from('mabbeppa_assignments').select(`
      id, created_at, area_id, student_id, reporter_id,
      mabbeppa_areas(name),
      cleaner:profiles!mabbeppa_assignments_student_id_fkey(full_name),
      reporter:profiles!mabbeppa_assignments_reporter_id_fkey(full_name)
    `).order('created_at', { ascending: false }),
    supabase.from('mabbeppa_logs').select(`
      id, created_at,
      mabbeppa_areas(name),
      cleaner:profiles!mabbeppa_logs_student_id_fkey(full_name, nis),
      reporter:profiles!mabbeppa_logs_reported_by_fkey(full_name),
      mabbeppa_indicators(label)
    `).order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, nis').eq('role', 'student')
  ])

  return (
    <MabbeppaManager 
      areas={areas || []} 
      indicators={indicators || []} 
      assignments={assignments || []} 
      logs={logs || []} 
      students={students || []} 
    />
  )
}

function MabbeppaSkeleton() {
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

export default function MabbeppaPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Mabbeppa Portal Management</h2>
        <p className="text-sm text-slate-500 mt-1">Manage cleaning areas, indicators, and view reports.</p>
      </div>

      <Suspense fallback={<MabbeppaSkeleton />}>
        <MabbeppaData />
      </Suspense>
    </div>
  )
}
