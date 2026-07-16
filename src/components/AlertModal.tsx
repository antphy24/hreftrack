'use client'

import React from 'react'
import { Modal } from './Modal'
import { Info } from 'lucide-react'

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string | React.ReactNode
  buttonText?: string
}

export function AlertModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  buttonText = 'OK'
}: AlertModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-inner bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
          <Info className="w-8 h-8" />
        </div>
        
        <div className="text-base text-slate-600 dark:text-slate-300 mb-8 break-words whitespace-normal w-full px-2 max-w-full overflow-x-hidden whitespace-pre-wrap">
          {description}
        </div>
        
        <div className="flex w-full pt-2">
          <button 
            type="button" 
            onClick={onClose}
            className="w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
