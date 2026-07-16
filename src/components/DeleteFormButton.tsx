'use client'

import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'

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
  const [isDeleting, setIsDeleting] = useState(false)
  const id = React.useId()
  const btnId = `hidden-submit-${id}`

  const handleConfirm = () => {
    setIsDeleting(true)
    // Find the closest form and submit it
    // We delay slightly to allow UI to update (though not strictly necessary)
    setTimeout(() => {
      const btn = document.getElementById(btnId) as HTMLButtonElement
      if (btn) {
        btn.click()
      }
    }, 10)
  }

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)} 
        title={title} 
        className={className}
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
        isLoading={isDeleting}
      />
    </>
  )
}
