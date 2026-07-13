import { ReactNode } from 'react'
import Link from 'next/link'
import { LayoutDashboard, CheckSquare, MessageSquare, ClipboardList, LogOut } from 'lucide-react'

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-white text-lg font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">HreFTrack</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link href="/student/dashboard" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white transition-all group">
            <LayoutDashboard className="w-5 h-5 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Tasks</p>
          </div>
          <Link href="/student/mabbeppa" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white transition-all group">
            <ClipboardList className="w-5 h-5 mr-3 text-teal-400 group-hover:scale-110 transition-transform" />
            Mabbeppa Report
          </Link>
          <Link href="/student/action-plan" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white transition-all group">
            <CheckSquare className="w-5 h-5 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
            Action Plan
          </Link>
          <Link href="/student/english-hours" className="flex items-center px-4 py-3 text-sm font-medium rounded-xl hover:bg-slate-800 hover:text-white transition-all group">
            <MessageSquare className="w-5 h-5 mr-3 text-purple-400 group-hover:scale-110 transition-transform" />
            English Hours
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group">
              <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Decorative Background */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>

        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center px-8 z-10 sticky top-0">
          <h1 className="text-xl font-semibold text-white">Student Dashboard</h1>
        </header>
        <div className="flex-1 overflow-auto p-8 z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
