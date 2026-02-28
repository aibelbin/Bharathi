'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Share2,
  Settings,
  Facebook,
  Instagram,
  Link2,
  Unlink,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'
import { trpc } from '@/trpc/client'
import { authClient } from '@/lib/auth-client'

type SidebarSection = 'social-accounts' | 'settings'

interface ConfigurationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfigurationDialog({ open, onOpenChange }: ConfigurationDialogProps) {
  const [activeSection, setActiveSection] = useState<SidebarSection>('social-accounts')
  const [confirmDisconnect, setConfirmDisconnect] = useState<'facebook' | 'instagram' | null>(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const connectedAccounts = trpc.social.getConnectedAccounts.useQuery(undefined, {
    enabled: open,
  })

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

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setPasswordLoading(true)

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      })

      if (error) {
        setPasswordError(error.message || 'Failed to change password.')
      } else {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccess(false), 4000)
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'An unexpected error occurred.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const sidebarItems = [
    {
      id: 'social-accounts' as const,
      label: 'Social Accounts',
      icon: Share2,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-white sm:max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl border-slate-200 shadow-2xl">
        <DialogTitle className="sr-only">Configuration</DialogTitle>

        <div className="flex min-h-[480px]">
          {/* Sidebar */}
          <div className="w-[200px] bg-slate-50/80 border-r border-slate-200/80 p-3 flex flex-col gap-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-3">
              Configuration
            </p>
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setConfirmDisconnect(null)
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : ''}`} />
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {activeSection === 'social-accounts' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Social Accounts</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Connect your social media accounts to enable automated posting.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Facebook */}
                  <div className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Facebook className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Connect your Facebook account
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isFacebookConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <p className="text-xs text-slate-500">
                              {isFacebookConnected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {confirmDisconnect === 'facebook' ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                          <span className="text-xs text-amber-600 font-medium mr-1">Disconnect?</span>
                          <button
                            onClick={() => disconnectFacebook.mutate()}
                            disabled={disconnectFacebook.isPending}
                            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            {disconnectFacebook.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDisconnect(null)}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : isFacebookConnected ? (
                        <button
                          onClick={() => setConfirmDisconnect('facebook')}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all duration-200 cursor-pointer"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => facebookAuth.mutate()}
                          disabled={facebookAuth.isPending}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                        >
                          {facebookAuth.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Link2 className="w-3.5 h-3.5" />
                          )}
                          Link Account
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="group relative rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:shadow-md hover:border-slate-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                          <Instagram className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Connect your Instagram account
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${isInstagramConnected ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            <p className="text-xs text-slate-500">
                              {isInstagramConnected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {confirmDisconnect === 'instagram' ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                          <span className="text-xs text-amber-600 font-medium mr-1">Disconnect?</span>
                          <button
                            onClick={() => disconnectInstagram.mutate()}
                            disabled={disconnectInstagram.isPending}
                            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            {disconnectInstagram.isPending ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDisconnect(null)}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : isInstagramConnected ? (
                        <button
                          onClick={() => setConfirmDisconnect('instagram')}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-all duration-200 cursor-pointer"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => instagramAuth.mutate()}
                          disabled={instagramAuth.isPending}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
                        >
                          {instagramAuth.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Link2 className="w-3.5 h-3.5" />
                          )}
                          Link Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50/60 border border-amber-200/40">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Connecting your accounts allows Bharathi AI to publish content on your behalf. You can disconnect at any time.
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Settings</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage your account preferences and configurations.
                  </p>
                </div>

                {/* Change Password */}
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Lock className="w-4.5 h-4.5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Change Password</p>
                      <p className="text-xs text-slate-500">Update your account password</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError('') }}
                          placeholder="Enter current password"
                          className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }}
                          placeholder="Enter new password"
                          className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError('') }}
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {passwordError && (
                    <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200/50">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <p className="text-xs text-rose-600 font-medium">{passwordError}</p>
                    </div>
                  )}

                  {/* Success */}
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/50">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <p className="text-xs text-emerald-600 font-medium">Password changed successfully!</p>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
