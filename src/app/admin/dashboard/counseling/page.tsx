import { getCounselingAnalytics } from '@/lib/actions/counseling'
import CategoryChart from './components/CategoryChart'
import { AlertCircle, FileText } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CounselingDashboard() {
  const analytics = await getCounselingAnalytics()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                <dd className="text-2xl font-semibold text-gray-900">{analytics.totalSessions}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Open Follow-ups</dt>
                <dd className="text-2xl font-semibold text-gray-900">{analytics.followupStudents.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sessions by Category</h2>
          <CategoryChart data={analytics.categoryCounts} />
        </div>

        <div className="bg-white shadow rounded-lg p-6 flex flex-col">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Students Needing Follow-up</h2>
          {analytics.followupStudents.length > 0 ? (
            <ul className="divide-y divide-gray-200 h-64 overflow-y-auto pr-2">
              {analytics.followupStudents.map((student) => (
                <li key={student.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{student.student_name}</span>
                    <span className="text-sm text-gray-500">{student.category}</span>
                  </div>
                  <Link
                    href={`/admin/dashboard/counseling/logs?student_id=${student.student_id}`}
                    className="mt-2 sm:mt-0 px-3 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    View Record
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-300">
              No students currently need follow-up.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
