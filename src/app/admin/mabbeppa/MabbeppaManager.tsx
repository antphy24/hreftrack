/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client'

import { useState, useRef, useEffect } from 'react'
import { downloadCSV, parseCSV } from '@/utils/csv'
import { addArea, deleteArea, updateArea, addIndicator, deleteIndicator, updateIndicator, addAssignment, deleteAssignment, bulkAddMabbeppaAreas } from './actions'
import { Trash2, Download, Upload, Search, X, Check, ChevronDown, Edit2 } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { AlertModal } from '@/components/AlertModal'
import { DeleteFormButton } from '@/components/DeleteFormButton'
export function MabbeppaManager({ areas, indicators, assignments, logs, students }: any) {
  const [activeTab, setActiveTab] = useState('areas')
  const [editingArea, setEditingArea] = useState<string | null>(null)
  const [editingIndicator, setEditingIndicator] = useState<string | null>(null)
  
  // Bulk Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Assignments State
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedCleaners, setSelectedCleaners] = useState<string[]>([])
  const [selectedReporter, setSelectedReporter] = useState('')

  const areaOptions = areas.map((a: any) => ({ value: a.id, label: a.name }))
  const studentOptions = students.map((s: any) => ({ value: s.id, label: `${s.full_name} (${s.nis})` }))

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
      const lines = parseCSV(text)
      if (lines.length < 2) throw new Error('File is empty or missing headers')

      const parsedRows = lines.slice(1).map((parts, index) => {
        if (parts.length < 3) throw new Error(`Row ${index + 2} is missing required columns.`)
        
        const cleaners = parts[1].split(';').map(n => n.trim()).filter(n => n)
        return {
          areaName: parts[0],
          cleanerNis: cleaners,
          reporterNis: parts[2]
        }
      })

      if (parsedRows.length > 0) {
        await bulkAddMabbeppaAreas(parsedRows)
        setAlertMessage('Bulk import completed!')
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
                  {editingArea === a.id ? (
                    <form action={(formData) => { updateArea(formData).then(() => setEditingArea(null)) }} className="flex w-full gap-2 items-center">
                      <input type="hidden" name="id" value={a.id} />
                      <input type="text" name="name" defaultValue={a.name} required className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                      <button type="submit" className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"><Check className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setEditingArea(null)} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"><X className="w-4 h-4" /></button>
                    </form>
                  ) : (
                    <>
                      <span className="font-medium">{a.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingArea(a.id)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit2 className="w-4 h-4" /></button>
                        <form action={deleteArea}>
                          <input type="hidden" name="id" value={a.id} />
                          <DeleteFormButton title="Delete Area" description={`Are you sure you want to delete "${a.name}"? This action cannot be undone.`} />
                        </form>
                      </div>
                    </>
                  )}
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
                  {editingIndicator === i.id ? (
                    <form action={(formData) => { updateIndicator(formData).then(() => setEditingIndicator(null)) }} className="flex w-full gap-2 items-center">
                      <input type="hidden" name="id" value={i.id} />
                      <input type="text" name="label" defaultValue={i.label} required className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                      <button type="submit" className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"><Check className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setEditingIndicator(null)} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"><X className="w-4 h-4" /></button>
                    </form>
                  ) : (
                    <>
                      <span className="font-medium">{i.label}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingIndicator(i.id)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit2 className="w-4 h-4" /></button>
                        <form action={deleteIndicator}>
                          <input type="hidden" name="id" value={i.id} />
                          <DeleteFormButton title="Delete Indicator" description={`Are you sure you want to delete "${i.label}"?`} />
                        </form>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <form action={(formData) => {
              if (!selectedArea || selectedCleaners.length === 0 || !selectedReporter) {
                 setAlertMessage("Please fill all required fields")
                 return
              }
              // Ensure all selected cleaners are included in formData
              selectedCleaners.forEach(id => formData.append('student_id', id))
              addAssignment(formData).then(() => {
                setSelectedArea('')
                setSelectedCleaners([])
                setSelectedReporter('')
              })
            }} className="flex flex-col gap-4 max-w-xl">
              <div className="space-y-1 w-full">
                <label className="text-xs font-semibold text-slate-500 uppercase">Area</label>
                <SearchableSelect 
                  name="area_id"
                  options={areaOptions} 
                  value={selectedArea} 
                  onChange={setSelectedArea} 
                  placeholder="Select Area..." 
                />
              </div>
              
              <div className="space-y-1 w-full">
                <label className="text-xs font-semibold text-slate-500 uppercase">Cleaners</label>
                <SearchableMultiSelect 
                  options={studentOptions} 
                  values={selectedCleaners} 
                  onChange={setSelectedCleaners} 
                  placeholder="Select Cleaners..." 
                />
                {selectedCleaners.length === 0 && <p className="text-xs text-red-500 mt-1">Select at least one cleaner.</p>}
              </div>

              <div className="space-y-1 w-full">
                <label className="text-xs font-semibold text-slate-500 uppercase">Reporter</label>
                <SearchableSelect 
                  name="reporter_id"
                  options={studentOptions} 
                  value={selectedReporter} 
                  onChange={setSelectedReporter} 
                  placeholder="Select Reporter..." 
                />
              </div>
              <div className="pt-2 w-full">
                <button type="submit" disabled={selectedCleaners.length === 0 || !selectedArea || !selectedReporter} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium h-[42px] disabled:opacity-50">Assign</button>
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
                          <DeleteFormButton title="Delete Assignment" description="Are you sure you want to remove this assignment?" />
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

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Areas & Assignments" maxWidth="max-w-lg">
        <div className="space-y-4">
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
      </Modal>

      <AlertModal 
        isOpen={!!alertMessage}
        onClose={() => setAlertMessage(null)}
        title="Alert"
        description={alertMessage}
      />
    </div>
  )
}

function SearchableSelect({ options, value, onChange, placeholder, name }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
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

  const filteredOptions = options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()))
  const selectedOption = options.find((o: any) => o.value === value)

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input type="hidden" name={name} value={value} />
      <div 
        className="w-full px-4 py-2 border rounded-lg bg-white flex justify-between items-center cursor-pointer min-h-[42px] hover:border-blue-400 transition-colors"
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) setSearch('') }}
      >
        <span className={`text-sm ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-xl">
          <div className="p-2 border-b flex items-center bg-slate-50 rounded-t-lg">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              className="w-full outline-none text-sm bg-transparent" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-slate-500 text-center">No results found</div>
            ) : (
              filteredOptions.map((o: any) => (
                <div 
                  key={o.value} 
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 flex justify-between items-center ${value === o.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                  onClick={() => {
                    onChange(o.value)
                    setIsOpen(false)
                    setSearch('')
                  }}
                >
                  {o.label}
                  {value === o.value && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchableMultiSelect({ options, values, onChange, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
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

  const filteredOptions = options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()))
  
  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v: string) => v !== val))
    } else {
      onChange([...values, val])
    }
  }

  const removeValue = (e: any, val: string) => {
    e.stopPropagation()
    onChange(values.filter((v: string) => v !== val))
  }

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="w-full px-2 py-1.5 border rounded-lg bg-white flex flex-wrap gap-1.5 items-center cursor-text min-h-[42px] hover:border-blue-400 transition-colors"
        onClick={() => { setIsOpen(true) }}
      >
        {values.length === 0 && search === '' && (
          <span className="text-sm text-slate-500 px-2 absolute pointer-events-none">{placeholder}</span>
        )}
        {values.map((v: string) => {
          const opt = options.find((o: any) => o.value === v)
          if (!opt) return null
          return (
            <span key={v} className="bg-blue-50 border border-blue-100 text-blue-700 text-xs px-2 py-1 rounded flex items-center font-medium">
              {opt.label}
              <button type="button" onClick={(e) => removeValue(e, v)} className="ml-1.5 hover:text-blue-900 focus:outline-none">
                <X className="w-3 h-3" />
              </button>
            </span>
          )
        })}
        <input 
          type="text" 
          className="flex-1 min-w-[60px] outline-none text-sm px-1 bg-transparent z-10 relative" 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}>
           <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-xl">
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-slate-500 text-center">No results found</div>
            ) : (
              filteredOptions.map((o: any) => (
                <label 
                  key={o.value} 
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center ${values.includes(o.value) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700'}`}
                >
                  <input 
                    type="checkbox" 
                    className="mr-3 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    checked={values.includes(o.value)}
                    onChange={() => toggleValue(o.value)}
                  />
                  {o.label}
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
