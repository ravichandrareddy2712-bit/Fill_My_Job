'use client'

import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { HelpCircle, Search, ChevronDown } from 'lucide-react'

const faqCategories = [
  {
    category: 'Getting Started',
    faqs: [
      { q: 'How do I create an account?', a: 'Click "Get Started Free" on the homepage and follow the 4-step onboarding. No credit card required.' },
      { q: 'What file types can I upload for my resume?', a: 'We support PDF and DOCX. PDF is recommended for best parsing accuracy. Maximum file size is 10MB.' },
      { q: 'How long does the AI parsing take?', a: 'Our AI parses your resume in under 0.3 seconds. Skill extraction and job matching happen within 5 seconds.' },
    ]
  },
  {
    category: 'AI & Job Matching',
    faqs: [
      { q: 'How accurate is the job matching?', a: 'Our semantic matching achieves 94% relevance based on user feedback. We match by skills, experience, location, and salary — not just keywords.' },
      { q: 'How does AI skill extraction work?', a: 'We use a fine-tuned LLM that parses your resume and maps skills to ESCO and O*NET industry taxonomies for accurate matching.' },
      { q: 'Can I manually add or edit skills?', a: 'Yes! After AI extraction, you can add, remove, or edit any skill in your profile settings.' },
    ]
  },
  {
    category: 'Billing & Plans',
    faqs: [
      { q: 'Is there a free plan?', a: 'Yes! Our Starter plan is free forever with 1 resume upload, 10 job matches/month, and up to 20 tracked applications.' },
      { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel anytime from your account settings. No penalties or hidden fees.' },
      { q: 'Do you offer refunds?', a: 'We offer a full refund within 14 days if you\'re not satisfied. Just contact our support team.' },
    ]
  },
  {
    category: 'Privacy & Security',
    faqs: [
      { q: 'Is my resume data secure?', a: 'Your data is encrypted at rest (AES-256) and in transit (TLS 1.3). We\'re SOC 2 Type II compliant.' },
      { q: 'Do you sell my data?', a: 'Never. We do not sell, rent, or share your personal data with third parties. Full stop.' },
      { q: 'Can I delete my account?', a: 'Yes. You can delete your account and all associated data from Settings > Privacy > Delete Account.' },
    ]
  },
]

function FAQItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="glass-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left group"
        onClick={() => setOpen(!open)}
      >
        <span className="text-white font-medium text-sm group-hover:text-indigo-300 transition-colors">{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-5 h-5 text-[#64748b] shrink-0" />
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
    </div>
  )
}

export default function FAQPage() {
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const filtered = faqCategories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(
      f => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(cat => cat.faqs.length > 0)

  return (
    <>
      <div className="animated-bg" />
      <Navbar />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <div className="text-center py-16 px-6" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="badge badge-cyan">
              <HelpCircle className="w-3 h-3" />
              Help Center
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-5xl sm:text-6xl text-white mb-4"
          >
            Frequently Asked <span className="gradient-text">Questions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 }}
            className="text-[#64748b] text-lg mb-8"
          >
            Find answers to common questions about FindMyJob.AI.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="relative max-w-lg mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              id="faq-search"
              className="input-glass pl-11 py-4"
              placeholder="Search questions..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </motion.div>
        </div>

        {/* Categories */}
        <div className="max-w-3xl mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#64748b] text-lg">No results for &ldquo;{query}&rdquo;</p>
              <button onClick={() => setQuery('')} className="mt-3 text-indigo-400 text-sm hover:text-indigo-300">
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {filtered.map((cat, ci) => (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: ci * 0.1 }}
                >
                  <h2 className="font-display font-bold text-white text-xl mb-4">{cat.category}</h2>
                  <div className="space-y-3">
                    {cat.faqs.map((faq, fi) => (
                      <FAQItem key={fi} faq={faq} index={fi} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-14 text-center">
            <p className="text-[#64748b] text-sm">Still have questions?</p>
            <a href="/contact" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium mt-1 inline-block">
              Contact our support team →
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
