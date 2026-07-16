'use client'

import React, { useState } from 'react'
import { LogOut } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'

interface SignOutButtonProps {
  className?: string
  icon?: React.ReactNode
  label?: string
}

export function SignOutButton({ 
  className = "flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group",
  icon = <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />,
  label = "Sign Out"
}: SignOutButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // SECURITY FIX: Use a proper form submission instead of fragile DOM manipulation.
  // The previous approach used document.getElementById with a hidden button and setTimeout,
  // which was brittle and could fail with duplicate IDs.
  const handleConfirm = async () => {
    setIsSigningOut(true)
    try {
      const response = await fetch('/auth/signout', { method: 'POST' })
      if (response.redirected) {
        window.location.href = response.url
      } else {
        window.location.href = '/login'
      }
    } catch {
      // If fetch fails, force navigate to signout
      window.location.href = '/auth/signout'
    }
  }

  return (
    <>
      <button 
        type="button" 
        onClick={() => setIsOpen(true)} 
        className={className}
      >
        {icon}
        {label}
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Sign Out"
        description="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        isDestructive={true}
        isLoading={isSigningOut}
      />
    </>
  )
}
