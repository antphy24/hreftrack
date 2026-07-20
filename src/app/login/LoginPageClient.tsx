'use client'

import { useState, useRef, useEffect } from 'react'
import { login, studentLogin } from './actions'
import { ArrowRight, Lock, Mail, User, Search, ChevronDown, Check } from 'lucide-react'
import { Logo } from '@/components/Logo'

export function LoginPageClient({ students = [] }: { students?: any[] }) {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student')
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAdminSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleStudentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    setIsLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await studentLogin(formData)
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

      <div className="relative w-full max-w-md px-8 py-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-visible">
        
        {/* Glow effect on hover/focus inside the card */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/0 opacity-0 transition-opacity duration-500 hover:opacity-100 pointer-events-none rounded-3xl"></div>

        <div className="relative z-10">
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="mb-4">
              <Logo className="text-3xl font-extrabold tracking-tight" iconClassName="w-10 h-10 mr-3" />
            </div>
            <p className="text-slate-400 text-sm font-medium">
              Select your role to continue.
            </p>
          </div>

          <div className="flex p-1 mb-8 bg-slate-900/50 rounded-xl border border-slate-800">
            <button
              onClick={() => { setActiveTab('student'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'student' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              Student
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'admin' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
            >
              Admin
            </button>
          </div>

          {activeTab === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Student Name</label>
                <SearchableStudentSelect options={students} />
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
                    placeholder="Enter your password"
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
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign In as Student
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Admin Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="admin@athirah.bone"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 shadow-inner"
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
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 transition-all duration-300 shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Sign In as Admin
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function SearchableStudentSelect({ options }: { options: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedNis, setSelectedNis] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(o => 
    (o?.full_name || '').toLowerCase().includes(search.toLowerCase())
  )
  const selectedOption = options.find(o => o.nis === selectedNis)

  return (
    <div className="relative w-full group" ref={wrapperRef}>
      <input type="hidden" name="nis" value={selectedNis} required />
      <div 
        className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer shadow-inner transition-all duration-300 hover:border-blue-500/50 flex justify-between items-center focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500"
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) setSearch('') }}
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
        </div>
        <span className={`text-base truncate ${selectedOption ? 'text-slate-200' : 'text-slate-500'}`}>
          {selectedOption ? (selectedOption.full_name || 'Unnamed Student') : 'Search your name...'}
        </span>
        <ChevronDown className="w-5 h-5 text-slate-500" />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-slate-700 flex items-center bg-slate-900/50">
            <Search className="w-5 h-5 text-slate-400 mr-3" />
            <input 
              type="text" 
              className="w-full outline-none bg-transparent text-slate-200 placeholder-slate-500" 
              placeholder="Type to search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-sm text-slate-400 text-center">No students found</div>
            ) : (
              filteredOptions.map((o) => (
                <div 
                  key={o.id} 
                  className={`px-4 py-3 text-sm cursor-pointer hover:bg-slate-700 flex justify-between items-center transition-colors ${selectedNis === o.nis ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-300'}`}
                  onClick={() => {
                    setSelectedNis(o.nis)
                    setIsOpen(false)
                    setSearch('')
                  }}
                >
                  <div className="flex flex-col">
                    <span>{o?.full_name || 'Unnamed Student'}</span>
                  </div>
                  {selectedNis === o.nis && <Check className="w-5 h-5 text-blue-400" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
