'use client'

import { useState } from 'react'
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Bell,
  Globe,
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'

export function SettingsSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account preferences and security configurations.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Change Password — Main Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Change Password</p>
              <p className="text-xs text-slate-500">Update your account password for security</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError('') }}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError('') }}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error */}
          {passwordError && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200/50">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <p className="text-xs text-rose-600 font-medium">{passwordError}</p>
            </div>
          )}

          {/* Success */}
          {passwordSuccess && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-600 font-medium">Password changed successfully!</p>
            </div>
          )}

          {/* Submit */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm shadow-orange-200 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Security Tips — Side Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-sm font-bold text-slate-900">Security Tips</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Use a strong password</p>
                <p className="text-[11px] text-slate-500 mt-0.5">At least 8 characters with mixed case, numbers, and symbols.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Don&apos;t reuse passwords</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Use unique passwords for different services.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">Update regularly</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Change your password every few months.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
