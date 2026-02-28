'use client'

import { Button } from '@/components/ui/button'
import { trpc } from '@/trpc/client'

export function DashboardHeader() {
  const { data: companyData } = trpc.company.companyDetails.useQuery()

  const companyName = companyData?.name ?? ''

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
              {companyName ? `Hi ${companyName}` : (
                <span className="inline-block h-12 w-64 bg-slate-100 rounded-xl animate-pulse" />
              )}
            </h1>
            <p className="text-base text-slate-500 font-medium">
              Welcome back to your dashboard
            </p>
          </div>
        </div>
        <div className='flex justify-center flex-col gap-3 items-center'>
          <Button
              variant="outline"
              size="lg"
              className='bg-orange-400 w-56 hover:bg-orange-500 hover:text-zinc-700 text-black border-none'
          >
            <a href={`/call?agent=user&companyId=${companyData?.id}`}>Customer Interactive Agent</a>
          </Button>
          <Button
              variant="outline"
              size="lg"
              className='bg-green-400 w-56 hover:bg-green-500 hover:text-zinc-700 text-black border-none'

          >
            <a href={`/call?agent=user&companyId=${companyData?.id}`}>Company Management Agent</a>
          </Button>
        </div>
      </div>
    </div>
  )
}