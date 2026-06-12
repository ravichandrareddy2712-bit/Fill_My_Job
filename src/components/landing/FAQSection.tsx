'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    q: 'How does the AI skill extraction work?',
    a: 'Our AI uses a fine-tuned large language model to parse your resume and identify skills, technologies, frameworks, and soft skills. It then maps these to industry-standard taxonomies like ESCO and O*NET for accurate job matching.',
  },
  {
    q: 'What file formats does FindMyJob.AI support?',
    a: 'We currently support PDF and DOCX resume formats. PDF is recommended for the best parsing accuracy. Files up to 10MB are supported.',
  },
  {
    q: 'How accurate is the job matching?',
    a: 'Our semantic matching algorithm achieves a 94% relevance score based on user feedback. We match jobs based on skills, experience level, location preferences, and salary expectations — not just keywords.',
  },
  {
    q: 'Can I track applications from external job boards?',
    a: 'Yes! You can manually add applications from any job board (LinkedIn, Indeed, Glassdoor, etc.) to your tracker. We also have browser extensions for one-click application import (coming soon).',
  },
  {
    q: 'Is my resume data secure?',
    a: 'Absolutely. Your data is encrypted at rest (AES-256) and in transit (TLS 1.3). We never sell your personal data to third parties. You can delete your account and all data at any time.',
  },
  {
    q: 'What happens after the free trial ends?',
    a: 'After 14 days, you\'ll be prompted to choose a plan. If you don\'t upgrade, you\'ll automatically move to the free Starter tier. No credit card is required to start.',
  },
]

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="glass-card overflow-hidden"
    >
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left group"
        onClick={() => setOpen(!open)}
        id={`faq-item-${index}`}
      >
        <span className="text-white font-medium text-sm sm:text-base group-hover:text-indigo-300 transition-colors">
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-[#64748b]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="px-5 pb-5 border-t border-white/5">
              <p className="text-[#94a3b8] text-sm leading-relaxed mt-4">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="faq" className="section-pad relative" ref={ref}>
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="badge badge-cyan">
              <HelpCircle className="w-3 h-3" />
              FAQ
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-4xl sm:text-5xl text-white"
          >
            Got <span className="gradient-text">questions?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 }}
            className="text-[#64748b] mt-3 text-lg"
          >
            Everything you need to know about FindMyJob.AI.
          </motion.p>
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
