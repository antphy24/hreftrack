'use client'

import { useState } from 'react'
import { submitMabbeppaLog } from './actions'
import { Check } from 'lucide-react'

export function MabbeppaReportForm({ assignments, indicators }: any) {
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
      const res = await submitMabbeppaLog(formData)
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
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Report submitted successfully!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Select Assignment (Area & Cleaner)</label>
        <select 
          name="assignment_id" 
          required 
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Choose...</option>
          {assignments.map((a: any) => (
            <option key={a.id} value={a.id}>
              {a.area?.name} - {a.cleaner?.full_name} ({a.cleaner?.nis})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Indicator Status</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {indicators.map((ind: any) => (
            <label key={ind.id} className="cursor-pointer">
              <input type="radio" name="indicator_id" value={ind.id} required className="peer sr-only" />
              <div className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-center peer-checked:bg-teal-500/20 peer-checked:border-teal-500 peer-checked:text-teal-400 transition-all font-medium">
                {ind.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  )
}
