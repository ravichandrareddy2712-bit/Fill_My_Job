'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Filter, ExternalLink, CheckCircle2, Clock, XCircle, AlertTriangle, MessageSquare, TrendingUp, Loader2 } from 'lucide-react'
import { getApplications, type Application } from '@/lib/supabase'

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

  useEffect(() => {
    const fetchApps = async () => {
      const sessionId = localStorage.getItem('fmj_session_id')
      if (sessionId) {
        const apps = await getApplications(sessionId)
        setApplications(apps)
      }
      setLoading(false)
    }
    fetchApps()
  }, [])

  const filteredApps = filterStatus === 'All'
    ? applications
    : applications.filter(a => (a.status || '').includes(filterStatus))

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-2">Applications</h1>
          <p className="text-[#94a3b8]">Track all your automated and manual job applications.</p>
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
                When the agent applies to jobs, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app, i) => {
                const sc = statusConfig[app.status || 'Pending'] || statusConfig['Pending']
                const Icon = sc.icon
                return (
                  <div
                    key={app.id || i}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-base truncate">{app.job_title || 'Unknown Role'}</h3>
                      <p className="text-[#64748b] text-sm truncate">{app.company || '—'} · {app.portal || '—'}</p>
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
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
