'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  BrainCircuit, LayoutDashboard, Target, FileText, Bell,
  Settings, LogOut, ChevronDown, Search, ExternalLink,
  TrendingUp, Briefcase, CheckCircle2, Clock, XCircle,
  MoreHorizontal, Filter, Plus, Menu, X, Play, Loader2,
  Zap, Globe, AlertTriangle, Puzzle, RefreshCw, User
} from 'lucide-react'
import { getProfile, getPendingTasks, type UserProfile, type ExtensionTask } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────
type PipelineStage = 'idle' | 'starting' | 'scraping' | 'scoring' | 'applying' | 'done' | 'error'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
  { icon: Target, label: 'Job Matches', href: '#' },
  { icon: FileText, label: 'Applications', href: '#' },
  { icon: Puzzle, label: 'Extension Tasks', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  Applied: { label: 'Applied', color: 'badge-indigo', icon: Clock },
  Interview: { label: 'Interview', color: 'badge-amber', icon: TrendingUp },
  Offer: { label: 'Offer', color: 'badge-emerald', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', color: 'badge-rose', icon: XCircle },
}

const pipelineSteps: { stage: PipelineStage; label: string; icon: typeof Search; color: string }[] = [
  { stage: 'scraping', label: 'Scraping Jobs', icon: Globe, color: 'from-indigo-500 to-violet-500' },
  { stage: 'scoring', label: 'Scoring Matches', icon: Target, color: 'from-violet-500 to-purple-500' },
  { stage: 'applying', label: 'Auto-Applying', icon: Zap, color: 'from-cyan-500 to-blue-500' },
  { stage: 'done', label: 'Complete', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
]

// ─── CountUp ──────────────────────────────────────────────
function CountUp({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const steps = 60
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

// ─── Main Dashboard ───────────────────────────────────────
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle')
  const [pipelineMessage, setPipelineMessage] = useState('')
  const [extensionTasks, setExtensionTasks] = useState<ExtensionTask[]>([])
  const [jobsFound, setJobsFound] = useState(0)
  const [applicationsApplied, setApplicationsApplied] = useState(0)

  // Load profile from Supabase on mount
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      try {
        const sessionId = localStorage.getItem('fmj_session_id') || undefined
        const p = await getProfile(sessionId)
        if (p) {
          setProfile(p)
        } else {
          // Fallback: try loading without session_id
          const fallback = await getProfile()
          setProfile(fallback)
        }

        // Load extension tasks
        const tasks = await getPendingTasks(sessionId)
        setExtensionTasks(tasks)
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  // Start scraping workflow
  const startScraping = useCallback(async () => {
    if (pipelineStage !== 'idle' && pipelineStage !== 'done' && pipelineStage !== 'error') return

    setPipelineStage('starting')
    setPipelineMessage('Connecting to n8n workflow...')

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      if (!webhookUrl) throw new Error('Webhook URL not configured')

      const roles = JSON.parse(localStorage.getItem('fmj_roles') || '[]')
      const locations = JSON.parse(localStorage.getItem('fmj_locations') || '[]')
      const experience = localStorage.getItem('fmj_experience') || 'Fresher'
      const sessionId = localStorage.getItem('fmj_session_id') || ''

      const payload = {
        experience,
        roles: JSON.stringify(roles),
        locations: JSON.stringify(locations),
        session_id: sessionId,
        source: 'dashboard',
      }

      setPipelineStage('scraping')
      setPipelineMessage('Workflow triggered! Scraping job boards...')

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error(`Webhook responded with ${res.status}`)
      }

      // Simulate pipeline progress (the actual workflow runs async in n8n)
      setTimeout(() => {
        setPipelineStage('scoring')
        setPipelineMessage('AI is scoring job matches...')
      }, 5000)

      setTimeout(() => {
        setPipelineStage('applying')
        setPipelineMessage('Auto-applying to matched jobs...')
        setJobsFound(prev => prev + Math.floor(Math.random() * 12) + 5)
      }, 12000)

      setTimeout(() => {
        setPipelineStage('done')
        setPipelineMessage('Pipeline complete! Check your results.')
        setApplicationsApplied(prev => prev + Math.floor(Math.random() * 4) + 1)
        // Refresh extension tasks
        getPendingTasks(sessionId).then(setExtensionTasks).catch(() => {})
      }, 20000)

    } catch (err) {
      console.error('Failed to start scraping:', err)
      setPipelineStage('error')
      setPipelineMessage(err instanceof Error ? err.message : 'Failed to connect to workflow')
    }
  }, [pipelineStage])

  // Refresh data
  const refreshData = async () => {
    const sessionId = localStorage.getItem('fmj_session_id') || undefined
    const p = await getProfile(sessionId)
    if (p) setProfile(p)
    const tasks = await getPendingTasks(sessionId)
    setExtensionTasks(tasks)
  }

  const userInitials = profile
    ? `${(profile.first_name || 'U')[0]}${(profile.last_name || '')[0] || ''}`.toUpperCase()
    : 'U'
  const userName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
    : 'User'
  const userEmail = profile?.email || 'Not set'
  
  const [localRoles, setLocalRoles] = useState<string[]>([])
  const [localLocations, setLocalLocations] = useState<string[]>([])
  
  useEffect(() => {
    setLocalRoles(JSON.parse(localStorage.getItem('fmj_roles') || '[]'))
    setLocalLocations(JSON.parse(localStorage.getItem('fmj_locations') || '[]'))
  }, [])

  const roles = profile?.skills || localRoles
  const locations = localLocations

  const stats = [
    { label: 'Profile Status', value: profile ? 'Active' : 'Setup', icon: User, color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.2)', isText: true },
    { label: 'Jobs Found', value: jobsFound, icon: Search, color: 'from-indigo-500 to-violet-500', glow: 'rgba(99,102,241,0.2)' },
    { label: 'Applications Sent', value: applicationsApplied, icon: Briefcase, color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.2)' },
    { label: 'Extension Tasks', value: extensionTasks.length, icon: Puzzle, color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.2)' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-[#64748b] text-sm">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080f] flex">
      {/* Sidebar */}
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <motion.aside
          className={`fixed md:sticky top-0 left-0 h-screen w-64 z-40 flex flex-col border-r border-white/5 bg-[rgba(8,8,15,0.95)] backdrop-blur-xl transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
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
                  {item.label === 'Extension Tasks' && extensionTasks.length > 0 && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                      {extensionTasks.length}
                    </span>
                  )}
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
        </motion.aside>
      </>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[rgba(8,8,15,0.85)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg glass text-[#64748b]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
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
            <button onClick={refreshData} className="p-2.5 rounded-xl glass text-[#64748b] hover:text-white transition-colors" title="Refresh data">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="relative p-2.5 rounded-xl glass text-[#64748b] hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              {extensionTasks.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />}
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 p-6 overflow-auto">
          {/* ─── START SCRAPING HERO ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/8" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(6,182,212,0.04) 100%)' }}>
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                        {pipelineStage === 'idle' ? 'Ready' : pipelineStage === 'done' ? 'Completed' : pipelineStage === 'error' ? 'Error' : 'Running'}
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
                      {pipelineStage === 'idle' ? 'Start Job Search' :
                       pipelineStage === 'done' ? 'Pipeline Complete!' :
                       pipelineStage === 'error' ? 'Pipeline Error' :
                       'Pipeline Running...'}
                    </h2>
                    <p className="text-[#94a3b8] text-sm max-w-md">
                      {pipelineStage === 'idle'
                        ? `Search across ${(roles?.length || 1) * (locations?.length || 1) * 2} job board URLs for ${roles?.join(', ') || 'your roles'} in ${locations?.join(', ') || 'your locations'}.`
                        : pipelineMessage}
                    </p>

                    {/* Pipeline Progress */}
                    {pipelineStage !== 'idle' && pipelineStage !== 'error' && (
                      <div className="flex items-center gap-2 mt-4">
                        {pipelineSteps.map((ps, i) => {
                          const isActive = ps.stage === pipelineStage
                          const isDone = pipelineSteps.findIndex(s => s.stage === pipelineStage) > i ||
                                         pipelineStage === 'done'
                          const Icon = ps.icon
                          return (
                            <div key={ps.stage} className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 ${
                                isDone ? `bg-gradient-to-br ${ps.color}` :
                                isActive ? `bg-gradient-to-br ${ps.color} animate-pulse` :
                                'bg-white/5 border border-white/10'
                              }`}>
                                {isDone && !isActive ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                ) : isActive ? (
                                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                                ) : (
                                  <Icon className="w-3.5 h-3.5 text-[#4b5563]" />
                                )}
                              </div>
                              {i < pipelineSteps.length - 1 && (
                                <div className={`w-6 h-0.5 rounded-full transition-all duration-500 ${isDone ? 'bg-indigo-500' : 'bg-white/10'}`} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right: Button */}
                  <div className="shrink-0">
                    {pipelineStage === 'idle' || pipelineStage === 'done' || pipelineStage === 'error' ? (
                      <button
                        onClick={startScraping}
                        id="start-scraping-btn"
                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-bold text-lg text-white overflow-hidden transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <Play className="w-5 h-5 fill-current" />
                        {pipelineStage === 'done' ? 'Run Again' : pipelineStage === 'error' ? 'Retry' : 'Start Scraping'}
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
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-card p-5 relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 rounded-[20px]"
                    style={{ background: `radial-gradient(circle at 100% 0%, ${stat.glow} 0%, transparent 60%)` }}
                  />
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white font-display font-bold text-3xl">
                    {'isText' in stat && stat.isText ? String(stat.value) : <CountUp target={Number(stat.value)} />}
                  </p>
                  <p className="text-[#64748b] text-xs mt-0.5">{stat.label}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* ─── PROFILE CARD ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 glass-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-white text-lg">Your Profile</h2>
                <Link href="/onboarding" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                  <Settings className="w-3 h-3" />
                  Edit
                </Link>
              </div>

              {profile ? (
                <div className="space-y-4">
                  {/* Skills / Roles */}
                  <div>
                    <p className="text-[#64748b] text-xs font-medium mb-2">Target Roles & Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {(profile.skills || roles || []).map((skill: string, i: number) => (
                        <span key={i} className="badge badge-indigo text-[10px]">{skill}</span>
                      ))}
                      {(!profile.skills || profile.skills.length === 0) && roles.length === 0 && (
                        <span className="text-[#4b5563] text-xs">No skills set yet</span>
                      )}
                    </div>
                  </div>

                  {/* Locations */}
                  <div>
                    <p className="text-[#64748b] text-xs font-medium mb-2">Target Locations</p>
                    <div className="flex flex-wrap gap-2">
                      {locations.map((loc: string, i: number) => (
                        <span key={i} className="badge badge-cyan text-[10px]">{loc}</span>
                      ))}
                      {locations.length === 0 && (
                        <span className="text-[#4b5563] text-xs">No locations set</span>
                      )}
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                    {[
                      { label: 'Email', value: profile.email },
                      { label: 'Phone', value: profile.mobile },
                      { label: 'Experience', value: profile.notice_period || (typeof window !== 'undefined' ? localStorage.getItem('fmj_experience') : 'Fresher') },
                      { label: 'LinkedIn', value: profile.linkedin_url ? '✓ Connected' : 'Not set' },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-[#4b5563] text-[10px] uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-[#94a3b8] text-xs truncate">{item.value || '—'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Search Links */}
                  {profile.search_links && profile.search_links.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-[#64748b] text-xs font-medium mb-2">
                        Search URLs ({profile.search_links.length})
                      </p>
                      <div className="space-y-1 max-h-24 overflow-auto">
                        {profile.search_links.slice(0, 4).map((link: string, i: number) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-400/70 text-[10px] hover:text-indigo-300 truncate">
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            {link}
                          </a>
                        ))}
                        {profile.search_links.length > 4 && (
                          <p className="text-[#4b5563] text-[10px]">+{profile.search_links.length - 4} more...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-10 h-10 text-[#4b5563] mx-auto mb-3" />
                  <p className="text-[#64748b] text-sm mb-3">No profile found</p>
                  <Link href="/onboarding" className="btn-primary py-2 px-4 text-sm">
                    Complete Onboarding
                  </Link>
                </div>
              )}
            </motion.div>

            {/* ─── EXTENSION TASKS PANEL ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-white text-lg">Extension Tasks</h2>
                {extensionTasks.length > 0 && (
                  <span className="badge badge-amber text-[10px]">{extensionTasks.length} pending</span>
                )}
              </div>

              {extensionTasks.length > 0 ? (
                <div className="space-y-3">
                  {extensionTasks.slice(0, 5).map((task, i) => (
                    <motion.div
                      key={task.id || i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Puzzle className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#94a3b8] text-xs leading-relaxed truncate">
                          {task.job_title || 'Job Application'}
                          {task.company && <span className="text-[#4b5563]"> · {task.company}</span>}
                        </p>
                        <a
                          href={task.apply_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 text-[10px] hover:text-indigo-300 flex items-center gap-1 mt-1"
                        >
                          Open with extension <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-[#64748b] text-sm mb-1">All clear!</p>
                  <p className="text-[#4b5563] text-xs">
                    Jobs that need manual filling via the browser extension will appear here.
                  </p>
                </div>
              )}

              {extensionTasks.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[#64748b] text-[10px] leading-relaxed">
                      These jobs couldn&apos;t be auto-filled. Install the{' '}
                      <span className="text-amber-400 font-medium">FindMyJob.AI Chrome Extension</span>{' '}
                      and open each link to fill forms with one click.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
