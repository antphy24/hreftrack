'use client'

import { Search } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function SearchStudents() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const initialQuery = searchParams.get('query') || ''
  const [text, setText] = useState(initialQuery)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      const currentQuery = searchParams.get('query') || ''
      
      if (text) {
        params.set('query', text)
        // Reset page to 1 if the query changed
        if (text !== currentQuery) {
          params.delete('page')
        }
      } else {
        params.delete('query')
      }
      
      const newQueryString = params.toString()
      const oldQueryString = searchParams.toString()
      
      // Push only if the URL params have changed to avoid unnecessary re-renders
      if (newQueryString !== oldQueryString) {
        router.replace(`${pathname}?${newQueryString}`)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [text, pathname, router, searchParams])

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search by name or NIS..."
        className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 sm:text-sm transition-all"
      />
    </div>
  )
}
