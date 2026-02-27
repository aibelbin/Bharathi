'use client'

import { useState } from 'react'
import { 
  Building2, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell,
  ChevronDown,
  User
} from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  return (
    <div className="w-full bg-white border-b border-slate-200">
      <div className="max-w-8xl mx-auto px-2 sm:px-2 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left Side: Brand & Main Nav */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">Bharathi Ai</span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <NavItem label="Overview" icon={LayoutDashboard} active />
            </nav>
          </div>

          {/* Right Side: Notifications & User */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-all outline-none group">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-none">Amphenol fci</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">company</p>
                </div>
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 overflow-hidden">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-52 mt-2 rounded-xl border-slate-200 shadow-lg p-1">
                
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

function NavItem({ label, icon: Icon, active = false }: { label: string, icon: any, active?: boolean }) {
  return (
    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
      active 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}