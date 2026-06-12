'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useAnimationFrame } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    company: 'Now at Google',
    avatar: 'SC',
    avatarColor: 'hsl(230, 70%, 55%)',
    rating: 5,
    text: 'FindMyJob.AI cut my job search from 3 months to 3 weeks. The AI skill extraction found competencies I hadn\'t even listed on my resume!',
  },
  {
    name: 'Marcus Williams',
    role: 'Product Manager',
    company: 'Now at Stripe',
    avatar: 'MW',
    avatarColor: 'hsl(160, 70%, 40%)',
    rating: 5,
    text: 'The job matching is scary accurate. 94% of my recommended jobs were genuinely relevant. I landed 4 interviews in my first week.',
  },
  {
    name: 'Priya Sharma',
    role: 'Data Scientist',
    company: 'Now at OpenAI',
    avatar: 'PS',
    avatarColor: 'hsl(280, 70%, 55%)',
    rating: 5,
    text: 'The application tracker alone is worth the subscription. I never lost track of any application. It is like a CRM for your career.',
  },
  {
    name: 'James O\'Brien',
    role: 'UX Designer',
    company: 'Now at Figma',
    avatar: 'JO',
    avatarColor: 'hsl(20, 80%, 55%)',
    rating: 5,
    text: 'I was skeptical about AI job tools but this is genuinely impressive. The resume analysis gave me actionable feedback I didn\'t expect.',
  },
  {
    name: 'Lin Wei',
    role: 'Backend Developer',
    company: 'Now at Shopify',
    avatar: 'LW',
    avatarColor: 'hsl(340, 70%, 55%)',
    rating: 5,
    text: 'Moved from China to Canada, and this tool made navigating the North American job market much easier. Found my dream job in 5 weeks.',
  },
  {
    name: 'Amara Osei',
    role: 'Marketing Lead',
    company: 'Now at HubSpot',
    avatar: 'AO',
    avatarColor: 'hsl(195, 80%, 45%)',
    rating: 5,
    text: 'Smart notifications are a game-changer. I got alerted the moment a perfect role posted and was one of the first to apply. Got the job!',
  },
]

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="glass-card p-6 w-[320px] shrink-0 group">
      <Quote className="w-6 h-6 text-indigo-400/40 mb-3" />
      <p className="text-[#94a3b8] text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: t.avatarColor }}
        >
          {t.avatar}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{t.name}</p>
          <p className="text-[#64748b] text-xs">{t.role} — <span className="text-emerald-400">{t.company}</span></p>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {[...Array(t.rating)].map((_, i) => (
            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const x1 = useRef(0)
  const x2 = useRef(0)

  useAnimationFrame(() => {
    if (row1Ref.current && row2Ref.current) {
      x1.current -= 0.4
      x2.current += 0.4
      const w1 = row1Ref.current.scrollWidth / 2
      const w2 = row2Ref.current.scrollWidth / 2
      if (Math.abs(x1.current) >= w1) x1.current = 0
      if (x2.current >= 0) x2.current = -w2
      row1Ref.current.style.transform = `translateX(${x1.current}px)`
      row2Ref.current.style.transform = `translateX(${x2.current}px)`
    }
  })

  const doubled = [...testimonials, ...testimonials]

  return (
    <section className="section-pad relative overflow-hidden" ref={ref}>
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#08080f] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#08080f] to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="inline-flex items-center gap-2 mb-4"
        >
          <span className="badge badge-amber">
            <Star className="w-3 h-3 fill-amber-400" />
            12,000+ Happy Users
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="font-display font-bold text-4xl sm:text-5xl text-white"
        >
          Loved by job seekers{' '}
          <span className="gradient-text">worldwide</span>
        </motion.h2>
      </div>

      {/* Scrolling rows */}
      <div className="space-y-4">
        <div className="overflow-hidden">
          <div ref={row1Ref} className="flex gap-4 w-max">
            {doubled.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>
        <div className="overflow-hidden">
          <div ref={row2Ref} style={{ transform: `translateX(-${testimonials.length * 336}px)` }} className="flex gap-4 w-max">
            {doubled.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
