'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  User,
  Phone,
  Calendar,
  Loader2,
} from 'lucide-react'
import { trpc } from '@/trpc/client'

export function MessagesList() {
  const { data: recentUsers, isLoading } = trpc.dashboard.getRecentUsers.useQuery()

  const formatDate = (dateString: string | Date) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <Card className="h-full border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white rounded-3xl overflow-hidden gap-0 py-0">
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <CardTitle className="text-lg text-black font-bold">Recent Users</CardTitle>
          </div>
          <CardDescription className="text-xs">
            {isLoading ? 'Loading...' : `Showing ${recentUsers?.length ?? 0} most recent users`}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
            <span className="ml-2 text-sm text-slate-400">Loading users...</span>
          </div>
        ) : !recentUsers || recentUsers.length === 0 ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No users yet</p>
            <p className="text-xs text-slate-400 mt-1">Users will appear here once they interact with your agent.</p>
          </div>
        ) : (
          recentUsers.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all group"
            >
              {/* Avatar */}
              <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600">
                {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-bold text-slate-900 truncate">
                    {u.name}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 shrink-0 ml-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(u.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {u.phone}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}