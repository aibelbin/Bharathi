'use client'

import {
  Building2,
  LogOut,
  Bell,
  ChevronDown,
  User,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { trpc } from '@/trpc/client'

export function Navbar() {
  const { data: companyData } = trpc.company.companyDetails.useQuery()

  const companyName = companyData?.name ?? ''
  const companyEmail = companyData?.email ?? ''

  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Left Side: Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm shadow-orange-200">
                <Building2 className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">Bharathi Ai</span>
            </div>
          </div>

          {/* Right Side: Notifications & User */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-50 transition-all outline-none group">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center border border-orange-200/60 overflow-hidden">
                  {companyName ? (
                    <span className="text-xs font-bold text-orange-600">
                      {companyName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  {companyName ? (
                    <>
                      <p className="text-xs font-bold text-slate-900 leading-none">{companyName}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[120px]">{companyEmail}</p>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                      <div className="h-2 w-14 bg-slate-50 rounded animate-pulse mt-1" />
                    </>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="!bg-white !border-slate-200 w-52 mt-2 rounded-xl shadow-lg p-1">
                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600">
                  <LogOut className="w-4 h-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
    </div>
  )
}