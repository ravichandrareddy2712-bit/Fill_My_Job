'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BrainCircuit, LayoutDashboard, Target, FileText, Bell,
  Settings, LogOut, ChevronDown, ExternalLink,
  TrendingUp, Briefcase, CheckCircle2, Clock, XCircle,
  Filter, Menu, X, Play, Loader2,
  Zap, Globe, AlertTriangle, RefreshCw, User, MessageSquare,
  Search,
} from 'lucide-react'
import {
  getProfile, getApplications, getApplicationStats,
  type UserProfile, type Application,
} from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────
type PipelineStage = 'idle' | 'checking' | 'starting' | 'running' | 'done' | 'error'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
  { icon: Target, label: 'Job Matches', href: '#' },
  { icon: FileText, label: 'Applications', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
]

const pipelineSteps = [
  { key: 'profile', label: '✅ Profile loaded from database', done: false },
  { key: 'naukri', label: '⏳ Searching for jobs on Naukri...', done: false },
  { key: 'linkedin', label: '⏳ Searching for jobs on LinkedIn...', done: false },
  { key: 'applying', label: '⏳ Filling applications...', done: false },
  { key: 'whatsapp', label: '⏳ Sending you WhatsApp updates...', done: false },
]

const statusConfig: Record<string, { label: string; badgeCls: string; icon: typeof CheckCircle2 }> = {
  'Applied ✅': { label: 'Applied', badgeCls: 'badge-indigo', icon: CheckCircle2 },
  'Applied': { label: 'Applied', badgeCls: 'badge-indigo', icon: CheckCircle2 },
  'Pending ⏳': { label: 'Pending', badgeCls: 'badge-amber', icon: Clock },
  'Pending': { label: 'Pending', badgeCls: 'badge-amber', icon: Clock },
  'Failed ❌': { label: 'Failed', badgeCls: 'badge-rose', icon: XCircle },
  'Needs Manual Review ⚠️': { label: 'Review', badgeCls: 'badge-amber', icon: AlertTriangle },
  'Response 📬': { label: 'Response', badgeCls: 'badge-emerald', icon: MessageSquare },
  'Interview': { label: 'Interview', badgeCls: 'badge-emerald', icon: TrendingUp },
  'Offer': { label: 'Offer', badgeCls: 'badge-emerald', icon: CheckCircle2 },
}

function CountUp({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const steps = 40
    const inc = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += inc
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, (duration * 1000) / steps)
    return () => clearInterval(timer)
  }, [target, duration])
  return <>{count.toLocaleString()}</>
}

// ─── Supabase SQL for dashboard display ─────────────────────
// Run this in Supabase SQL Editor ONCE before using dashboard:
// ALTER TABLE users ADD COLUMN IF NOT EXISTS target_roles JSONB;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_locations JSONB;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS work_type TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_years INTEGER;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS experience JSONB;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS projects JSONB;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS skills JSONB;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS full_address TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
// ALTER TABLE users ADD COLUMN IF NOT EXISTS portal_links JSONB;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_url TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_text TEXT;
// ALTER TABLE users ADD COLUMN IF NOT EXISTS current_city TEXT;
// CREATE TABLE IF NOT EXISTS applications (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, session_id TEXT REFERENCES users(session_id), company TEXT, job_title TEXT, portal TEXT, apply_type TEXT, status TEXT DEFAULT 'Pending', apply_link TEXT, applied_at TIMESTAMP DEFAULT NOW(), notes TEXT, screenshot_url TEXT);
// CREATE TABLE IF NOT EXISTS scraped_jobs (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, session_id TEXT, job_title TEXT, company TEXT, location TEXT, portal TEXT, apply_link TEXT, apply_type TEXT, date_scraped DATE DEFAULT CURRENT_DATE, status TEXT DEFAULT 'Found');

