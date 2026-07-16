/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { downloadCSV } from '@/utils/csv'
import { addStatement, deleteStatement, toggleStatementActive, updateStatement } from './actions'
import { Trash2, Download, Power, PowerOff, Edit2 } from 'lucide-react'

export function EnglishHoursManager({ statements, selfLogs, peerReports }: any) {
  const [activeTab, setActiveTab] = useState('statements')
  const [editingStatement, setEditingStatement] = useState<string | null>(null)

  const handleExportSelfLogs = () => {
    const exportData = selfLogs.map((log: any) => ({
      ID: log.id,
      Date: new Date(log.created_at).toLocaleString(),
      Student_Name: log.student?.full_name || 'Unknown',
      Student_NIS: log.student?.nis || 'Unknown',
      Statement: log.statement?.statement || 'Unknown'
    }))
    downloadCSV(exportData, 'english_self_logs.csv')
  }

  const handleExportPeerReports = () => {
    const exportData = peerReports.map((log: any) => ({
      ID: log.id,
      Date: new Date(log.created_at).toLocaleString(),
      Reporter_Name: log.reporter?.full_name || 'Unknown',
      Reporter_NIS: log.reporter?.nis || 'Unknown',
      Reported_Name: log.reported_student?.full_name || 'Unknown',
      Reported_NIS: log.reported_student?.nis || 'Unknown',
      Notes: log.notes || ''
    }))
    downloadCSV(exportData, 'english_peer_reports.csv')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex border-b border-slate-200">
        {['statements', 'self logs', 'peer reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'border-b-2 border-purple-500 text-purple-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'statements' && (
          <div className="space-y-6">
            <form action={addStatement} className="flex gap-4">
              <input type="text" name="statement" placeholder="New Statement" required className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Add Statement</button>
            </form>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Statement</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {statements.map((s: any) => editingStatement === s.id ? (
                    <tr key={s.id} className="bg-slate-50">
                      <td colSpan={3} className="px-4 py-3">
                        <form action={(formData) => { updateStatement(formData).then(() => setEditingStatement(null)) }} className="flex gap-4 items-center w-full">
                          <input type="hidden" name="id" value={s.id} />
                          <input type="text" name="statement" defaultValue={s.statement} required className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" autoFocus />
                          <div className="flex gap-2">
                            <button type="submit" className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">Save</button>
                            <button type="button" onClick={() => setEditingStatement(null)} className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300">Cancel</button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={s.id}>
                      <td className="px-4 py-3 text-sm">{s.statement}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.is_active ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                          {s.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end space-x-2">
                        <button onClick={() => setEditingStatement(s.id)} className="text-blue-500 hover:bg-blue-50 p-2 rounded" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleStatementActive(s.id, s.is_active)}
                          className={`p-2 rounded ${s.is_active ? 'text-amber-500 hover:bg-amber-50' : 'text-purple-500 hover:bg-purple-50'}`}
                          title={s.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {s.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        <form action={deleteStatement}>
                          <input type="hidden" name="id" value={s.id} />
                          <button type="submit" className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'self logs' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={handleExportSelfLogs} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Statement</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {selfLogs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{log.student?.full_name} ({log.student?.nis})</td>
                      <td className="px-4 py-3 text-sm font-medium text-purple-600">{log.statement?.statement}</td>
                    </tr>
                  ))}
                  {selfLogs.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500">No self logs found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'peer reports' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={handleExportPeerReports} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                <Download className="w-4 h-4 mr-2" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Reporter</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Reported Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {peerReports.map((log: any) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm">{log.reporter?.full_name} ({log.reporter?.nis})</td>
                      <td className="px-4 py-3 text-sm">{log.reported_student?.full_name} ({log.reported_student?.nis})</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.notes}</td>
                    </tr>
                  ))}
                  {peerReports.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">No peer reports found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
