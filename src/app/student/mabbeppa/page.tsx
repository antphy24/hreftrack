'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MabbeppaReportForm } from './MabbeppaReportForm'

export default function StudentMabbeppaPage() {
  const [data, setData] = useState<{ assignments: any[], indicators: any[], recentLogs: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      if (!user) {
        setLoading(false)
        return
      }

      const [
        { data: assignments },
        { data: indicators }
      ] = await Promise.all([
        supabase.from('mabbeppa_assignments').select(`
          id, area_id, student_id,
          area:mabbeppa_areas(name),
          cleaner:profiles!mabbeppa_assignments_student_id_fkey(full_name, nis)
        `).eq('reporter_id', user.id),
        supabase.from('mabbeppa_indicators').select('*').order('created_at', { ascending: false })
      ])

      const { data: recentLogs } = await supabase.from('mabbeppa_logs').select(`
        id, created_at,
        area:mabbeppa_areas(name),
        cleaner:profiles!mabbeppa_logs_student_id_fkey(full_name),
        indicator:mabbeppa_indicators(label)
      `).eq('reported_by', user.id).order('created_at', { ascending: false }).limit(5)

      setData({
        assignments: assignments || [],
        indicators: indicators || [],
        recentLogs: recentLogs || []
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading portal...</p>
      </div>
    )
  }

  if (!data || data.assignments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4">No Assignments Found</h2>
        <p className="text-slate-400 text-lg">You have not been assigned as a reporter for any Mabbeppa areas.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Submit Mabbeppa Report</h2>
        <p className="text-slate-400 mb-8">Select the area/cleaner you are responsible for reporting on.</p>
        
        <MabbeppaReportForm assignments={data.assignments} indicators={data.indicators} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6">Your Recent Reports</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Area</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Cleaner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data.recentLogs.map(log => (
                <tr key={log.id}>
                  <td className="px-4 py-4 text-sm text-slate-300">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm text-slate-300">{(log.area as any)?.name}</td>
                  <td className="px-4 py-4 text-sm text-slate-300">{log.cleaner?.full_name}</td>
                  <td className="px-4 py-4 text-sm font-medium text-teal-400">{log.indicator?.label}</td>
                </tr>
              ))}
              {data.recentLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No recent reports.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
