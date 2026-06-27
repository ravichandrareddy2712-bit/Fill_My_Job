'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Search, ExternalLink, Filter, Briefcase, Loader2, Target,
  CheckCircle2, Clock, XCircle, ArrowUpDown, Globe
} from 'lucide-react'
import { getScrapedJobs, getLatestAgentRun, type ScrapedJob, type AgentRun } from '@/lib/supabase'

const statusColors: Record<string, { bg: string; text: string }> = {
  'Found':   { bg: 'bg-indigo-500/15 border-indigo-500/30', text: 'text-indigo-400' },
  'Applied': { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400' },
  'Skipped': { bg: 'bg-gray-500/15 border-gray-500/30', text: 'text-gray-400' },
  'Failed':  { bg: 'bg-rose-500/15 border-rose-500/30', text: 'text-rose-400' },
}

export default function JobMatchesPage() {
  const [jobs, setJobs] = useState<ScrapedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPortal, setFilterPortal] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [agentRun, setAgentRun] = useState<AgentRun | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isAgentActive = agentRun?.status === 'running' || agentRun?.status === 'scraping' || agentRun?.status === 'applying'

  const loadJobs = async () => {
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const sessionId = user.id

    const [j, run] = await Promise.all([
      getScrapedJobs(sessionId),
      getLatestAgentRun(sessionId),
    ])
    setJobs(j)
    if (run) setAgentRun(run)
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await loadJobs()
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
      pollingRef.current = setInterval(loadJobs, 5000)
    } else if (!isAgentActive && pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [isAgentActive])

  // Get unique portals for filter
  const portals = ['All', ...Array.from(new Set(jobs.map(j => j.portal).filter(Boolean)))]
  const types = ['All', 'Easy Apply', 'External']

  const filteredJobs = jobs.filter(j => {
    if (filterPortal !== 'All' && j.portal !== filterPortal) return false
    if (filterType === 'Easy Apply' && j.apply_type !== 'Easy Apply') return false
    if (filterType === 'External' && j.apply_type === 'Easy Apply') return false
    return true
  })

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-2xl text-white">Job Matches</h1>
            {isAgentActive && (
              <span className="badge badge-indigo text-[10px] py-0.5 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                SCANNING
              </span>
            )}
          </div>
          <p className="text-[#94a3b8] text-sm mt-1">
            {jobs.length > 0
              ? `${jobs.length} jobs scraped from job boards`
              : 'Jobs will appear here after you run the agent'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#64748b]" />
          <select value={filterPortal} onChange={e => setFilterPortal(e.target.value)}
            className="text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#94a3b8] outline-none">
            {portals.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[#94a3b8] outline-none">
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-[#4b5563]" />
              </div>
              <p className="text-[#94a3b8] text-lg font-medium mb-1">
                {jobs.length === 0 ? 'No jobs scraped yet' : 'No jobs match your filter'}
              </p>
              <p className="text-[#64748b] text-sm">
                {jobs.length === 0
                  ? 'Go to the Dashboard and click "START APPLYING" to begin scraping.'
                  : 'Try changing your filters above.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Job Title', 'Company', 'Location', 'Portal', 'Type', 'Status', 'Link'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[#64748b] text-xs font-semibold uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job, i) => {
                    const sc = statusColors[job.status || 'Found'] || statusColors['Found']
                    return (
                      <motion.tr
                        key={job.id || i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-white/3 hover:bg-white/3 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="text-white text-sm font-medium truncate max-w-[240px]">{job.job_title || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#94a3b8] text-sm truncate max-w-[160px]">{job.company || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[#64748b] text-sm truncate max-w-[120px]">{job.location || '—'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="badge badge-indigo text-[10px] py-0.5">
                            <Globe className="w-3 h-3" />
                            {job.portal || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                            job.apply_type === 'Easy Apply'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {job.apply_type || 'External'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${sc.bg} ${sc.text}`}>
                            {job.status || 'Found'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {job.apply_link ? (
                            <a href={job.apply_link} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white/5 text-[#64748b] hover:text-indigo-400 hover:bg-white/10 transition-all inline-flex">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-[#4b5563] text-xs">—</span>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {filteredJobs.length > 0 && (
        <p className="text-[#4b5563] text-xs mt-3 text-center">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      )}
    </div>
  )
}
