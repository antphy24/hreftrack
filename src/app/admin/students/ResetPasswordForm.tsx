'use client'

import { useState } from 'react'
import { Key } from 'lucide-react'
import { updateStudentPassword } from './actions'
import { ConfirmModal } from '@/components/ConfirmModal'
import { AlertModal } from '@/components/AlertModal'

export function ResetPasswordForm({ studentId, studentName }: { studentId: string, studentName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    const formData = new FormData()
    formData.append('id', studentId)
    
    try {
      const res = await updateStudentPassword(formData)
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        setSuccess(true)
        setAlertMessage('Password reset successfully! Their password is now their NIS.')
        setIsOpen(false)
        setSuccess(false)
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

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Reset Password"
        description={
          <div className="space-y-4">
            <p>
              Are you sure you want to reset <span className="font-semibold text-slate-800 dark:text-white">{studentName}</span>'s password to their NIS?
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
          </div>
        }
        confirmText="Reset Password"
        isLoading={isLoading}
      />

      <AlertModal 
        isOpen={!!alertMessage}
        onClose={() => setAlertMessage(null)}
        title="Success"
        description={alertMessage}
      />
    </>
  )
}
