'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  maxWidth?: string
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      
      // Basic focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full ${maxWidth} overflow-hidden border border-slate-200/50 dark:border-slate-700/50 animate-in zoom-in-95 duration-300 ease-out mx-auto`}
      >
        {/* Decorative ambient blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none hidden sm:block"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl pointer-events-none hidden sm:block"></div>
        
        <div className="relative z-10 flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-8 py-5 border-b border-slate-100/50 dark:border-slate-800/50 flex justify-between items-center bg-white/50 dark:bg-slate-900/50">
            <h3 id="modal-title" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">
              {title}
            </h3>
            <button 
              onClick={onClose} 
              type="button"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content Body with break-words to fix overflow */}
          <div className="overflow-y-auto overflow-x-hidden px-8 py-6 break-words whitespace-normal text-slate-700 dark:text-slate-300">
            <div className="w-full max-w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
