'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="section-pad px-6" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative glass-card p-12 text-center overflow-hidden gradient-border"
        >
          {/* Animated glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-cyan-500/10 pointer-events-none" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Decorative rings */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-indigo-500/10" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full border border-violet-500/10" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="badge badge-indigo">
                <Sparkles className="w-3 h-3" />
                Start for Free
              </span>
            </div>

            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4 leading-tight">
              Your dream job is{' '}
              <span className="gradient-text">one upload away</span>
            </h2>

            <p className="text-[#94a3b8] text-lg mb-8 max-w-lg mx-auto">
              Join 12,000+ professionals who found their next role using FindMyJob.AI. No credit card required.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={async () => {
                  const { createClient } = await import('@/utils/supabase/client')
                  const supabase = createClient()
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                }}
                id="cta-get-started" 
                className="btn-primary text-base py-4 px-8 animate-pulse-glow"
              >
                <Sparkles className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/contact" id="cta-contact" className="btn-secondary text-base py-4 px-8">
                Talk to Sales
              </Link>
            </div>

            <p className="text-[#4b5563] text-sm mt-5">
              Free forever plan available · No credit card required · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
