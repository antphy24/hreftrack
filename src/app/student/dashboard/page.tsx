'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, CheckSquare, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

function StudentDashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 h-48"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-800 h-64 rounded-3xl border border-slate-700"></div>
        ))}
      </div>
    </div>
  )
}

function StudentDashboardData() {
  const [profile, setProfile] = useState<{ full_name: string, nis: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('full_name, nis').eq('id', session.user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <StudentDashboardSkeleton />

  const cards = [
    { 
      title: 'Mabbeppa Report', 
      desc: 'Submit your cleaning duty report.',
      icon: ClipboardList, 
      href: '/student/mabbeppa',
      color: 'text-teal-400',
      bg: 'bg-teal-400/10',
      border: 'border-teal-500/20',
      hover: 'hover:border-teal-500/50'
    },
    { 
      title: 'Action Plan', 
      desc: 'Check off your daily Adab items.',
      icon: CheckSquare, 
      href: '/student/action-plan',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-500/20',
      hover: 'hover:border-emerald-500/50'
    },
    { 
      title: 'English Hours', 
      desc: 'Submit speaking practice or report peers.',
      icon: MessageSquare, 
      href: '/student/english-hours',
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      border: 'border-purple-500/20',
      hover: 'hover:border-purple-500/50'
    },
  ]

  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {profile?.full_name || 'Student'}!</h2>
          <p className="text-slate-400">NIS: {profile?.nis}</p>
          <p className="text-slate-300 mt-4 max-w-xl text-lg">
            Complete your daily reports and tracking below. Make sure to submit your Action Plan every day.
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <Link key={idx} href={card.href} className={`group bg-slate-900 rounded-3xl p-6 border ${card.border} ${card.hover} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden flex flex-col h-full`}>
            <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
              <card.icon className={`w-7 h-7 ${card.color}`} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
            <p className="text-slate-400 text-sm flex-1">{card.desc}</p>
            <div className="mt-6 flex items-center text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
              Go to Portal <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

export default function StudentDashboard() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <StudentDashboardData />
    </div>
  )
}
