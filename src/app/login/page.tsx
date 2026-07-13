'use client'

import { useState } from 'react'
import { login } from './actions'
import { ArrowRight, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await login(formData)
      if (res?.error) {
        setError(res.error)
        setIsLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-md px-8 py-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Glow effect on hover/focus inside the card */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/0 opacity-0 transition-opacity duration-500 hover:opacity-100 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 tracking-tight">
              Welcome to HreFTrack
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="student@example.com"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 shadow-inner"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-300 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign In
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
