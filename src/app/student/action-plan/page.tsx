'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ActionPlanForm } from './ActionPlanForm'

export default function StudentActionPlanPage() {
  const [data, setData] = useState<{ groupedItems: any, loggedItemIds: any[] } | null>(null)
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

      const { data: items } = await supabase
        .from('adab_items')
        .select('id, description, adab_categories(id, name)')
        .eq('is_active', true)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: todaysLogs } = await supabase
        .from('adab_logs')
        .select('item_id')
        .eq('student_id', user.id)
        .gte('created_at', today.toISOString())

      const loggedItemIds = todaysLogs?.map(log => log.item_id) || []

      const groupedItems = items?.reduce((acc: any, item: any) => {
        const catName = item.adab_categories?.name || 'Uncategorized'
        if (!acc[catName]) acc[catName] = []
        acc[catName].push({ id: item.id, description: item.description })
        return acc
      }, {}) || {}

      setData({ groupedItems, loggedItemIds })
      setLoading(false)
    }
    
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading action plan...</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Daily Action Plan</h2>
        <p className="text-slate-400 mb-8">Check off the Adab items you have practiced today.</p>
        
        {Object.keys(data.groupedItems).length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No active Adab items available.
          </div>
        ) : (
          <ActionPlanForm groupedItems={data.groupedItems} loggedItemIds={data.loggedItemIds} />
        )}
      </div>
    </div>
  )
}
