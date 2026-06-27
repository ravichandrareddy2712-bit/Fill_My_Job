'use client'

import { motion } from 'framer-motion'
import { Target, Search, Clock, ExternalLink } from 'lucide-react'

export default function JobMatchesPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white mb-2">Job Matches</h1>
        <p className="text-[#94a3b8]">AI-curated job opportunities tailored to your profile.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Scanning Job Boards</h2>
          <p className="text-[#64748b] max-w-md mx-auto">
            Our AI agent is currently searching LinkedIn, Naukri, and other portals for jobs matching your target roles and locations. 
            Check back soon for new matches!
          </p>
        </div>
      </motion.div>
    </div>
  )
}
