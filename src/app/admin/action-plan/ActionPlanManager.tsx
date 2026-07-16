/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client'

import { useState, useRef } from 'react'
import { downloadCSV } from '@/utils/csv'
import { addCategory, deleteCategory, updateCategory, addItem, deleteItem, updateItem, toggleItemActive, bulkAddAdabItems } from './actions'
import { parseCSV } from '@/utils/csv'
import { Trash2, Download, Power, PowerOff, Upload, Edit2, X, Check } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { AlertModal } from '@/components/AlertModal'
import { DeleteFormButton } from '@/components/DeleteFormButton'

export function ActionPlanManager({ categories, items, logs }: any) {
  const [activeTab, setActiveTab] = useState('categories')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  
  // Bulk Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [alertMessage, setAlertMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportLogs = () => {
    const exportData = logs.map((log: any) => ({
      ID: log.id,
      Date: new Date(log.created_at).toLocaleString(),
      Student_Name: log.student?.full_name || 'Unknown',
      Student_NIS: log.student?.nis || 'Unknown',
      Category: log.item?.adab_categories?.name || 'Unknown',
      Item_Description: log.item?.description || 'Unknown'
    }))
    downloadCSV(exportData, 'action_plan_logs.csv')
  }

  const downloadTemplate = () => {
    const template = 'Category Name,Item Description\nPrayers,Dhuhr Prayer in Congregation\nPrayers,Asr Prayer in Congregation\nManners,Respecting Teachers'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'action_plan_categories_template.csv'
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
        if (parts.length < 2) throw new Error(`Row ${index + 2} is missing required columns.`)
        return {
          category: parts[0],
          item: parts[1]
        }
      })

      if (parsedRows.length > 0) {
        await bulkAddAdabItems(parsedRows)
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="flex border-b border-slate-200 overflow-x-auto">
        {['categories', 'items', 'logs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
              activeTab === tab ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <form action={addCategory} className="flex gap-4 w-full md:w-auto flex-1">
                <input type="text" name="name" placeholder="New Category Name" required className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium whitespace-nowrap">Add Category</button>
              </form>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium whitespace-nowrap"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Categories
                </button>
              </div>
            </div>
            <ul className="divide-y divide-slate-100 border rounded-lg">
              {categories.map((c: any) => (
                <li key={c.id} className="flex justify-between items-center p-4 hover:bg-slate-50">
                  {editingCategory === c.id ? (
                    <form action={(formData) => { updateCategory(formData).then(() => setEditingCategory(null)) }} className="flex w-full gap-2 items-center">
                      <input type="hidden" name="id" value={c.id} />
                      <input type="text" name="name" defaultValue={c.name} required className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus />
                      <button type="submit" className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"><Check className="w-4 h-4" /></button>
                      <button type="button" onClick={() => setEditingCategory(null)} className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"><X className="w-4 h-4" /></button>
                    </form>
                  ) : (
                    <>
                      <span className="font-medium">{c.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingCategory(c.id)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Edit2 className="w-4 h-4" /></button>
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={c.id} />
                          <DeleteFormButton title="Delete Category" description={`Are you sure you want to delete "${c.name}"? This action cannot be undone.`} />
                        </form>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-6">
            <form action={addItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select name="category_id" required className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                <option value="">Select Category...</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="text" name="description" placeholder="Item Description" required className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Add Item</button>
            </form>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {items.map((i: any) => editingItem === i.id ? (
                    <tr key={i.id} className="bg-slate-50">
                      <td colSpan={4} className="px-4 py-3">
                        <form action={(formData) => { updateItem(formData).then(() => setEditingItem(null)) }} className="flex gap-4 items-center w-full">
                          <input type="hidden" name="id" value={i.id} />
                          <select name="category_id" defaultValue={i.category_id} required className="w-1/3 px-3 py-1.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <input type="text" name="description" defaultValue={i.description} required className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus />
                          <div className="flex gap-2">
                            <button type="submit" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Save</button>
                            <button type="button" onClick={() => setEditingItem(null)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300">Cancel</button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={i.id}>
                      <td className="px-4 py-3 text-sm">{i.adab_categories?.name}</td>
                      <td className="px-4 py-3 text-sm">{i.description}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${i.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                          {i.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end space-x-2">
                        <button onClick={() => setEditingItem(i.id)} className="text-blue-500 hover:bg-blue-50 p-2 rounded" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleItemActive(i.id, i.is_active)}
                          className={`p-2 rounded ${i.is_active ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          title={i.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {i.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        <form action={deleteItem}>
                          <input type="hidden" name="id" value={i.id} />
                          <DeleteFormButton title="Delete Item" description={`Are you sure you want to delete "${i.description}"?`} />
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Item</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {logs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{log.student?.full_name} ({log.student?.nis})</td>
                      <td className="px-4 py-3 text-sm">{log.item?.adab_categories?.name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-emerald-600">{log.item?.description}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Categories & Items" maxWidth="max-w-lg">
        <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Upload a CSV file containing Adab Categories and their Item Descriptions. The file must have exactly two columns: <strong>Category Name, Item Description</strong>.
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
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" id="csv-upload-categories" disabled={isUploading} />
                <label htmlFor="csv-upload-categories" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-colors ${isUploading ? 'bg-emerald-50 border-emerald-200 cursor-wait' : 'border-slate-300 hover:bg-slate-50 hover:border-emerald-400 cursor-pointer'}`}>
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
        title="Success"
        description={alertMessage}
      />
    </div>
  )
}
