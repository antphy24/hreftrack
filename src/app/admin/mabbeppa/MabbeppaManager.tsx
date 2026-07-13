'use client'

import { useState, useRef } from 'react'
import { downloadCSV } from '@/utils/csv'
import { addArea, deleteArea, addIndicator, deleteIndicator, addAssignment, deleteAssignment, bulkAddMabbeppaAreas } from './actions'
import { Trash2, Download, Upload } from 'lucide-react'

export function MabbeppaManager({ areas, indicators, assignments, logs, students }: any) {
  const [activeTab, setActiveTab] = useState('areas')
  
  // Bulk Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Assignments Checkbox State
  const [selectedCleaners, setSelectedCleaners] = useState<string[]>([])

  const handleExportLogs = () => {
    const exportData = logs.map((log: any) => ({
      ID: log.id,
      Date: new Date(log.created_at).toLocaleString(),
      Area: log.mabbeppa_areas?.name || 'Unknown',
      Cleaner_Name: log.cleaner?.full_name || 'Unknown',
      Cleaner_NIS: log.cleaner?.nis || 'Unknown',
      Indicator: log.mabbeppa_indicators?.label || 'Unknown',
      Reporter_Name: log.reporter?.full_name || 'Unknown'
    }))
    downloadCSV(exportData, 'mabbeppa_logs.csv')
  }

  const downloadTemplate = () => {
    const template = 'Area Name,Cleaner NIS,Reporter NIS\nLibrary,2024001;2024002,2024003\nMain Hall,2024004,2024005'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mabbeppa_areas_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setImportError(null)
    const text = await file.text()
    
    try {
      const rows = text.split('\n').map(row => row.trim()).filter(row => row)
      const parsedRows = []
      
      let startIdx = 0
      if (rows[0].toLowerCase().includes('area name') || rows[0].toLowerCase().includes('area')) {
        startIdx = 1
      }

      for (let i = startIdx; i < rows.length; i++) {
        const parts = rows[i].split(',')
        if (parts.length >= 3) {
          parsedRows.push({
            areaName: parts[0].trim(),
            cleanerNis: parts[1].split(';').map(n => n.trim()).filter(n => n),
            reporterNis: parts[2].trim()
          })
        } else {
          throw new Error(`Row ${i + 1} is missing required columns.`)
        }
      }

      if (parsedRows.length > 0) {
        await bulkAddMabbeppaAreas(parsedRows)
        alert('Bulk import completed!')
        setIsImportModalOpen(false)
      } else {
        setImportError('No valid data found in CSV.')
      }
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse CSV file.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const toggleCleaner = (id: string) => {
    setSelectedCleaners(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {['areas', 'indicators', 'assignments', 'logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
              activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'areas' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <form action={addArea} className="flex gap-4 w-full md:w-auto flex-1">
                <input type="text" name="name" placeholder="New Area Name" required className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap">Add Area</button>
              </form>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium whitespace-nowrap"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Areas
                </button>
              </div>
            </div>
            
            <ul className="divide-y divide-slate-100 border rounded-lg">
              {areas.map((a: any) => (
                <li key={a.id} className="flex justify-between items-center p-4 hover:bg-slate-50">
                  <span className="font-medium">{a.name}</span>
                  <form action={deleteArea}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'indicators' && (
          <div className="space-y-6">
            <form action={addIndicator} className="flex gap-4">
              <input type="text" name="label" placeholder="New Indicator Label" required className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Add Indicator</button>
            </form>
            <ul className="divide-y divide-slate-100 border rounded-lg">
              {indicators.map((i: any) => (
                <li key={i.id} className="flex justify-between items-center p-4 hover:bg-slate-50">
                  <span className="font-medium">{i.label}</span>
                  <form action={deleteIndicator}>
                    <input type="hidden" name="id" value={i.id} />
                    <button type="submit" className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4" /></button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <form action={(formData) => {
              // Ensure all selected cleaners are included in formData
              selectedCleaners.forEach(id => formData.append('student_id', id))
              addAssignment(formData).then(() => setSelectedCleaners([]))
            }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Area</label>
                <select name="area_id" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select Area...</option>
                  {areas.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Cleaners</label>
                <div className="w-full border rounded-lg overflow-y-auto max-h-[150px] bg-white divide-y divide-slate-100">
                  {students.map((s: any) => (
                    <label key={s.id} className="flex items-center px-4 py-2 hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="mr-3 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        checked={selectedCleaners.includes(s.id)}
                        onChange={() => toggleCleaner(s.id)}
                      />
                      <span className="text-sm font-medium text-slate-700">{s.full_name} <span className="text-slate-400 font-normal">({s.nis})</span></span>
                    </label>
                  ))}
                </div>
                {selectedCleaners.length === 0 && <p className="text-xs text-red-500 mt-1">Select at least one cleaner.</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Reporter</label>
                <select name="reporter_id" required className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select Reporter...</option>
                  {students.map((s: any) => <option key={s.id} value={s.id}>{s.full_name} ({s.nis})</option>)}
                </select>
              </div>
              <div className="space-y-1 self-end pt-4 md:pt-0 flex items-end">
                <button type="submit" disabled={selectedCleaners.length === 0} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium h-[42px] disabled:opacity-50">Assign</button>
              </div>
            </form>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Area</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Cleaner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Reporter</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {assignments.map((a: any) => (
                    <tr key={a.id}>
                      <td className="px-4 py-3 text-sm">{a.mabbeppa_areas?.name}</td>
                      <td className="px-4 py-3 text-sm">{a.cleaner?.full_name}</td>
                      <td className="px-4 py-3 text-sm">{a.reporter?.full_name}</td>
                      <td className="px-4 py-3 text-right">
                        <form action={deleteAssignment}>
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={handleExportLogs} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Area</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Cleaner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Indicator</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Reported By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {logs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{log.mabbeppa_areas?.name}</td>
                      <td className="px-4 py-3 text-sm">{log.cleaner?.full_name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{log.mabbeppa_indicators?.label}</td>
                      <td className="px-4 py-3 text-sm">{log.reporter?.full_name}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Import Areas & Assignments</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Upload a CSV file containing Mabbeppa Areas and their assigned students. The file must have exactly three columns: <strong>Area Name, Cleaner NIS, Reporter NIS</strong>.
                <br/><br/>
                <em>Note: If you have multiple cleaners for one area, separate their NIS with a semicolon (;).</em>
              </p>
              
              <button onClick={downloadTemplate} className="text-sm text-blue-600 hover:text-blue-800 font-medium underline">
                Download Template CSV
              </button>

              {importError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                  {importError}
                </div>
              )}

              <div className="mt-4">
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="csv-upload-areas" disabled={isUploading} />
                <label htmlFor="csv-upload-areas" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-colors ${isUploading ? 'bg-slate-50 border-slate-200 cursor-wait' : 'border-slate-300 hover:bg-slate-50 hover:border-blue-400 cursor-pointer'}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                    <Upload className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm font-semibold">{isUploading ? 'Processing...' : 'Click to upload CSV'}</p>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="button" onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
