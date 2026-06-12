'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  Mail, MessageCircle, BookOpen, Send, CheckCircle2, Phone,
  MapPin, Clock, ArrowRight
} from 'lucide-react'

const channels = [
  {
    icon: Mail, title: 'Email Support',
    desc: 'Get a response within 24 hours.',
    link: 'mailto:support@findmyjob.ai', linkText: 'support@findmyjob.ai',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: MessageCircle, title: 'Live Chat',
    desc: 'Chat with our team during business hours.',
    link: '#', linkText: 'Start a chat',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: BookOpen, title: 'Documentation',
    desc: 'Explore our guides and API reference.',
    link: '#', linkText: 'Browse docs',
    color: 'from-emerald-500 to-teal-500',
  },
]

export default function ContactPage() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTimeout(() => setSubmitted(true), 400)
  }

  return (
    <>
      <div className="animated-bg" />
      <Navbar />
      <main className="pt-24 pb-16 min-h-screen">
        {/* Hero */}
        <div className="text-center py-14 px-6" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="badge badge-indigo">
              <MessageCircle className="w-3 h-3" />
              Get in Touch
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-5xl sm:text-6xl text-white mb-4"
          >
            We&apos;re here to <span className="gradient-text">help</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 }}
            className="text-[#64748b] text-lg max-w-lg mx-auto"
          >
            Have a question, feedback, or need support? Our team is ready to help.
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          {/* Support channels */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {channels.map((ch, i) => {
              const Icon = ch.icon
              return (
                <motion.a
                  href={ch.link}
                  key={ch.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="glass-card p-6 group cursor-pointer block"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-1">{ch.title}</h3>
                  <p className="text-[#64748b] text-sm mb-3">{ch.desc}</p>
                  <span className="text-indigo-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    {ch.linkText} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </motion.a>
              )
            })}
          </div>

          {/* Contact form + info */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3 glass-card p-8"
            >
              <h2 className="font-display font-bold text-2xl text-white mb-6">Send a message</h2>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <h3 className="text-white font-bold text-xl mb-2">Message sent!</h3>
                    <p className="text-[#64748b] text-sm">We&apos;ll get back to you within 24 hours.</p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                      className="mt-6 btn-secondary text-sm py-2 px-5"
                    >
                      Send another
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">Full Name</label>
                        <input
                          id="contact-name"
                          required
                          className="input-glass"
                          placeholder="John Doe"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">Email</label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          className="input-glass"
                          placeholder="john@example.com"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">Subject</label>
                      <select
                        id="contact-subject"
                        className="input-glass"
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      >
                        <option value="" disabled>Select a topic</option>
                        <option>General Question</option>
                        <option>Technical Support</option>
                        <option>Billing Issue</option>
                        <option>Feature Request</option>
                        <option>Partnership Inquiry</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">Message</label>
                      <textarea
                        id="contact-message"
                        required
                        rows={5}
                        className="input-glass resize-none"
                        placeholder="Tell us how we can help..."
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      />
                    </div>
                    <button type="submit" id="contact-submit" className="btn-primary w-full justify-center py-3.5">
                      <Send className="w-4 h-4" />
                      Send Message
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Info panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.45 }}
              className="lg:col-span-2 space-y-4"
            >
              {[
                { icon: Mail, label: 'Email', value: 'support@findmyjob.ai', color: 'text-indigo-400' },
                { icon: Phone, label: 'Phone', value: '+1 (888) 999-0123', color: 'text-violet-400' },
                { icon: MapPin, label: 'Office', value: '123 Tech Blvd, San Francisco, CA', color: 'text-cyan-400' },
                { icon: Clock, label: 'Hours', value: 'Mon–Fri, 9am–6pm PT', color: 'text-emerald-400' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="glass-card p-5 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl glass flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-[#64748b] text-xs mb-0.5">{item.label}</p>
                      <p className="text-white text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                )
              })}

              {/* Response time */}
              <div className="glass-card p-5">
                <p className="text-white font-semibold text-sm mb-2">⚡ Average Response Time</p>
                <div className="space-y-2">
                  {[
                    { label: 'Email', time: '< 24 hrs', pct: 85 },
                    { label: 'Live Chat', time: '< 5 min', pct: 95 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#64748b]">{item.label}</span>
                        <span className="text-white font-medium">{item.time}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full gradient-cool rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
