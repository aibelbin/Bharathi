'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  MessageSquare, 
  Headset, 
  Users, 
  Zap, 
  CreditCard, 
  Building2,
  TrendingUp
} from 'lucide-react'

const stats = {
  totalMessages: 2847,
  agentMessages: 1563,
  userMessages: 1284,
  totalTokens: 45230,
  totalCost: 234.50,
  activeCompanies: 12,
}

export function StatisticsCards() {
  const statItems = [
    {
      label: 'Total Messages',
      value: stats.totalMessages.toLocaleString(),
      subtext: 'All time volume',
      icon: MessageSquare,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-100'
    },
    {
      label: 'Agent Replies',
      value: stats.agentMessages.toLocaleString(),
      subtext: `${((stats.agentMessages / stats.totalMessages) * 100).toFixed(0)}% response rate`,
      icon: Headset,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100'
    },
    {
      label: 'User Inbound',
      value: stats.userMessages.toLocaleString(),
      subtext: `${((stats.userMessages / stats.totalMessages) * 100).toFixed(0)}% incoming`,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      label: 'Token Usage',
      value: (stats.totalTokens / 1000).toFixed(1) + 'k',
      subtext: 'Computed units',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      label: 'Billing',
      value: `$${stats.totalCost.toFixed(0)}`,
      subtext: 'Total accrued',
      icon: CreditCard,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100'
    },
    {
      label: 'Companies',
      value: stats.activeCompanies,
      subtext: 'Active partners',
      icon: Building2,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100'
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
      {statItems.map((item, index) => (
        <Card 
          key={index} 
          className="group relative overflow-hidden border-slate-200/60 bg-white hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300 rounded-2xl"
        >
          <CardContent className="p-5">
            <div className="flex flex-col gap-3">
              {/* Icon & Label Header */}
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${item.bg} ${item.color} transition-transform group-hover:scale-110 duration-300`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <TrendingUp className="w-3 h-3 text-slate-300 group-hover:text-slate-400" />
              </div>

              {/* Data Section */}
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.label}
                </p>
                <h3 className={`text-2xl font-bold tracking-tight text-slate-900`}>
                  {item.value}
                </h3>
              </div>

              {/* Subtext with Micro-Progress Bar look */}
              <div className="pt-2">
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full opacity-60 rounded-full ${item.bg.replace('bg-', 'bg-')}`} 
                    style={{ width: '40%' }} // Mock progress
                  />
                </div>
                <p className="text-[10px] font-medium text-slate-500 mt-1.5 flex items-center gap-1">
                  {item.subtext}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}