'use client'

import { useState } from 'react'
import { KeyRound, ArrowRight } from 'lucide-react'
import { changePassword } from './actions'
import { isRedirectError } from 'next/dist/client/components/redirect'

export default function ChangePasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await changePassword(formData)
      if (res?.error) {
        setError(res.error)
        setIsLoading(false)
      }
    } catch (err) {
      if (isRedirectError(err)) {
        throw err
      }
      setError('An unexpected error occurred.')
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative">
        {/* Glow effect */}
        <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-blue-500 rounded-full mix-blend-screen filter blur-[64px] opacity-20 pointer-events-none"></div>

        <div className="p-8 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">Change Password</h2>
          <p className="text-slate-400 text-sm text-center mb-8">
            You are required to change your password before proceeding to your dashboard. Please choose a new secure password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
              <input 
                type="password" 
                name="password" 
                required 
                minLength={8}
                placeholder="Enter new password"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                required 
                minLength={8}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-shadow"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="group w-full flex justify-center items-center py-3 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : (
                <span className="flex items-center">
                  Update Password
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
