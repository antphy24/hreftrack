import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { ActionPlanManager } from './ActionPlanManager'

async function ActionPlanData() {
  const supabase = createClient()
  
  const [
    { data: categories },
    { data: items },
    { data: logs },
  ] = await Promise.all([
    supabase.from('adab_categories').select('*').order('created_at', { ascending: false }),
    supabase.from('adab_items').select('*, adab_categories(name)').order('created_at', { ascending: false }),
    supabase.from('adab_logs').select(`
      id, created_at,
      student:profiles!adab_logs_student_id_fkey(full_name, nis),
      item:adab_items(description, adab_categories(name))
    `).order('created_at', { ascending: false })
  ])

  return (
    <ActionPlanManager 
      categories={categories || []} 
      items={items || []} 
      logs={logs || []} 
    />
  )
}

function ActionPlanSkeleton() {
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

export default function ActionPlanPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Action Plan (Adab) Management</h2>
        <p className="text-sm text-slate-500 mt-1">Manage adab categories, items, and view logs.</p>
      </div>

      <Suspense fallback={<ActionPlanSkeleton />}>
        <ActionPlanData />
      </Suspense>
    </div>
  )
}
