'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  BrainCircuit, LayoutDashboard, Target, FileText, Bell,
  Settings, LogOut, ChevronDown, Menu, X, RefreshCw
} from 'lucide-react'
import { getProfile, type UserProfile } from '@/lib/supabase'
import { AnimatePresence, motion } from 'framer-motion'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Target, label: 'Job Matches', href: '/dashboard/matches' },
  { icon: FileText, label: 'Applications', href: '/dashboard/applications' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const sessionId = localStorage.getItem('fmj_session_id')
        if (!sessionId) {
          router.replace('/login')
          return
        }
        const p = await getProfile(sessionId)
        if (!p) {
          router.replace('/onboarding')
          return
        }
        setProfile(p)
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const userInitials = profile
    ? `${(profile.first_name || 'U')[0]}${(profile.last_name || '')[0] || ''}`.toUpperCase()
    : 'U'
  const userName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
    : 'User'
  const userEmail = profile?.email || 'Not set'

  const handleLogout = () => {
    localStorage.removeItem('fmj_session_id')
    localStorage.removeItem('fmj_onboarded')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#64748b] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080f] flex">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 z-40 flex flex-col border-r border-white/5 bg-[rgba(8,8,15,0.95)] backdrop-blur-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-[14px] text-white">FindMyJob</span>
              <span className="font-display font-bold text-[10px] text-indigo-400">.AI</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-indigo-500/15 text-white border border-indigo-500/20'
                    : 'text-[#64748b] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-[#4b5563] group-hover:text-[#94a3b8]'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{userName}</p>
              <p className="text-[#4b5563] text-[10px] truncate">{userEmail}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#4b5563] group-hover:text-[#94a3b8]" />
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-[#64748b] hover:text-rose-400 hover:bg-white/5 text-xs font-medium transition-colors mt-1">
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="flex-none flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[rgba(8,8,15,0.85)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg bg-white/5 text-[#64748b]" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div>
              <h1 className="font-display font-bold text-white text-lg capitalize">
                {pathname === '/dashboard' ? 'Dashboard' : pathname.split('/').pop()?.replace('-', ' ')}
              </h1>
              <p className="text-[#64748b] text-xs">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl bg-white/5 text-[#64748b] hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
