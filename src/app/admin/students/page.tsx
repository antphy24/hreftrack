import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2 } from 'lucide-react'
import { deleteStudent, deleteAllStudents } from './actions'
import { AddStudentForm } from './AddStudentForm'
import { BulkAddStudentsForm } from './BulkAddStudentsForm'
import { ResetPasswordForm } from './ResetPasswordForm'
import { DeleteFormButton } from '@/components/DeleteFormButton'

async function StudentsList({ currentPage }: { currentPage: number }) {
  const supabase = createClient()
  const ITEMS_PER_PAGE = 10
  const from = (currentPage - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1
  
  const { data: students, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'student')
    .order('created_at', { ascending: false })
    .range(from, to)
    
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE)

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
                <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{student.nis}@athirah.bone</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {new Date(student.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <ResetPasswordForm studentId={student.id} studentName={student.full_name} />
                  <form action={deleteStudent}>
                    <input type="hidden" name="id" value={student.id} />
                    <DeleteFormButton title="Delete Student" description={`Are you sure you want to delete ${student.full_name}? This action cannot be undone.`} />
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
      {totalPages > 1 && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium">{from + 1}</span> to <span className="font-medium">{Math.min(to + 1, count || 0)}</span> of <span className="font-medium">{count}</span> students
          </div>
          <div className="flex space-x-2">
            {currentPage > 1 ? (
              <Link href={`/admin/students?page=${currentPage - 1}`} className="px-3 py-1 bg-white border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Previous</Link>
            ) : (
              <button disabled className="px-3 py-1 bg-slate-100 border border-slate-200 rounded text-sm text-slate-400 cursor-not-allowed">Previous</button>
            )}
            {currentPage < totalPages ? (
              <Link href={`/admin/students?page=${currentPage + 1}`} className="px-3 py-1 bg-white border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50">Next</Link>
            ) : (
              <button disabled className="px-3 py-1 bg-slate-100 border border-slate-200 rounded text-sm text-slate-400 cursor-not-allowed">Next</button>
            )}
          </div>
        </div>
      )}
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

export default function StudentsPage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = parseInt(searchParams.page || '1')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Students Management</h2>
          <p className="text-sm text-slate-500 mt-1">Add, view, or remove student accounts.</p>
        </div>
        <div className="flex items-center space-x-3">
          <form action={deleteAllStudents}>
            <DeleteFormButton 
              title="Delete All Students" 
              description="Are you sure you want to delete all students? This action cannot be undone and will permanently remove all student accounts."
              className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200"
              icon={<><Trash2 className="w-4 h-4" /><span>Delete All</span></>}
            />
          </form>
          <BulkAddStudentsForm />
          <AddStudentForm />
        </div>
      </div>

      <Suspense fallback={<StudentsSkeleton />} key={currentPage}>
        <StudentsList currentPage={currentPage} />
      </Suspense>
    </div>
  )
}
