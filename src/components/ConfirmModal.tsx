'use client'

import React from 'react'
import { Modal } from './Modal'
import { AlertTriangle, Info } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  isDestructive = false,
  isLoading = false
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-inner ${
          isDestructive 
            ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' 
            : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
        }`}>
          {isDestructive ? <AlertTriangle className="w-8 h-8" /> : <Info className="w-8 h-8" />}
        </div>
        
        <div className="text-base text-slate-600 dark:text-slate-300 mb-8 break-words whitespace-normal w-full px-2 max-w-full overflow-x-hidden">
          {description}
        </div>
        
        <div className="flex w-full gap-3 pt-2">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm ${
              isDestructive 
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 focus:ring-red-500' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
