'use client'

import { useState, useRef, useEffect } from 'react'
import { submitPeerReport } from './actions'
import { Check, Search, ChevronDown } from 'lucide-react'

export function PeerReportForm({ students }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Custom Searchable Select State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredStudents = students.filter((s: any) => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nis.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedStudent = students.find((s: any) => s.id === selectedStudentId)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedStudentId) {
      setError('Please select a student to report.')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)
    
    const form = e.currentTarget
    const formData = new FormData(form)
    
    try {
      const res = await submitPeerReport(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setSelectedStudentId('')
        setSearchTerm('')
        form.reset()
      }
    } catch (err: any) {
      setError(`An unexpected client error occurred: ${err.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Peer report submitted successfully!
        </div>
      )}

      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-slate-300 mb-2">Select Peer</label>
        
        {/* Hidden input to ensure form submission includes the student ID */}
        <input type="hidden" name="reported_student_id" value={selectedStudentId} required />
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name or NIS..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsDropdownOpen(true)
              setSelectedStudentId('') // Clear selection if user starts typing again
            }}
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500"
            required={!selectedStudentId}
          />
          {selectedStudentId && (
            <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
          )}
        </div>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden">
            <ul className="max-h-60 overflow-y-auto py-2">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s: any) => (
                  <li 
                    key={s.id} 
                    onClick={() => {
                      setSelectedStudentId(s.id)
                      setSearchTerm(`${s.full_name} (${s.nis})`)
                      setIsDropdownOpen(false)
                    }}
                    className={`px-4 py-3 cursor-pointer text-sm transition-colors ${selectedStudentId === s.id ? 'bg-purple-600/20 text-purple-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {s.full_name} <span className="text-slate-500 ml-1">({s.nis})</span>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4 text-center text-slate-500 text-sm">
                  No students found matching "{searchTerm}"
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-300 mb-2">Notes / Description</label>
        <textarea 
          name="notes" 
          required 
          rows={4}
          className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none h-32 placeholder-slate-600"
          placeholder="Describe the incident or reason for report..."
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={isLoading || !selectedStudentId}
        className="w-full py-4 bg-slate-800 border border-purple-500/50 hover:bg-purple-600 hover:border-purple-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 mt-auto"
      >
        {isLoading ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  )
}
