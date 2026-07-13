import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2 } from 'lucide-react'
import { deleteStudent } from './actions'
import { AddStudentForm } from './AddStudentForm'
import { BulkAddStudentsForm } from './BulkAddStudentsForm'
import { ResetPasswordForm } from './ResetPasswordForm'

async function StudentsList() {
  const supabase = createClient()
  
  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">NIS</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Credentials</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {students?.map((student) => (
            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.full_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.nis}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{student.nis}@student.local</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {new Date(student.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <ResetPasswordForm studentId={student.id} studentName={student.full_name} />
                  <form action={deleteStudent}>
                    <input type="hidden" name="id" value={student.id} />
                    <button type="submit" title="Delete Student" className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
          {(!students || students.length === 0) && (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                No students found. Add one to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function StudentsSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-50 border-b border-slate-200"></div>
      <div className="divide-y divide-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex px-6 py-4 space-x-4">
            <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
            <div className="w-1/6 h-4 bg-slate-200 rounded"></div>
            <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
            <div className="w-1/6 h-4 bg-slate-200 rounded"></div>
            <div className="w-1/12 h-4 bg-slate-200 rounded ml-auto"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Students Management</h2>
          <p className="text-sm text-slate-500 mt-1">Add, view, or remove student accounts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <BulkAddStudentsForm />
          <AddStudentForm />
        </div>
      </div>

      <Suspense fallback={<StudentsSkeleton />}>
        <StudentsList />
      </Suspense>
    </div>
  )
}
