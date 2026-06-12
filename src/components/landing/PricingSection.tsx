'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Check, Sparkles, Zap, Building2, ArrowRight } from 'lucide-react'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Sparkles,
    description: 'Perfect for casual job seekers getting started.',
    monthlyPrice: 0,
    annualPrice: 0,
    color: 'from-slate-500 to-slate-600',
    glow: 'rgba(100,116,139,0.15)',
    features: [
      '1 Resume upload',
      'Basic skill extraction',
      '10 job matches / month',
      'Application tracking (up to 20)',
      'Email notifications',
      'Basic dashboard',
    ],
    cta: 'Get Started Free',
    ctaHref: '/onboarding',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    description: 'For serious job seekers who want maximum results.',
    monthlyPrice: 29,
    annualPrice: 19,
    color: 'from-indigo-500 to-violet-500',
    glow: 'rgba(99,102,241,0.2)',
    features: [
      'Unlimited resume uploads',
      'Advanced AI skill extraction',
      'Unlimited job matches',
      'Unlimited application tracking',
      'Push + email notifications',
      'Advanced analytics dashboard',
      'Cover letter AI generator',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    ctaHref: '/onboarding',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    description: 'For teams, agencies, and high-volume users.',
    monthlyPrice: 99,
    annualPrice: 79,
    color: 'from-violet-500 to-purple-500',
    glow: 'rgba(139,92,246,0.2)',
    features: [
      'Everything in Pro',
      'Team collaboration tools',
      'Bulk resume processing',
      'Custom job board integrations',
      'White-label option',
      'API access',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    popular: false,
  },
]

export default function PricingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="section-pad relative" ref={ref}>
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span className="badge badge-indigo">
              <Zap className="w-3 h-3" />
              Simple Pricing
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-4xl sm:text-5xl text-white mb-4"
          >
            Invest in your{' '}
            <span className="gradient-text">career</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 }}
            className="text-[#64748b] text-lg mb-8"
          >
            Start free, upgrade when you&apos;re ready.
          </motion.p>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-3 glass p-1.5 rounded-full"
          >
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-indigo-500 text-white shadow-lg' : 'text-[#64748b] hover:text-white'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-indigo-500 text-white shadow-lg' : 'text-[#64748b] hover:text-white'}`}
            >
              Annual
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                −35%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => {
            const Icon = plan.icon
            const price = annual ? plan.annualPrice : plan.monthlyPrice

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`glass-card p-7 relative flex flex-col ${plan.popular ? 'ring-1 ring-indigo-500/40 scale-105 shadow-[0_0_60px_rgba(99,102,241,0.15)]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="badge badge-indigo text-xs whitespace-nowrap px-4 py-1.5 shadow-lg">
                      ⚡ Most Popular
                    </span>
                  </div>
                )}

                {/* Glow bg */}
                <div
                  className="absolute inset-0 rounded-[20px] pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${plan.glow} 0%, transparent 60%)` }}
                />

                {/* Icon + name */}
                <div className="mb-5 relative">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-display font-bold text-xl">{plan.name}</h3>
                  <p className="text-[#64748b] text-sm mt-1">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-[#64748b] text-xl">$</span>
                    <motion.span
                      key={price}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-white font-display font-bold text-5xl leading-none"
                    >
                      {price}
                    </motion.span>
                    <span className="text-[#64748b] text-sm mb-1">/mo</span>
                  </div>
                  {annual && price > 0 && (
                    <p className="text-emerald-400 text-xs mt-1">Billed annually — save ${((plan.monthlyPrice - plan.annualPrice) * 12)}/yr</p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-7 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <span className="text-[#94a3b8]">{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.ctaHref}
                  id={`pricing-cta-${plan.id}`}
                  className={plan.popular ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Guarantee */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center text-[#64748b] text-sm mt-8"
        >
          ✓ No credit card required &nbsp;·&nbsp; ✓ 14-day free trial &nbsp;·&nbsp; ✓ Cancel anytime
        </motion.p>
      </div>
    </section>
  )
}
