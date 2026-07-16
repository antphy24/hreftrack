import Link from 'next/link'
import { LayoutDashboard, PlusCircle, History } from 'lucide-react'
import { ReactNode } from 'react'

export default function CounselingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col bg-gray-50 min-h-[calc(100vh-8rem)] rounded-lg overflow-hidden border border-gray-200">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">Counseling Module</h1>
            <nav className="flex space-x-4">
              <Link
                href="/admin/dashboard/counseling"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/admin/dashboard/counseling/new-session"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">New Session</span>
              </Link>
              <Link
                href="/admin/dashboard/counseling/logs"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
