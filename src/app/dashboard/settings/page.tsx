'use client'

import { motion } from 'framer-motion'
import { Settings, User, Bell, Shield, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('fmj_session_id')
    localStorage.removeItem('fmj_onboarded')
    router.push('/login')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Settings</h1>
          <p className="text-[#94a3b8]">Manage your account preferences and profile.</p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium text-sm transition-colors text-left">
            <User className="w-5 h-5" />
            Profile Settings
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#94a3b8] hover:bg-white/5 hover:text-white font-medium text-sm transition-colors text-left">
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#94a3b8] hover:bg-white/5 hover:text-white font-medium text-sm transition-colors text-left">
            <Shield className="w-5 h-5" />
            Security
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-[#94a3b8] mb-1">Update Core Information</p>
                <p className="text-xs text-[#64748b] mb-4">To update your target roles, locations, or resume, run through the onboarding wizard again.</p>
                <Link href="/onboarding" className="btn-primary py-2 px-6 text-sm inline-block">
                  Launch Setup Wizard
                </Link>
              </div>

              <div className="border-t border-white/5 pt-6">
                <p className="text-sm font-medium text-[#94a3b8] mb-4">Danger Zone</p>
                <button onClick={handleLogout} className="btn-secondary text-rose-400 border-rose-400/20 hover:bg-rose-500/10 hover:border-rose-400/30 py-2 px-6 text-sm flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out of Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
