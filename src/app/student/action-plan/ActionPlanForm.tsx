'use client'

import { useState } from 'react'
import { submitActionPlan } from './actions'
import { Check } from 'lucide-react'

export function ActionPlanForm({ groupedItems, loggedItemIds }: any) {
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
      const res = await submitActionPlan(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Action Plan updated successfully!
        </div>
      )}

      <div className="space-y-8">
        {Object.keys(groupedItems).map(category => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400 border-b border-slate-800 pb-2">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedItems[category].map((item: any) => {
                const isLogged = loggedItemIds.includes(item.id)
                return (
                  <label key={item.id} className={`flex items-start p-4 rounded-xl border transition-all cursor-pointer ${isLogged ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                    <div className="flex items-center h-5">
                      <input 
                        type="checkbox" 
                        name="item_id" 
                        value={item.id} 
                        defaultChecked={isLogged}
                        disabled={isLogged}
                        className="w-5 h-5 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900 disabled:opacity-50" 
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className={`font-medium ${isLogged ? 'text-emerald-400' : 'text-slate-300'}`}>{item.description}</span>
                      {isLogged && <p className="text-xs text-emerald-500/70 mt-1">Completed today</p>}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Action Plan'}
      </button>
    </form>
  )
}
