'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { useFormStatus } from 'react-dom'

interface DeleteFormButtonProps {
  title?: string
  description?: string
  className?: string
  icon?: React.ReactNode
}

export function DeleteFormButton({ 
  title = 'Confirm Deletion', 
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  className = "text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors",
  icon = <Trash2 className="w-4 h-4" />
}: DeleteFormButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { pending } = useFormStatus()
  const id = React.useId()
  // Sanitize the ID to be a valid HTML ID without colons by replacing them
  const safeId = id.replace(/:/g, '')
  const btnId = `hidden-submit-${safeId}`

  // Close modal when pending finishes (either success or error)
  React.useEffect(() => {
    if (!pending && isOpen) {
      // Small delay to ensure any success messages or state updates can render first
      const t = setTimeout(() => setIsOpen(false), 100)
      return () => clearTimeout(t)
    }
  }, [pending])

  const handleConfirm = () => {
    // Find the closest form and submit it
    const btn = document.getElementById(btnId) as HTMLButtonElement
    if (btn) {
      btn.click()
    }
  }

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)} 
        title={title} 
        className={className}
        disabled={pending}
      >
        {icon}
      </button>

      {/* A hidden submit button to actually submit the form */}
      <button type="submit" id={btnId} className="hidden" />

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        description={description}
        confirmText="Delete"
        isDestructive={true}
        isLoading={pending}
      />
    </>
  )
}
