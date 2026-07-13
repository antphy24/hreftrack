'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { EnglishHoursForm } from './EnglishHoursForm'
import { PeerReportForm } from './PeerReportForm'

export default function StudentEnglishHoursPage() {
  const [data, setData] = useState<{ statements: any[], students: any[], loggedStatementIds: any[] } | null>(null)
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
        { data: statements },
        { data: students }
      ] = await Promise.all([
        supabase.from('english_statements').select('id, statement').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, full_name, nis').eq('role', 'student').neq('id', user.id).order('full_name', { ascending: true })
      ])

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: todaysLogs } = await supabase
        .from('english_self_logs')
        .select('statement_id')
        .eq('student_id', user.id)
        .gte('created_at', today.toISOString())

      const loggedStatementIds = todaysLogs?.map(log => log.statement_id) || []

      setData({
        statements: statements || [],
        students: students || [],
        loggedStatementIds
      })
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading english hours...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Self Log Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-2">My English Practice</h2>
        <p className="text-slate-400 mb-8">Select the statement you practiced speaking today.</p>
        
        <div className="flex-1">
          {data.statements.length > 0 ? (
            <EnglishHoursForm statements={data.statements} loggedStatementIds={data.loggedStatementIds} />
          ) : (
            <p className="text-slate-500 text-center py-8">No active statements available.</p>
          )}
        </div>
      </div>

      {/* Peer Report Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-2">Peer Report</h2>
        <p className="text-slate-400 mb-8">Report a peer's English speaking violation or note.</p>
        
        <div className="flex-1">
          {data.students.length > 0 ? (
            <PeerReportForm students={data.students} />
          ) : (
            <p className="text-slate-500 text-center py-8">No other students found.</p>
          )}
        </div>
      </div>

    </div>
  )
}
