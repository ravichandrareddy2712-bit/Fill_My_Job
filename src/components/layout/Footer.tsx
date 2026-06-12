import Link from 'next/link'
import { BrainCircuit, Share2, Network, Code2, Mail, ArrowUpRight } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Documentation', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      {/* Gradient top fade */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand col */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group w-fit">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-[15px] text-white">FindMyJob</span>
                <span className="font-display font-bold text-[11px] gradient-text">.AI</span>
              </div>
            </Link>
            <p className="text-[#64748b] text-sm leading-relaxed mb-5 max-w-xs">
              The AI-powered career platform that helps you find the right jobs, faster. Upload, match, apply, track.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Share2, href: '#', label: 'X (Twitter)' },
                { icon: Network, href: '#', label: 'LinkedIn' },
                { icon: Code2, href: '#', label: 'GitHub' },
                { icon: Mail, href: '/contact', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-[#64748b] hover:text-white hover:border-indigo-500/40 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#64748b] hover:text-[#94a3b8] text-sm transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -translate-y-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="divider mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#4b5563] text-sm">
            © {new Date().getFullYear()} FindMyJob.AI. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[#4b5563] text-sm">Built with</span>
            <span className="text-rose-400 text-sm">♥</span>
            <span className="text-[#4b5563] text-sm">for job seekers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
