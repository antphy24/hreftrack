'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logCounselingSession, StudentProfile } from '@/lib/actions/counseling'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function SessionForm({ students }: { students: StudentProfile[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const student_search = formData.get('student_search') as string
    
    // Find the student name
    const selectedStudent = students.find(s => `${s.full_name} (${s.nis || 'No NIS'})` === student_search)
    
    if (!selectedStudent) {
      setError("Please select a valid student from the list.")
      setIsSubmitting(false)
      return
    }

    const student_id = selectedStudent.id
    const student_name = selectedStudent.full_name
    
    const grade_level = parseInt(formData.get('grade_level') as string, 10)
    const class_section = formData.get('class_section') as string
    
    const date = formData.get('date') as string
    const category = formData.get('category') as string
    const intervention_type = formData.get('intervention_type') as string
    const notes = formData.get('notes') as string
    const requires_followup = formData.get('requires_followup') === 'on'

    try {
      await logCounselingSession({
        student_id,
        student_name,
        grade_level,
        class_section,
        date,
        category,
        intervention_type,
        notes,
        requires_followup
      })
      setSuccess(true)
      e.currentTarget.reset()
      // Optional: router.push('/admin/dashboard/counseling/logs')
    } catch (err: any) {
      setError(err.message || 'An error occurred while logging the session.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Log New Counseling Session</h2>
      
      {success && (
        <div className="mb-6 bg-green-50 p-4 rounded-md flex items-start">
          <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
          <p className="text-sm text-green-800">Session successfully logged!</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="student_search" className="block text-sm font-medium text-gray-700">Student</label>
          <input
            list="student_options"
            id="student_search"
            name="student_search"
            required
            autoComplete="off"
            placeholder="Type to search students..."
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <datalist id="student_options">
            {students.map(s => (
              <option key={s.id} value={`${s.full_name} (${s.nis || 'No NIS'})`} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="grade_level" className="block text-sm font-medium text-gray-700">Grade</label>
            <select
              name="grade_level"
              id="grade_level"
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            >
              <option value="">Select grade...</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
          </div>
          <div>
            <label htmlFor="class_section" className="block text-sm font-medium text-gray-700">Class</label>
            <select
              name="class_section"
              id="class_section"
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            >
              <option value="">Select class...</option>
              <option value="Al Fattah">Al Fattah</option>
              <option value="Al Majid">Al Majid</option>
              <option value="Al Alim">Al Alim</option>
              <option value="Al Hakam">Al Hakam</option>
              <option value="Al Hasib">Al Hasib</option>
              <option value="Al Hamid">Al Hamid</option>
              <option value="Al Hafidz">Al Hafidz</option>
              <option value="Al Halim">Al Halim</option>
              <option value="Al Wajid">Al Wajid</option>
              <option value="Al Hadi">Al Hadi</option>
              <option value="Al Wahid">Al Wahid</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              name="category"
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            >
              <option value="">Select category...</option>
              <option value="Academic">Academic</option>
              <option value="Career">Career</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div>
            <label htmlFor="intervention_type" className="block text-sm font-medium text-gray-700">Intervention Type</label>
            <select
              id="intervention_type"
              name="intervention_type"
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
            >
              <option value="">Select intervention...</option>
              <option value="1-on-1">1-on-1</option>
              <option value="Group">Group</option>
              <option value="Parent Meeting">Parent Meeting</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Private)</label>
          <div className="mt-1">
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md px-3 py-2"
              placeholder="Session details..."
            />
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="requires_followup"
              name="requires_followup"
              type="checkbox"
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="requires_followup" className="font-medium text-gray-700">
              Requires Follow-up
            </label>
            <p className="text-gray-500">Check if this student needs another session or further action.</p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Logging...' : 'Log Session'}
          </button>
        </div>
      </form>
    </div>
  )
}
