'use client'

import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { bulkCreateStudents } from './actions'

export function BulkAddStudentsForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<{ successCount: number, errors: string[] } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)
    setResults(null)

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string
        const lines = text.split('\n').map(line => line.trim()).filter(line => line)
        
        if (lines.length < 2) {
          throw new Error('CSV file is empty or missing data rows.')
        }

        // Assuming basic CSV format without complex quoting
        const students = lines.slice(1).map((line, index) => {
          const parts = line.split(',').map(p => p.trim())
          if (parts.length < 3) {
            throw new Error(`Row ${index + 2} is missing required columns (Name, NIS, Password).`)
          }
          return {
            fullName: parts[0],
            nis: parts[1],
            password: parts[2]
          }
        })

        const res = await bulkCreateStudents(students)
        setResults(res)
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV file.')
      } finally {
        setIsLoading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    reader.onerror = () => {
      setError('Failed to read file.')
      setIsLoading(false)
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const template = 'Full Name,NIS,Password\nJohn Doe,12345,password123\nJane Smith,67890,password456'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <button 
        onClick={() => {
          setIsOpen(true)
          setError(null)
          setResults(null)
        }}
        className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors shadow-sm"
      >
        <Upload className="w-4 h-4 mr-2" />
        Import Students
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Bulk Add Students</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Upload a CSV file containing student information. The file must have a header row and three columns exactly in this order: <strong>Full Name, NIS, Password</strong>.
              </p>
              
              <button 
                onClick={downloadTemplate}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Download Template CSV
              </button>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              {results && (
                <div className={`p-4 rounded-lg border ${results.errors.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <h4 className={`font-semibold ${results.errors.length > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                    Import Complete
                  </h4>
                  <p className={`text-sm mt-1 ${results.errors.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    Successfully created {results.successCount} student(s).
                  </p>
                  
                  {results.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-amber-800 mb-1">Errors ({results.errors.length}):</p>
                      <ul className="text-xs text-amber-700 list-disc list-inside max-h-32 overflow-y-auto space-y-1">
                        {results.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <input 
                  type="file" 
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                  disabled={isLoading}
                />
                <label 
                  htmlFor="csv-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-colors
                    ${isLoading ? 'bg-slate-50 border-slate-200 cursor-wait' : 'border-slate-300 hover:bg-slate-50 hover:border-blue-400 cursor-pointer'}
                  `}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                    <Upload className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm font-semibold">
                      {isLoading ? 'Processing...' : 'Click to upload CSV'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
