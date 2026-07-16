import React from 'react'

export function LogoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-blue-500"
      />
      <path 
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-emerald-500"
      />
      <path 
        d="M8 16l8-8" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="text-slate-400 dark:text-slate-600"
      />
    </svg>
  )
}

export function LogoText({ className = "text-xl font-bold tracking-wider", variant = 'dark' }: { className?: string, variant?: 'light' | 'dark' }) {
  const isDarkBg = variant === 'dark'
  return (
    <span className={`flex items-center ${className}`}>
      <span className={isDarkBg ? "text-blue-400" : "text-blue-600"}>HreF</span>
      <span className={isDarkBg ? "text-emerald-400" : "text-emerald-600"}>Track</span>
    </span>
  )
}

export function Logo({ className = "text-xl font-bold tracking-wider", iconClassName = "w-6 h-6 mr-2", variant = 'dark' }: { className?: string, iconClassName?: string, variant?: 'light' | 'dark' }) {
  return (
    <div className="flex items-center">
      <LogoIcon className={iconClassName} />
      <LogoText className={className} variant={variant} />
    </div>
  )
}
