import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import PricingSection from '@/components/landing/PricingSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import FAQSection from '@/components/landing/FAQSection'
import CTASection from '@/components/landing/CTASection'

export default function LandingPage() {
  return (
    <>
      {/* Animated gradient background */}
      <div className="animated-bg" />

      <Navbar />
      <main>
        <HeroSection />
        <div className="divider max-w-7xl mx-auto px-6" />
        <FeaturesSection />
        <div className="divider max-w-7xl mx-auto px-6" />
        <TestimonialsSection />
        <div className="divider max-w-7xl mx-auto px-6" />
        <PricingSection />
        <div className="divider max-w-7xl mx-auto px-6" />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
