'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  MessageSquare,
  Headset,
  Users,
  Zap,
  CreditCard,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { trpc } from '@/trpc/client'

export function StatisticsCards() {
  const { data: stats, isLoading } = trpc.dashboard.getOverviewStats.useQuery()

  const totalMessages = stats?.totalMessages ?? 0
  const agentMessages = stats?.agentMessages ?? 0
  const userMessages = stats?.userMessages ?? 0
  const totalTokens = stats?.totalTokens ?? 0
  const totalCost = stats?.totalCost ?? 0
  const totalUsers = stats?.totalUsers ?? 0

  const responseRate = totalMessages > 0 ? ((agentMessages / totalMessages) * 100).toFixed(0) : '0'
  const incomingRate = totalMessages > 0 ? ((userMessages / totalMessages) * 100).toFixed(0) : '0'

  const statItems = [
    {
      label: 'Total Messages',
      value: totalMessages.toLocaleString(),
      subtext: 'All time volume',
      icon: MessageSquare,
      color: 'text-slate-600',
      bg: 'bg-slate-50',
    },
    {
      label: 'Agent Replies',
      value: agentMessages.toLocaleString(),
      subtext: `${responseRate}% response rate`,
      icon: Headset,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'User Inbound',
      value: userMessages.toLocaleString(),
      subtext: `${incomingRate}% incoming`,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Token Usage',
      value: totalTokens >= 1000 ? (totalTokens / 1000).toFixed(1) + 'k' : totalTokens.toString(),
      subtext: 'Computed units',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Billing',
      value: `₹${totalCost.toFixed(2)}`,
      subtext: 'Total accrued',
      icon: CreditCard,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      subtext: 'Registered users',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-slate-200/60 bg-white rounded-2xl">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 items-center justify-center h-[100px]">
                <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

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
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {item.value}
                </h3>
              </div>

              {/* Subtext */}
              <div className="pt-2">
                <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
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