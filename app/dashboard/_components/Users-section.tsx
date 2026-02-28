'use client'

import { useState } from 'react'
import {
  Users,
  UserPlus,
  UserCheck,
  TrendingUp,
  Trash2,
  Loader2,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { trpc } from '@/trpc/client'

export function UsersSection() {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const usersQuery = trpc.dashboard.getUsers.useQuery()
  const userCountQuery = trpc.dashboard.getUserCount.useQuery()

  const deleteUser = trpc.dashboard.deleteUser.useMutation({
    onSuccess: () => {
      usersQuery.refetch()
      userCountQuery.refetch()
      setConfirmDeleteId(null)
    },
    onError: () => {
      setConfirmDeleteId(null)
    },
  })

  const users = usersQuery.data ?? []
  const totalUsers = userCountQuery.data?.count ?? 0

  const formatDate = (dateString: string | Date) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h2>
        <p className="text-sm text-slate-500 mt-1">
          Track user engagement and manage your audience.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-slate-200/60 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total Users</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">Listed Users</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <UserPlus className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {users.filter(u => {
                const created = new Date(u.createdAt)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return created >= weekAgo
              }).length}
            </p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">New This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-100">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Recent Users</p>
              <p className="text-xs text-slate-500">Users who interacted with your AI agent</p>
            </div>
          </div>
        </div>

        {usersQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            <span className="ml-2 text-sm text-slate-500">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Users will appear here when they interact with your agent.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.phone}</p>
                </div>

                {/* Date */}
                <div className="text-right shrink-0 mr-2">
                  <p className="text-[11px] text-slate-400 font-medium">Joined</p>
                  <p className="text-xs text-slate-500 font-medium">{formatDate(user.createdAt)}</p>
                </div>

                {/* Delete Action */}
                {confirmDeleteId === user.id ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200 shrink-0">
                    <span className="text-[10px] text-amber-600 font-semibold mr-0.5">Remove?</span>
                    <button
                      onClick={() => deleteUser.mutate({ userId: user.id })}
                      disabled={deleteUser.isPending}
                      className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {deleteUser.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(user.id)}
                    className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                    title="Remove user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
