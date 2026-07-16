import { ReactNode } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, CheckSquare, MessageSquare, ClipboardList, HeartHandshake } from 'lucide-react'
import { SignOutButton } from '@/components/SignOutButton'
import { Logo } from '@/components/Logo'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Logo />
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link href="/admin/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5 mr-3 text-blue-400" />
            Dashboard
          </Link>
          <Link href="/admin/students" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="w-5 h-5 mr-3 text-indigo-400" />
            Students
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Portals</p>
          </div>
          <Link href="/admin/mabbeppa" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <ClipboardList className="w-5 h-5 mr-3 text-teal-400" />
            Mabbeppa
          </Link>
          <Link href="/admin/action-plan" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <CheckSquare className="w-5 h-5 mr-3 text-emerald-400" />
            Action Plan
          </Link>
          <Link href="/admin/english-hours" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <MessageSquare className="w-5 h-5 mr-3 text-purple-400" />
            English Hours
          </Link>
          <Link href="/admin/dashboard/counseling" className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <HeartHandshake className="w-5 h-5 mr-3 text-pink-400" />
            Counseling
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm z-10">
          <h1 className="text-xl font-semibold text-slate-800">Admin Dashboard</h1>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  )
}
