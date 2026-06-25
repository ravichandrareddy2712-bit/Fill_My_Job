'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useTransform, useSpring, Variants } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Upload,
  Brain,
  Target,
  Bell,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Loader2,
  FileText,
} from 'lucide-react'
import { useFileContext } from '@/context/FileContext'

const floatingBadges = [
  { icon: CheckCircle2, text: 'Resume Parsed', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', x: '-8%', y: '20%' },
  { icon: TrendingUp, text: '94% Match Rate', color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20', x: '90%', y: '15%' },
  { icon: Briefcase, text: '3 New Offers', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20', x: '85%', y: '70%' },
]

function FloatingCard3D() {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [15, -15]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(mouseX, [-150, 150], [-15, 15]), { stiffness: 150, damping: 20 })

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

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-sm mx-auto"
    >
      <div className="glass-card p-6 relative overflow-hidden gradient-border">
        {/* Card shimmer */}
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">AI Analysis</p>
              <p className="text-[#64748b] text-[10px]">Resume.pdf</p>
            </div>
          </div>
          <span className="badge badge-emerald text-[10px]">Complete</span>
        </div>

        {/* Skills */}
        <p className="text-[#64748b] text-xs mb-2 font-medium">Extracted Skills</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'AWS', 'Docker'].map((skill) => (
            <span
              key={skill}
              className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Match bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#94a3b8]">Job Match Score</span>
            <span className="text-emerald-400 font-bold">94%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-cool"
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Jobs found */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
          <span className="text-[#64748b] text-xs">Jobs Found</span>
          <div className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-white font-bold text-sm">127</span>
            <span className="text-[#64748b] text-[10px]">matches</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export default function HeroSection() {
  const router = useRouter()
  const { setResumeFile } = useFileContext()
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionStep, setExtractionStep] = useState('')

  const handleFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    setResumeFile(file)
    setIsExtracting(true)
    setExtractionStep('Reading your resume...')

    try {
      // Show progressive loading messages
      const stepTimer1 = setTimeout(() => setExtractionStep('Extracting skills & experience...'), 1200)
      const stepTimer2 = setTimeout(() => setExtractionStep('Building your profile...'), 2800)

      const formData = new FormData()
      formData.append('resume', file)

      const res = await fetch('/api/extract-resume', {
        method: 'POST',
        body: formData,
      })

      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)

      if (res.ok) {
        const extracted = await res.json()
        // Store extracted data for onboarding pre-fill
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('fmj_extracted', JSON.stringify(extracted))
        }
        setExtractionStep('Profile extracted! Redirecting...')
        await new Promise(r => setTimeout(r, 600))
      } else {
        // Even if extraction fails, still go to onboarding — user fills manually
        setExtractionStep('Redirecting to onboarding...')
        await new Promise(r => setTimeout(r, 400))
      }

      router.push('/onboarding')
    } catch {
      // Network error — still redirect, user fills manually
      setExtractionStep('Redirecting to onboarding...')
      await new Promise(r => setTimeout(r, 500))
      router.push('/onboarding')
    }
  }

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden grid-pattern">
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] bg-indigo-500 top-[-200px] left-[-200px]" />
      <div className="orb w-[400px] h-[400px] bg-violet-500 bottom-[-100px] right-[-100px]" style={{ animationDelay: '3s' }} />
      <div className="orb w-[300px] h-[300px] bg-cyan-500 top-[40%] right-[20%]" style={{ animationDelay: '6s', opacity: 0.08 }} />

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="text-center lg:text-left">
            {/* Badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
              <span className="badge badge-indigo">
                <Sparkles className="w-3 h-3" />
                AI-Powered Job Search
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-white mb-6"
            >
              Apply to{' '}
              <span className="gradient-text">100 jobs</span>
              <br />
              while you{' '}
              <span className="relative inline-block">
                sleep
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full gradient-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-[#94a3b8] text-lg sm:text-xl leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Upload your resume once. Our AI agent searches Naukri, LinkedIn & Indeed 24/7, fills forms, and submits applications — automatically.
            </motion.p>

            {/* Upload / Dropzone */}
            <motion.div variants={fadeUp} className="mt-8">
              {isExtracting ? (
                /* Loading State */
                <div className="relative border-2 border-dashed border-indigo-400/60 rounded-2xl p-8 text-center bg-indigo-500/8 max-w-md mx-auto lg:mx-0">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                      <FileText className="w-4 h-4 text-indigo-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-white font-semibold text-base">{extractionStep}</p>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full gradient-primary rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '90%' }}
                        transition={{ duration: 4, ease: 'easeInOut' }}
                      />
                    </div>
                    <p className="text-[#64748b] text-xs">This takes 3–5 seconds</p>
                  </div>
                </div>
              ) : (
                /* Dropzone */
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer max-w-md mx-auto lg:mx-0 ${
                    isDragging ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]' : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
                  }`}
                  id="hero-dropzone"
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const f = e.dataTransfer.files[0]
                    if (f) handleFile(f)
                  }}
                  onClick={() => document.getElementById('hero-upload')?.click()}
                >
                  <input
                    id="hero-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFile(f)
                    }}
                  />
                  <Upload className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
                  <p className="text-white font-medium text-lg mb-1">Upload Resume to Start</p>
                  <p className="text-[#64748b] text-sm">Drag &amp; drop or click to browse · PDF only</p>
                  <p className="text-[#4b5563] text-xs mt-2">Your resume is never stored publicly</p>
                </div>
              )}
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="mt-10 flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D', 'E'].map((l, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#08080f] flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: `hsl(${220 + i * 30}, 70%, 55%)` }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-xs">★</span>
                  ))}
                </div>
                <p className="text-[#64748b] text-xs mt-0.5">
                  <span className="text-white font-semibold">Be among the first</span> to try AutoApply AI
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: 3D Card */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Floating badges */}
            {floatingBadges.map((badge, i) => (
              <motion.div
                key={i}
                className={`absolute z-10 flex items-center gap-2 px-3 py-2 rounded-xl border ${badge.bg} backdrop-blur-xl text-xs font-medium ${badge.color} shadow-lg`}
                style={{ left: badge.x, top: badge.y }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.2, duration: 0.5, ease: 'backOut' }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                >
                  <badge.icon className="w-3.5 h-3.5" />
                </motion.div>
                {badge.text}
              </motion.div>
            ))}

            {/* Glow ring behind card */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl" />

            <FloatingCard3D />

            {/* Stats below card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mt-6 grid grid-cols-3 gap-3"
            >
              {[
                { label: 'Jobs Matched', value: '127', icon: Target, color: 'text-violet-400' },
                { label: 'Applied Today', value: '8', icon: Upload, color: 'text-emerald-400' },
                { label: 'Notifications', value: '3', icon: Bell, color: 'text-cyan-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass-card p-3 text-center">
                  <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                  <p className="text-white font-bold text-lg">{value}</p>
                  <p className="text-[#64748b] text-[10px]">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