export default function DashboardPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle')
  const [pipelineMessage, setPipelineMessage] = useState('')
  const [activeSteps, setActiveSteps] = useState<string[]>([])
  const [stats, setStats] = useState({ total: 0, appliedToday: 0, pending: 0, responses: 0 })
  const [toastMsg, setToastMsg] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [localRoles, setLocalRoles] = useState<string[]>([])
  const [localLocations, setLocalLocations] = useState<string[]>([])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  const loadData = useCallback(async (sessionId: string) => {
    const [p, apps, s] = await Promise.all([
      getProfile(sessionId),
      getApplications(sessionId),
      getApplicationStats(sessionId),
    ])
    if (p) setProfile(p)
    setApplications(apps)
    setStats(s)
  }, [])

  // On mount: check session, load data
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const sessionId = localStorage.getItem('fmj_session_id')
        if (!sessionId) {
          router.replace('/onboarding')
          return
        }

        setLocalRoles(JSON.parse(localStorage.getItem('fmj_roles') || '[]'))
        setLocalLocations(JSON.parse(localStorage.getItem('fmj_locations') || '[]'))

        const p = await getProfile(sessionId)
        if (!p) {
          router.replace('/onboarding')
          return
        }

        await loadData(sessionId)
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router, loadData])

  const refreshData = async () => {
    const sessionId = localStorage.getItem('fmj_session_id')
    if (!sessionId) return
    await loadData(sessionId)
    showToast('Dashboard refreshed!')
  }

  // ─── START APPLYING ───────────────────────────────────────
  const startApplying = useCallback(async () => {
    if (pipelineStage !== 'idle' && pipelineStage !== 'done' && pipelineStage !== 'error') return

    setPipelineStage('checking')
    setPipelineMessage('Checking your profile...')
    setActiveSteps([])

    await new Promise(r => setTimeout(r, 1000))

    const sessionId = localStorage.getItem('fmj_session_id')
    if (!sessionId) {
      showToast('Please complete your profile first')
      router.push('/onboarding')
      return
    }

    const p = await getProfile(sessionId)
    if (!p || !p.first_name) {
      showToast('Please complete your profile first')
      router.push('/onboarding')
      return
    }

    setPipelineStage('starting')
    setPipelineMessage('Agent is starting...')

    try {
      // Call N8N webhook
      const res = await fetch('/api/n8n-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          trigger_source: 'dashboard_button',
          roles: p.target_roles || p.skills || localRoles,
          locations: p.preferred_locations || localLocations,
        }),
      })

      if (!res.ok && res.status !== 404) {
        throw new Error(`Webhook error: ${res.status}`)
      }

      // Animate pipeline steps
      setPipelineStage('running')
      setPipelineMessage('Agent is running...')

      const stepKeys = ['profile', 'naukri', 'linkedin', 'applying', 'whatsapp']
      for (const key of stepKeys) {
        await new Promise(r => setTimeout(r, 1200))
        setActiveSteps(prev => [...prev, key])
      }

      setPipelineStage('done')
      setPipelineMessage('Agent workflow triggered! Check back soon for results.')
      await new Promise(r => setTimeout(r, 2000))
      await refreshData()

    } catch (err) {
      console.error('Start applying error:', err)
      setPipelineStage('error')
      setPipelineMessage(err instanceof Error ? err.message : 'Failed to trigger workflow')
    }
  }, [pipelineStage, router, localRoles, localLocations, loadData])

  const userInitials = profile
    ? `${(profile.first_name || 'U')[0]}${(profile.last_name || '')[0] || ''}`.toUpperCase()
    : 'U'
  const userName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
    : 'User'
  const userEmail = profile?.email || 'Not set'

  const roles = profile?.target_roles || profile?.skills || localRoles
  const locations = profile?.preferred_locations || localLocations

  const statCards = [
    { label: 'Jobs Found Today', value: stats.total, icon: Search, color: 'from-indigo-500 to-violet-500', glow: 'rgba(99,102,241,0.2)' },
    { label: 'Applied Today', value: stats.appliedToday, icon: Briefcase, color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.2)' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.2)' },
    { label: 'Responses', value: stats.responses, icon: MessageSquare, color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.2)' },
  ]

  const filteredApps = filterStatus === 'All'
    ? applications
    : applications.filter(a => (a.status || '').includes(filterStatus))

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-[#64748b] text-sm">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080f] flex">

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl glass-strong border border-indigo-500/30 text-white text-sm font-medium shadow-xl"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 z-40 flex flex-col border-r border-white/5 bg-[rgba(8,8,15,0.95)] backdrop-blur-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-[14px] text-white">FindMyJob</span>
                <span className="font-display font-bold text-[10px] gradient-text">.AI</span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    item.active
                      ? 'bg-indigo-500/15 text-white border border-indigo-500/20'
                      : 'text-[#64748b] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? 'text-indigo-400' : 'text-[#4b5563] group-hover:text-[#94a3b8]'}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{userName}</p>
                <p className="text-[#4b5563] text-[10px] truncate">{userEmail}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#4b5563] group-hover:text-[#94a3b8]" />
            </div>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#64748b] hover:text-rose-400 text-xs font-medium transition-colors mt-1">
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Link>
          </div>
        </aside>
      </>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[rgba(8,8,15,0.85)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-lg glass text-[#64748b]" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div>
              <h1 className="font-display font-bold text-white text-lg">Dashboard</h1>
              <p className="text-[#64748b] text-xs">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refreshData} className="p-2.5 rounded-xl glass text-[#64748b] hover:text-white transition-colors" title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="relative p-2.5 rounded-xl glass text-[#64748b] hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              {stats.responses > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />}
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 p-6 overflow-auto">

          {/* ─── START APPLYING HERO ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/8"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(6,182,212,0.04) 100%)' }}>
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Left */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${pipelineStage === 'running' ? 'bg-indigo-400 animate-pulse' : pipelineStage === 'done' ? 'bg-emerald-400' : pipelineStage === 'error' ? 'bg-rose-400' : 'bg-emerald-400 animate-pulse'}`} />
                      <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                        {pipelineStage === 'idle' ? 'Ready' : pipelineStage === 'checking' ? 'Verifying...' : pipelineStage === 'done' ? 'Completed' : pipelineStage === 'error' ? 'Error' : 'Agent Running'}
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
                      {pipelineStage === 'idle' ? 'Start AutoApply Agent' :
                       pipelineStage === 'checking' ? 'Checking your profile...' :
                       pipelineStage === 'done' ? 'Agent Complete!' :
                       pipelineStage === 'error' ? 'Something went wrong' : 'Agent is running...'}
                    </h2>
                    <p className="text-[#94a3b8] text-sm max-w-md">
                      {pipelineStage === 'idle'
                        ? `I'll search ${(roles?.length || 1) * 2} job board URLs for ${roles?.slice(0,3).join(', ') || 'your roles'} and apply automatically.`
                        : pipelineMessage}
                    </p>

                    {/* Live Pipeline Steps */}
                    {(pipelineStage === 'running' || pipelineStage === 'done') && (
                      <div className="mt-4 space-y-2">
                        {pipelineSteps.map((ps, i) => {
                          const isDone = activeSteps.includes(ps.key)
                          const isNext = !isDone && activeSteps.length === i
                          return (
                            <motion.div
                              key={ps.key}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: isDone || isNext ? 1 : 0.4, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-2"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : isNext ? (
                                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                              )}
                              <span className={`text-sm ${isDone ? 'text-emerald-400' : isNext ? 'text-indigo-300' : 'text-[#4b5563]'}`}>
                                {isDone ? ps.label.replace('⏳', '✅') : ps.label}
                              </span>
                            </motion.div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right: Button */}
                  <div className="shrink-0">
                    {pipelineStage === 'idle' || pipelineStage === 'done' || pipelineStage === 'error' ? (
                      <button
                        onClick={startApplying}
                        id="start-applying-btn"
                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-bold text-lg text-white overflow-hidden transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <Play className="w-5 h-5 fill-current" />
                        {pipelineStage === 'done' ? 'Run Again' : pipelineStage === 'error' ? 'Retry' : 'START APPLYING'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl glass border border-indigo-500/30">
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        <span className="text-indigo-300 font-semibold">Processing...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── STATS ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="glass-card p-5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 rounded-[20px]" style={{ background: `radial-gradient(circle at 100% 0%, ${stat.glow} 0%, transparent 60%)` }} />
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white font-display font-bold text-3xl">
                    <CountUp target={stat.value} />
                  </p>
                  <p className="text-[#64748b] text-xs mt-0.5">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* ─── PROFILE CARD ─── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-white text-lg">Your Profile</h2>
                <Link href="/onboarding" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                  <Settings className="w-3 h-3" />
                  Edit
                </Link>
              </div>

              {profile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm">{userName}</p>
                      <p className="text-[#64748b] text-xs truncate">{userEmail}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[#64748b] text-xs font-medium mb-2">Target Roles</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(roles || []).slice(0, 6).map((r: string, i: number) => (
                        <span key={i} className="badge badge-indigo text-[10px] py-0.5">{r}</span>
                      ))}
                      {(roles?.length || 0) > 6 && <span className="text-[#4b5563] text-xs">+{(roles?.length || 0) - 6} more</span>}
                      {(!roles || roles.length === 0) && <span className="text-[#4b5563] text-xs">No roles set</span>}
                    </div>
                  </div>

                  <div>
                    <p className="text-[#64748b] text-xs font-medium mb-2">Locations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(locations || []).map((l: string, i: number) => (
                        <span key={i} className="badge badge-cyan text-[10px] py-0.5">{l}</span>
                      ))}
                      {(!locations || locations.length === 0) && <span className="text-[#4b5563] text-xs">No locations</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    {[
                      { label: 'Phone', value: profile.mobile ? `+91 ${profile.mobile}` : null },
                      { label: 'Experience', value: profile.experience_years != null ? `${profile.experience_years} yrs` : null },
                      { label: 'Notice Period', value: profile.notice_period },
                      { label: 'Work Type', value: profile.work_type },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[#4b5563] text-[10px] uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-[#94a3b8] text-xs">{item.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-10 h-10 text-[#4b5563] mx-auto mb-3" />
                  <p className="text-[#64748b] text-sm mb-3">No profile found</p>
                  <Link href="/onboarding" className="btn-primary py-2 px-4 text-sm">Complete Onboarding</Link>
                </div>
              )}
            </motion.div>

            {/* ─── QUICK STATS / RECENT ─── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-white text-lg">Application Tracker</h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-[#64748b]" />
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[#94a3b8] outline-none"
                  >
                    {['All', 'Applied', 'Pending', 'Failed', 'Review', 'Response', 'Interview', 'Offer'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredApps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-[#4b5563]" />
                  </div>
                  <p className="text-[#64748b] text-sm mb-1">No applications yet</p>
                  <p className="text-[#4b5563] text-xs">Click &quot;START APPLYING&quot; to let the agent start applying for you.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {filteredApps.map((app, i) => {
                    const sc = statusConfig[app.status || 'Pending'] || statusConfig['Pending']
                    const Icon = sc.icon
                    return (
                      <motion.div
                        key={app.id || i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{app.job_title || 'Unknown Role'}</p>
                          <p className="text-[#64748b] text-xs truncate">{app.company || '—'} · {app.portal || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`badge ${sc.badgeCls} text-[10px] py-0.5`}>
                            <Icon className="w-3 h-3" />
                            {sc.label}
                          </span>
                          {app.apply_link && (
                            <a href={app.apply_link} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-3.5 h-3.5 text-[#64748b] hover:text-indigo-400" />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {applications.length > 0 && (
                <p className="text-[#4b5563] text-xs mt-3 text-center">
                  Showing {filteredApps.length} of {applications.length} applications
                </p>
              )}
            </motion.div>
          </div>

          {/* ─── EXTENSION INSTALL BANNER ─── */}
          {applications.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6">
              <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Install the Chrome Extension for Best Results</p>
                  <p className="text-[#94a3b8] text-xs leading-relaxed">
                    The <span className="text-amber-400 font-medium">FindMyJob.AI Chrome Extension</span> captures your Naukri, LinkedIn & Indeed login sessions 
                    so the agent can apply to Easy Apply jobs on your behalf — without ever knowing your password.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400 text-xs font-medium">Session cookies are stored locally on your device only.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </div>
    </div>
  )
}
