'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createStudent } from './actions'

export function AddStudentForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await createStudent(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Student
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Add New Student</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="fullName" 
                  required 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIS (Student ID)</label>
                <input 
                  type="text" 
                  name="nis" 
                  required 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
