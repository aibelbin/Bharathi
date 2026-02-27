'use client'

import { useState } from 'react'
import { toast } from 'sonner' // High-performance toast
import { 
  Share2, 
  Download, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  FileJson 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  companyData: any
  statsData: any
  messages: any[]
}

export function DashboardHeader({ companyData, statsData, messages }: DashboardHeaderProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)

    // Using Sonner's promise-based toast for a premium feel
    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          // 1. Simulate a realistic prep delay
          await new Promise((res) => setTimeout(res, 1200))

          // 2. Prepare the data
          const data = {
            exportMeta: {
              version: "1.0",
              timestamp: new Date().toISOString(),
              source: "Management Console"
            },
            company: companyData,
            metrics: statsData,
            history: messages,
          }

          // 3. Create and trigger download
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${companyData.name.toLowerCase().replace(/\s+/g, '-')}-data.json`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)

          resolve({ name: companyData.name })
        } catch (error) {
          reject(error)
        } finally {
          setIsExporting(false)
        }
      }),
      {
        loading: 'Preparing your export...',
        success: (data: any) => `${data.name} data downloaded successfully.`,
        error: 'Failed to generate export file.',
        position: 'top-right',
      }
    )
  }

  return (
    <div className="relative w-full pb-8 border-b border-slate-100 mb-8">
      {/* Background Glow */}
      <div className="absolute -left-20 -top-20 w-72 h-72 bg-indigo-50/40 rounded-full blur-[100px] -z-10" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-full border border-indigo-100 shadow-sm shadow-indigo-100/50">
          
            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Company Console</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">
              Hi Amphenol Fci
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-base text-slate-500 font-medium">
              </p>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}