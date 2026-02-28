'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from './_components/Dashboard-header'
import { CompanyOverview } from './_components/Company-overview'
import { MessagesList } from './_components/Messages-list'
import { StatisticsCards } from './_components/Statitiics-card'
import { SocialAccountsSection } from './_components/Social-accounts-section'
import { SettingsSection } from './_components/Settings-section'
import { UsersSection } from './_components/Users-section'
import { InteractionsChat } from './_components/Interactions-chat'
import { Navbar } from '@/components/Navbar'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Share2,
  Settings,
  Loader2,
} from 'lucide-react'

type DashboardSection = 'overview' | 'interactions' | 'users' | 'social-accounts' | 'settings'

const sidebarItems: { id: DashboardSection; label: string; icon: any; badge?: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'interactions', label: 'Interactions', icon: MessageSquare },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'social-accounts', label: 'Social Accounts', icon: Share2 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Sidebar */}
        <aside className="w-[240px] bg-white border-r border-slate-200/80 flex flex-col sticky top-16 h-[calc(100vh-64px)] shrink-0">
          {/* Sidebar Header */}
          <div className="px-5 pt-6 pb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
              Dashboard
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-0.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer group ${isActive
                    ? 'bg-orange-50 text-orange-700 shadow-sm shadow-orange-100/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-slate-100/80 text-slate-400 group-hover:bg-slate-200/60 group-hover:text-slate-500'
                    }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {item.label}

                </button>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100/60">
              <p className="text-[11px] font-bold text-orange-800 mb-1">Bharathi AI</p>
              <p className="text-[10px] text-orange-600/80 leading-relaxed">
                Your AI-powered business assistant is active and ready.
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-600">Online</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8 max-w-[1200px]">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <DashboardHeader />
                {!mounted ? (
                  <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    <StatisticsCards />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <CompanyOverview />
                      </div>
                      <div>
                        <MessagesList />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Interactions Section */}
            {activeSection === 'interactions' && (
              <div className="animate-in fade-in duration-300">
                <InteractionsChat />
              </div>
            )}

            {/* Users Section */}
            {activeSection === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <UsersSection />
              </div>
            )}

            {/* Social Accounts Section */}
            {activeSection === 'social-accounts' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <SocialAccountsSection />
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <SettingsSection />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
