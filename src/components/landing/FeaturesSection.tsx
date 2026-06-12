'use client'

import { useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Upload, Brain, Target, BarChart3, Bell, ArrowRight, Zap } from 'lucide-react'

const features = [
  {
    id: 'resume-upload',
    icon: Upload,
    title: 'Resume Upload',
    description: 'Drag & drop your PDF resume. Our parser intelligently extracts every detail — experience, education, projects, and more.',
    color: 'from-indigo-500 to-violet-500',
    glow: 'rgba(99,102,241,0.25)',
    border: 'rgba(99,102,241,0.2)',
    tag: 'Smart Parser',
    stat: '0.3s',
    statLabel: 'Parse time',
  },
  {
    id: 'skill-extraction',
    icon: Brain,
    title: 'AI Skill Extraction',
    description: 'Our LLM engine extracts 50+ skills from your resume and maps them to industry-standard taxonomies automatically.',
    color: 'from-violet-500 to-purple-500',
    glow: 'rgba(139,92,246,0.25)',
    border: 'rgba(139,92,246,0.2)',
    tag: 'GPT-Powered',
    stat: '50+',
    statLabel: 'Skills mapped',
  },
  {
    id: 'job-matching',
    icon: Target,
    title: 'Job Matching',
    description: 'Semantic matching against thousands of live job postings. Get ranked results based on skill fit, location, and salary.',
    color: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.25)',
    border: 'rgba(6,182,212,0.2)',
    tag: 'Real-time',
    stat: '94%',
    statLabel: 'Match accuracy',
  },
  {
    id: 'application-tracker',
    icon: BarChart3,
    title: 'Application Tracker',
    description: 'Track every application with status updates — Applied, Interview, Offer, Rejected — with a beautiful Kanban view.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.25)',
    border: 'rgba(16,185,129,0.2)',
    tag: 'Kanban Board',
    stat: '∞',
    statLabel: 'Applications',
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get instant alerts for new job matches, application status changes, and interview reminders via email and push.',
    color: 'from-rose-500 to-pink-500',
    glow: 'rgba(244,63,94,0.25)',
    border: 'rgba(244,63,94,0.2)',
    tag: 'Instant Alerts',
    stat: '24/7',
    statLabel: 'Monitoring',
  },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [8, -8]), { stiffness: 200, damping: 25 })
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-8, 8]), { stiffness: 200, damping: 25 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const Icon = feature.icon

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-6 group relative overflow-hidden cursor-default"
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px]"
        style={{ background: `radial-gradient(circle at 50% 0%, ${feature.glow} 0%, transparent 70%)` }}
      />

      {/* Icon */}
      <div className="mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold text-lg font-display">{feature.title}</h3>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
            style={{
              color: `rgba(255,255,255,0.7)`,
              borderColor: feature.border,
              background: `${feature.glow}`,
            }}
          >
            {feature.tag}
          </span>
        </div>
        <p className="text-[#64748b] text-sm leading-relaxed mb-4">{feature.description}</p>

        {/* Stat */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <p className={`text-2xl font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
              {feature.stat}
            </p>
            <p className="text-[#4b5563] text-[11px]">{feature.statLabel}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#4b5563] group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="features" className="section-pad relative">
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="badge badge-indigo">
              <Zap className="w-3 h-3" />
              Everything You Need
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-4xl sm:text-5xl text-white mb-4"
          >
            Supercharge your{' '}
            <span className="gradient-text">job search</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#64748b] text-lg max-w-xl mx-auto"
          >
            Five powerful AI tools, one seamless platform. Built to cut your job search time in half.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.slice(0, 3).map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i} />
          ))}
          {features.slice(3).map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i + 3} />
          ))}
        </div>
      </div>
    </section>
  )
}
