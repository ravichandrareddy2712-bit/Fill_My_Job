import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PricingSection from '@/components/landing/PricingSection'
import FAQSection from '@/components/landing/FAQSection'
import CTASection from '@/components/landing/CTASection'

export const metadata: Metadata = {
  title: 'Pricing — FindMyJob.AI',
  description: 'Simple, transparent pricing for every job seeker. Start free, upgrade anytime.',
}

export default function PricingPage() {
  return (
    <>
      <div className="animated-bg" />
      <Navbar />
      <main className="pt-24">
        <div className="text-center py-16 px-6">
          <h1 className="font-display font-bold text-5xl sm:text-6xl text-white mb-4">
            Simple, transparent{' '}
            <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-[#64748b] text-lg max-w-lg mx-auto">
            No hidden fees. No surprises. Start free and scale as you grow.
          </p>
        </div>
        <PricingSection />
        <div className="divider max-w-7xl mx-auto px-6" />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
