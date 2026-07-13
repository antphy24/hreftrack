'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Users, ClipboardList, CheckSquare, MessageSquare } from 'lucide-react'

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white/50 rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4 animate-pulse">
          <div className="w-16 h-16 rounded-xl bg-slate-200"></div>
          <div className="space-y-2">
            <div className="w-24 h-4 bg-slate-200 rounded"></div>
            <div className="w-12 h-6 bg-slate-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DashboardStats() {
  const [counts, setCounts] = useState({
    students: 0,
    mabbeppa: 0,
    adab: 0,
    english: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      const [
        { count: studentCount },
        { count: mabbeppaCount },
        { count: adabCount },
        { count: englishCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('mabbeppa_logs').select('*', { count: 'exact', head: true }),
        supabase.from('adab_logs').select('*', { count: 'exact', head: true }),
        supabase.from('english_self_logs').select('*', { count: 'exact', head: true })
      ])

      setCounts({
        students: studentCount || 0,
        mabbeppa: mabbeppaCount || 0,
        adab: adabCount || 0,
        english: englishCount || 0
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <StatsSkeleton />

  const stats = [
    { label: 'Total Students', value: counts.students, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Mabbeppa Logs', value: counts.mabbeppa, icon: ClipboardList, color: 'text-teal-600', bg: 'bg-teal-100' },
    { label: 'Action Plan Logs', value: counts.adab, icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'English Hours Logs', value: counts.english, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className={`p-4 rounded-xl ${stat.bg}`}>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <DashboardStats />
      
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Welcome to HreFTrack Admin</h2>
        <p className="text-slate-600">
          Use the sidebar to navigate through the different management modules.
          Make sure to populate students before assigning them to Mabbeppa areas.
        </p>
      </div>
    </div>
  )
}
