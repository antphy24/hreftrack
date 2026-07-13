'use client'

import { useState } from 'react'
import { submitSelfLog } from './actions'
import { Check } from 'lucide-react'

export function EnglishHoursForm({ statements, loggedStatementIds }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await submitSelfLog(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        e.currentTarget.reset()
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Practice logged successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Select Statement</label>
        <div className="space-y-3">
          {statements.map((stmt: any) => {
            const isLogged = loggedStatementIds.includes(stmt.id)
            return (
              <label key={stmt.id} className={`flex items-start p-4 rounded-xl border transition-all cursor-pointer ${isLogged ? 'bg-purple-500/10 border-purple-500/30' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                <div className="flex items-center h-5">
                  <input 
                    type="radio" 
                    name="statement_id" 
                    value={stmt.id} 
                    required 
                    disabled={isLogged}
                    className="w-5 h-5 border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900 disabled:opacity-50" 
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className={`font-medium ${isLogged ? 'text-purple-400' : 'text-slate-300'}`}>{stmt.statement}</span>
                  {isLogged && <p className="text-xs text-purple-500/70 mt-1">Logged today</p>}
                </div>
              </label>
            )
          })}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 mt-auto"
      >
        {isLoading ? 'Submitting...' : 'Log Practice'}
      </button>
    </form>
  )
}
