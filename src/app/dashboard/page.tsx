'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BrainCircuit, LayoutDashboard, Target, FileText, Bell,
  Settings, LogOut, ChevronDown, Search, ExternalLink,
  TrendingUp, Briefcase, CheckCircle2, Clock, XCircle,
  MoreHorizontal, Filter, Plus, Menu, X
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', active: true },
  { icon: Target, label: 'Job Matches', href: '#', badge: '127' },
  { icon: FileText, label: 'Applications', href: '#' },
  { icon: Bell, label: 'Notifications', href: '#', badge: '3' },
  { icon: Settings, label: 'Settings', href: '#' },
]

const stats = [
  { label: 'Jobs Found', value: 1842, icon: Search, color: 'from-indigo-500 to-violet-500', glow: 'rgba(99,102,241,0.2)', delta: '+24 today' },
  { label: 'Jobs Matched', value: 127, icon: Target, color: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.2)', delta: '+8 today' },
  { label: 'Applications Applied', value: 34, icon: Briefcase, color: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.2)', delta: '+2 today' },
  { label: 'Interviews Tracked', value: 6, icon: TrendingUp, color: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.2)', delta: '+1 this week' },
]

const applications = [
  { id: 1, company: 'Google', role: 'Senior Software Engineer', location: 'Mountain View, CA', date: 'Jun 8', status: 'Interview', match: 96 },
  { id: 2, company: 'Stripe', role: 'Full-Stack Engineer', location: 'Remote', date: 'Jun 7', status: 'Applied', match: 91 },
  { id: 3, company: 'Figma', role: 'Frontend Engineer', location: 'San Francisco, CA', date: 'Jun 6', status: 'Applied', match: 88 },
  { id: 4, company: 'Notion', role: 'Software Engineer II', location: 'Remote', date: 'Jun 5', status: 'Offer', match: 94 },
  { id: 5, company: 'Linear', role: 'Product Engineer', location: 'Remote', date: 'Jun 4', status: 'Rejected', match: 79 },
  { id: 6, company: 'Vercel', role: 'Developer Advocate', location: 'Remote', date: 'Jun 3', status: 'Interview', match: 85 },
]

const notifications = [
  { text: 'New match: Staff Engineer at Anthropic', time: '2m ago', icon: Target, color: 'text-indigo-400', unread: true },
  { text: 'Google moved your application to Interview', time: '1h ago', icon: TrendingUp, color: 'text-emerald-400', unread: true },
  { text: 'New match: Backend Engineer at Vercel', time: '3h ago', icon: Target, color: 'text-violet-400', unread: true },
  { text: 'Notion sent you an offer! 🎉', time: 'Yesterday', icon: CheckCircle2, color: 'text-emerald-400', unread: false },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  Applied: { label: 'Applied', color: 'badge-indigo', icon: Clock },
  Interview: { label: 'Interview', color: 'badge-amber', icon: TrendingUp },
  Offer: { label: 'Offer', color: 'badge-emerald', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', color: 'badge-rose', icon: XCircle },
}

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

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#08080f] flex">
      {/* Sidebar */}
      <>
        {/* Overlay for mobile */}
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
                  <Icon className={`w-4.5 h-4.5 ${item.active ? 'text-indigo-400' : 'text-[#4b5563] group-hover:text-[#94a3b8]'}`} />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">
                      {item.badge}
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
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">John Doe</p>
                <p className="text-[#4b5563] text-[10px] truncate">john@example.com</p>
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
              <p className="text-[#64748b] text-xs">Monday, June 9, 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl glass text-[#64748b] hover:text-white transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            <button className="btn-primary py-2 px-4 text-sm">
              <Plus className="w-4 h-4" />
              Add Job
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
                    <CountUp target={stat.value} />
                  </p>
                  <p className="text-[#64748b] text-xs mt-0.5">{stat.label}</p>
                  <p className="text-emerald-400 text-[10px] mt-1.5 font-medium">{stat.delta}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Applications Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 glass-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-white text-lg">Applications</h2>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5">
                    <Filter className="w-3 h-3" />
                    Filter
                  </button>
                  <button className="btn-primary py-1.5 px-3 text-xs">
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {applications.map((app, i) => {
                  const s = statusConfig[app.status]
                  const Icon = s.icon
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/2 hover:bg-white/4 border border-transparent hover:border-white/5 transition-all group cursor-pointer"
                    >
                      {/* Company avatar */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: `hsl(${app.id * 47 + 180}, 65%, 45%)` }}
                      >
                        {app.company[0]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium truncate">{app.role}</p>
                        </div>
                        <p className="text-[#64748b] text-xs">{app.company} · {app.location}</p>
                      </div>

                      {/* Match */}
                      <div className="hidden sm:block text-center shrink-0">
                        <p className="text-white text-sm font-bold">{app.match}%</p>
                        <p className="text-[#4b5563] text-[10px]">match</p>
                      </div>

                      {/* Status badge */}
                      <span className={`badge ${s.color} shrink-0 hidden sm:flex items-center gap-1`}>
                        <Icon className="w-2.5 h-2.5" />
                        {s.label}
                      </span>

                      {/* Date */}
                      <p className="text-[#4b5563] text-xs shrink-0 hidden md:block">{app.date}</p>

                      <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#64748b] hover:text-white hover:bg-white/10 transition-all">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <p className="text-[#64748b] text-xs">Showing 6 of 34 applications</p>
                <button className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1 font-medium">
                  View all <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>

            {/* Notifications Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-semibold text-white text-lg">Notifications</h2>
                <span className="badge badge-indigo text-[10px]">3 new</span>
              </div>

              <div className="space-y-3">
                {notifications.map((n, i) => {
                  const Icon = n.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                        n.unread ? 'bg-indigo-500/5 border border-indigo-500/10' : 'bg-white/2 hover:bg-white/4'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className={`w-3.5 h-3.5 ${n.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#94a3b8] text-xs leading-relaxed">{n.text}</p>
                        <p className="text-[#4b5563] text-[10px] mt-1">{n.time}</p>
                      </div>
                      {n.unread && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />}
                    </motion.div>
                  )
                })}
              </div>

              <button className="w-full mt-4 py-2.5 rounded-xl text-[#64748b] text-xs hover:text-white hover:bg-white/5 transition-colors border border-white/5">
                View all notifications
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
