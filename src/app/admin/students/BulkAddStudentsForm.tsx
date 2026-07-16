'use client'

import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { bulkCreateStudents } from './actions'
import { Modal } from '@/components/Modal'
import { parseCSV } from '@/utils/csv'

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
        const lines = parseCSV(text)
        
        if (lines.length < 2) {
          throw new Error('CSV file is empty or missing data rows.')
        }

        const students = lines.slice(1).map((parts, index) => {
          if (parts.length < 2) {
            throw new Error(`Row ${index + 2} is missing required columns (Name, NIS).`)
          }
          return {
            fullName: parts[0],
            nis: parts[1]
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
    const template = 'Full Name,NIS\nJohn Doe,12345\nJane Smith,67890'
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

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Bulk Add Students" maxWidth="max-w-lg">
        <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Upload a CSV file containing student information. The file must have a header row and two columns exactly in this order: <strong>Full Name, NIS</strong>.
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

              <div className="mt-6">
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
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl transition-all ${
                    isLoading 
                      ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 cursor-wait' 
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer shadow-sm'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 dark:text-slate-400">
                    <Upload className="w-10 h-10 mb-4 text-slate-400 dark:text-slate-500" />
                    <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {isLoading ? 'Processing...' : 'Click to upload CSV'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-6 flex justify-end border-t border-slate-100 dark:border-slate-800/50 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  Close
                </button>
              </div>
        </div>
      </Modal>
    </>
  )
}
