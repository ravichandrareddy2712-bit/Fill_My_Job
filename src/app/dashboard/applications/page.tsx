'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Filter, ExternalLink, CheckCircle2, Clock, XCircle,
  AlertTriangle, MessageSquare, TrendingUp, Loader2
} from 'lucide-react'
import { getApplications, getLatestAgentRun, type Application, type AgentRun } from '@/lib/supabase'

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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filterStatus, setFilterStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [agentRun, setAgentRun] = useState<AgentRun | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isAgentActive = agentRun?.status === 'running' || agentRun?.status === 'scraping' || agentRun?.status === 'applying'

  const loadApps = async () => {
    const sessionId = localStorage.getItem('fmj_session_id')
    if (!sessionId) return
    const [apps, run] = await Promise.all([
      getApplications(sessionId),
      getLatestAgentRun(sessionId),
    ])
    setApplications(apps)
    if (run) setAgentRun(run)
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await loadApps()
      setLoading(false)
    }
    init()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  // Poll while agent is active
  useEffect(() => {
    if (isAgentActive && !pollingRef.current) {
      pollingRef.current = setInterval(loadApps, 5000)
    } else if (!isAgentActive && pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [isAgentActive])

  const filteredApps = filterStatus === 'All'
    ? applications
    : applications.filter(a => (a.status || '').includes(filterStatus))

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-2xl text-white">Applications</h1>
            {isAgentActive && (
              <span className="badge badge-emerald text-[10px] py-0.5 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                APPLYING
              </span>
            )}
          </div>
          <p className="text-[#94a3b8] text-sm mt-1">Track all your automated and manual job applications.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#64748b]" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#94a3b8] outline-none"
          >
            {['All', 'Applied', 'Pending', 'Failed', 'Review', 'Response', 'Interview', 'Offer'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card p-6">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-[#4b5563]" />
              </div>
              <p className="text-[#94a3b8] text-lg font-medium mb-1">No applications found</p>
              <p className="text-[#64748b] text-sm">
                When the agent applies to jobs, they will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app, i) => {
                  const sc = statusConfig[app.status || 'Pending'] || statusConfig['Pending']
                  const Icon = sc.icon
                  return (
                    <motion.div
                      key={app.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      layout
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-base truncate">{app.job_title || 'Unknown Role'}</h3>
                        <p className="text-[#64748b] text-sm truncate">{app.company || '—'} · {app.portal || '—'}</p>
                        {app.applied_at && (
                          <p className="text-[#4b5563] text-xs mt-1">
                            {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`badge ${sc.badgeCls} text-xs py-1 px-3`}>
                          <Icon className="w-3.5 h-3.5" />
                          {sc.label}
                        </span>
                        {app.apply_link ? (
                          <a href={app.apply_link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-[#64748b] hover:text-indigo-400 hover:bg-white/10 transition-all">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <div className="p-2 w-8" />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}

          {applications.length > 0 && (
            <p className="text-[#4b5563] text-xs mt-4 text-center">
              Showing {filteredApps.length} of {applications.length} applications
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
