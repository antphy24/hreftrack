'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createStudent } from './actions'
import { Modal } from '@/components/Modal'
import { AlertModal } from '@/components/AlertModal'

export function AddStudentForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
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
        setAlertMessage('Student created successfully! Their initial password is their NIS.')
        setIsOpen(false)
      }
    } catch {
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Student">
        <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <input 
                type="text" 
                name="fullName" 
                required 
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                NIS
              </label>
              <input 
                type="text" 
                name="nis" 
                required 
                placeholder="e.g. 2024001"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 shadow-sm"
              />
            </div>

              <div className="pt-6 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800/50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all shadow-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isLoading ? 'Creating...' : 'Create Student'}
                </button>
              </div>
        </form>
      </Modal>

      <AlertModal 
        isOpen={!!alertMessage}
        onClose={() => setAlertMessage(null)}
        title="Success"
        description={alertMessage}
      />
    </>
  )
}
