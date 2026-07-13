'use client'

import { useState } from 'react'
import { Key } from 'lucide-react'
import { updateStudentPassword } from './actions'

export function ResetPasswordForm({ studentId, studentName }: { studentId: string, studentName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await updateStudentPassword(formData)
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        setSuccess(true)
        setTimeout(() => setIsOpen(false), 2000)
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
        onClick={() => {
          setIsOpen(true)
          setSuccess(false)
          setError(null)
        }}
        title="Reset Password"
        className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <Key className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
              <input type="hidden" name="id" value={studentId} />
              
              <p className="text-sm text-slate-600 mb-4">
                Enter a new password for <span className="font-semibold text-slate-800">{studentName}</span>.
              </p>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 text-sm font-medium border border-emerald-100">
                  Password updated successfully!
                </div>
              )}
              
              {!success && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    required 
                    minLength={6}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow text-slate-800"
                  />
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                {!success && (
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
