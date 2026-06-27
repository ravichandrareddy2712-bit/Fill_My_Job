'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ExternalLink, TrendingUp, Briefcase, CheckCircle2, Clock, XCircle,
  Play, Loader2, Zap, AlertTriangle, RefreshCw, User, MessageSquare,
  Search, Target, ArrowRight, StopCircle,
} from 'lucide-react'
import {
  getProfile, getApplications, getDashboardStats, getLatestAgentRun, createAgentRun,
  type UserProfile, type Application, type AgentRun, type DashboardStats,
} from '@/lib/supabase'

// ─── CountUp component ──────────────────────────────────────
function CountUp({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const steps = 30
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

// ─── Status config for application badges ───────────────────
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

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({ jobsFoundToday: 0, appliedToday: 0, pending: 0, responses: 0 })
  const [agentRun, setAgentRun] = useState<AgentRun | null>(null)
  const [starting, setStarting] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isAgentActive = agentRun?.status === 'running' || agentRun?.status === 'scraping' || agentRun?.status === 'applying'

  // ─── Load all data ──────────────────────────────────────────
  const loadData = useCallback(async (sessionId: string) => {
    const [p, apps, s, run] = await Promise.all([
      getProfile(sessionId),
      getApplications(sessionId),
      getDashboardStats(sessionId),
      getLatestAgentRun(sessionId),
    ])
    if (p) setProfile(p)
    setApplications(apps)
    setStats(s)
    if (run) setAgentRun(run)
  }, [])

  // ─── Poll for updates while agent is running ───────────────
  const pollData = useCallback(async () => {
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const sessionId = user.id

    const [apps, s, run] = await Promise.all([
      getApplications(sessionId),
      getDashboardStats(sessionId),
      getLatestAgentRun(sessionId),
    ])
    setApplications(apps)
    setStats(s)
    if (run) {
      setAgentRun(run)
      // Stop polling when agent is done
      if (run.status === 'done' || run.status === 'error') {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }
    }
  }, [])

  // ─── Initial load ──────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/')
          return
        }
        const sessionId = user.id
        localStorage.setItem('fmj_session_id', sessionId)
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
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [router, loadData])

  // ─── Start/stop polling when agent status changes ──────────
  useEffect(() => {
    if (isAgentActive && !pollingRef.current) {
      pollingRef.current = setInterval(pollData, 5000)
    } else if (!isAgentActive && pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [isAgentActive, pollData])

  // ─── START AGENT ──────────────────────────────────────────
  const startAgent = async () => {
    if (starting || isAgentActive) return
    setStarting(true)

    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/onboarding'); return }
      const sessionId = user.id

      const p = await getProfile(sessionId)
      if (!p || !p.first_name) { router.push('/onboarding'); return }

      // Create agent run record in Supabase
      const run = await createAgentRun(sessionId)
      if (run) setAgentRun(run)

      // Start polling for live updates while webhook runs
      pollingRef.current = setInterval(pollData, 5000)

      // Fire the n8n webhook and AWAIT it
      const res = await fetch('/api/n8n-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          agent_run_id: run?.id,
          trigger_source: 'dashboard_button',
          roles: p.target_roles || p.skills || [],
          locations: p.preferred_locations || [],
        }),
      })

      if (!res.ok) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
        setAgentRun(prev => prev ? { ...prev, status: 'error', message: 'Failed to trigger workflow' } : null)
        return
      }

      // If it succeeds, stop polling and update status to done (if not already handled by pollData)
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      setAgentRun(prev => prev ? { ...prev, status: 'done', message: 'All tasks completed.' } : null)
      
      // Reload stats
      await loadData(sessionId)
    } catch (err) {
      console.error('Start agent error:', err)
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
      setAgentRun(prev => prev ? { ...prev, status: 'error', message: 'Failed to connect to workflow' } : null)
    } finally {
      setStarting(false)
    }
  }

  // ─── Derived values ────────────────────────────────────────
  const roles = profile?.target_roles || profile?.skills || []
  const locations = profile?.preferred_locations || []
  const userInitials = profile
    ? `${(profile.first_name || 'U')[0]}${(profile.last_name || '')[0] || ''}`.toUpperCase()
    : 'U'
  const userName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
    : 'User'
  const userEmail = profile?.email || 'Not set'

  const statCards = [
    { label: 'Jobs Found Today', value: stats.jobsFoundToday, icon: Search, color: 'from-indigo-500 to-violet-500', glow: 'rgba(99,102,241,0.2)' },
    { label: 'Applied Today', value: stats.appliedToday, icon: Briefcase, color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.2)' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.2)' },
    { label: 'Responses', value: stats.responses, icon: MessageSquare, color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.2)' },
  ]

  // ─── Agent status display ─────────────────────────────────
  const getAgentDisplay = () => {
    if (!agentRun || agentRun.status === 'done' || agentRun.status === 'error') {
      return {
        statusLabel: agentRun?.status === 'done' ? 'COMPLETED' : agentRun?.status === 'error' ? 'ERROR' : 'READY',
        statusColor: agentRun?.status === 'done' ? 'text-emerald-400' : agentRun?.status === 'error' ? 'text-rose-400' : 'text-emerald-400',
        dotColor: agentRun?.status === 'done' ? 'bg-emerald-400' : agentRun?.status === 'error' ? 'bg-rose-400' : 'bg-emerald-400',
        title: agentRun?.status === 'done'
          ? `Agent Complete — Found ${agentRun.jobs_found || 0} jobs, Applied to ${agentRun.jobs_applied || 0}`
          : agentRun?.status === 'error'
          ? 'Something went wrong'
          : 'Start AutoApply Agent',
        subtitle: agentRun?.status === 'done'
          ? agentRun.message || 'All tasks completed.'
          : agentRun?.status === 'error'
          ? agentRun.message || 'The agent encountered an error. Try again.'
          : `I'll search job boards for ${(roles as string[]).slice(0, 3).join(', ') || 'your roles'} and apply automatically.`,
      }
    }
    // Active states
    return {
      statusLabel: agentRun.status === 'scraping' ? 'SCRAPING JOBS' : agentRun.status === 'applying' ? 'APPLYING' : 'STARTING',
      statusColor: 'text-indigo-400',
      dotColor: 'bg-indigo-400 animate-pulse',
      title: agentRun.status === 'scraping'
        ? `Scraping jobs... (${agentRun.jobs_found || 0} found so far)`
        : agentRun.status === 'applying'
        ? `Applying to jobs... (${agentRun.jobs_applied || 0}/${agentRun.jobs_found || 0})`
        : 'Agent is starting...',
      subtitle: agentRun.message || 'Working...',
    }
  }

  const agentDisplay = getAgentDisplay()

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
    <div className="p-6">
      {/* ─── AGENT CONTROL HERO ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/8"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(6,182,212,0.04) 100%)' }}>
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${agentDisplay.dotColor}`} />
                  <span className={`${agentDisplay.statusColor} text-xs font-semibold uppercase tracking-wider`}>
                    {agentDisplay.statusLabel}
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
                  {agentDisplay.title}
                </h2>
                <p className="text-[#94a3b8] text-sm max-w-lg">
                  {agentDisplay.subtitle}
                </p>

                {/* Live progress bar when agent is active */}
                {isAgentActive && (agentRun?.jobs_found || 0) > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-[#64748b] mb-1">
                      <span>Progress</span>
                      <span>{agentRun?.jobs_applied || 0} / {agentRun?.jobs_found || 0} applied</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((agentRun?.jobs_applied || 0) / (agentRun?.jobs_found || 1)) * 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Button */}
              <div className="shrink-0">
                {isAgentActive ? (
                  <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-indigo-500/30">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    <span className="text-indigo-300 font-semibold">Agent Running...</span>
                  </div>
                ) : (
                  <button
                    onClick={startAgent}
                    disabled={starting}
                    id="start-applying-btn"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-bold text-lg text-white overflow-hidden transition-all hover:scale-105 active:scale-95 animate-pulse-glow disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {starting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Play className="w-5 h-5 fill-current" />
                    )}
                    {agentRun?.status === 'done' ? 'Run Again' : agentRun?.status === 'error' ? 'Retry' : 'START APPLYING'}
                  </button>
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
              {isAgentActive && (
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ─── PROFILE CARD ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-white text-lg">Your Profile</h2>
            <div className="flex items-center gap-2">
              <Link href="/onboarding" className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                Edit
              </Link>
              <button 
                onClick={async () => {
                  const { createClient } = await import('@/utils/supabase/client')
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  localStorage.removeItem('fmj_session_id')
                  router.replace('/')
                }}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              >
                Sign Out
              </button>
            </div>
          </div>

          {profile ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
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
                  {(roles as string[]).slice(0, 6).map((r: string, i: number) => (
                    <span key={i} className="badge badge-indigo text-[10px] py-0.5">{r}</span>
                  ))}
                  {(roles?.length || 0) > 6 && <span className="text-[#4b5563] text-xs">+{(roles?.length || 0) - 6} more</span>}
                  {(!roles || roles.length === 0) && <span className="text-[#4b5563] text-xs">No roles set</span>}
                </div>
              </div>

              <div>
                <p className="text-[#64748b] text-xs font-medium mb-2">Locations</p>
                <div className="flex flex-wrap gap-1.5">
                  {(locations as string[]).map((l: string, i: number) => (
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

        {/* ─── RECENT APPLICATIONS ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="font-display font-semibold text-white text-lg">Recent Applications</h2>
              {isAgentActive && (
                <span className="badge badge-indigo text-[10px] py-0.5 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  LIVE
                </span>
              )}
            </div>
            <Link href="/dashboard/applications" className="text-indigo-400 text-xs font-medium hover:text-indigo-300 flex items-center gap-1">
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-[#4b5563]" />
              </div>
              <p className="text-[#64748b] text-sm mb-1">No applications yet</p>
              <p className="text-[#4b5563] text-xs">Click &quot;START APPLYING&quot; to let the agent start applying for you.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {applications.slice(0, 10).map((app, i) => {
                  const sc = statusConfig[app.status || 'Pending'] || statusConfig['Pending']
                  const Icon = sc.icon
                  return (
                    <motion.div
                      key={app.id || i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      layout
                      transition={{ delay: i * 0.03 }}
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
              </AnimatePresence>
            </div>
          )}

          {applications.length > 0 && (
            <p className="text-[#4b5563] text-xs mt-3 text-center">
              Showing {Math.min(10, applications.length)} of {applications.length} applications
            </p>
          )}
        </motion.div>
      </div>

      {/* ─── QUICK LINKS ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 grid md:grid-cols-2 gap-4">
        <Link href="/dashboard/matches" className="p-5 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-indigo-500/30 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Job Matches</p>
            <p className="text-[#64748b] text-xs">View all {stats.jobsFoundToday} scraped jobs in a detailed table</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#4b5563] ml-auto group-hover:text-indigo-400 transition-colors" />
        </Link>
        <Link href="/dashboard/applications" className="p-5 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-emerald-500/30 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
            <Briefcase className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Applications</p>
            <p className="text-[#64748b] text-xs">Track all {applications.length} submitted applications</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#4b5563] ml-auto group-hover:text-emerald-400 transition-colors" />
        </Link>
      </motion.div>
    </div>
  )
}
