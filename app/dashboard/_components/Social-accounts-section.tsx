'use client'

import { useState } from 'react'
import {
  Share2,
  Facebook,
  Instagram,
  Link2,
  Unlink,
  AlertTriangle,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { trpc } from '@/trpc/client'

export function SocialAccountsSection() {
  const [confirmDisconnect, setConfirmDisconnect] = useState<'facebook' | 'instagram' | null>(null)

  const connectedAccounts = trpc.social.getConnectedAccounts.useQuery()

  const disconnectFacebook = trpc.social.disconnectFacebook.useMutation({
    onSuccess: () => {
      connectedAccounts.refetch()
      setConfirmDisconnect(null)
    },
  })

  const disconnectInstagram = trpc.social.disconnectInstagram.useMutation({
    onSuccess: () => {
      connectedAccounts.refetch()
      setConfirmDisconnect(null)
    },
  })

  const facebookAuth = trpc.social.getFacebookAuthUrl.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })

  const instagramAuth = trpc.social.getInstagramAuthUrl.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })

  const isFacebookConnected = connectedAccounts.data?.facebook ?? false
  const isInstagramConnected = connectedAccounts.data?.instagram ?? false

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Social Accounts</h2>
        <p className="text-sm text-slate-500 mt-1">
          Connect your social media accounts to enable automated posting and engagement.
        </p>
      </div>

      {/* Connected Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Facebook className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Facebook</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isFacebookConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <p className="text-xs text-slate-500">{isFacebookConnected ? 'Connected' : 'Not connected'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
            <Instagram className="w-5 h-5 text-pink-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Instagram</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isInstagramConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <p className="text-xs text-slate-500">{isInstagramConnected ? 'Connected' : 'Not connected'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="space-y-4">
        {/* Facebook Card */}
        <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:shadow-lg hover:shadow-blue-100/30 hover:border-blue-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm shadow-blue-100/50">
                <Facebook className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">Facebook</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isFacebookConnected ? 'Your Facebook account is connected and active' : 'Connect your Facebook account to start posting'}
                </p>
              </div>
            </div>

            {confirmDisconnect === 'facebook' ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                <span className="text-xs text-amber-600 font-medium mr-1">Disconnect?</span>
                <button
                  onClick={() => disconnectFacebook.mutate()}
                  disabled={disconnectFacebook.isPending}
                  className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  {disconnectFacebook.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setConfirmDisconnect(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : isFacebookConnected ? (
              <button
                onClick={() => setConfirmDisconnect('facebook')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all duration-200 cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => facebookAuth.mutate()}
                disabled={facebookAuth.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {facebookAuth.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Link2 className="w-3.5 h-3.5" />
                )}
                Connect Account
              </button>
            )}
          </div>
        </div>

        {/* Instagram Card */}
        <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:shadow-lg hover:shadow-pink-100/30 hover:border-pink-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center shadow-sm shadow-pink-100/50">
                <Instagram className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">Instagram</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isInstagramConnected ? 'Your Instagram account is connected and active' : 'Connect your Instagram account to start posting'}
                </p>
              </div>
            </div>

            {confirmDisconnect === 'instagram' ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                <span className="text-xs text-amber-600 font-medium mr-1">Disconnect?</span>
                <button
                  onClick={() => disconnectInstagram.mutate()}
                  disabled={disconnectInstagram.isPending}
                  className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  {disconnectInstagram.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setConfirmDisconnect(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : isInstagramConnected ? (
              <button
                onClick={() => setConfirmDisconnect('instagram')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all duration-200 cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => instagramAuth.mutate()}
                disabled={instagramAuth.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-sm shadow-pink-200 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {instagramAuth.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Link2 className="w-3.5 h-3.5" />
                )}
                Connect Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/60 border border-amber-200/40">
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Connecting your accounts allows Bharathi AI to publish content on your behalf. You can disconnect at any time.
        </p>
      </div>
    </div>
  )
}
