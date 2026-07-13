import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Loading data...</p>
    </div>
  )
}
