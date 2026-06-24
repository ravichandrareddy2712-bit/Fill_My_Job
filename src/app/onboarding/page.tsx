'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BrainCircuit, Briefcase, MapPin,
  ArrowRight, ArrowLeft, Check
} from 'lucide-react'
import { useFileContext } from '@/context/FileContext'
import { saveProfile } from '@/lib/supabase'

const steps = [
  { id: 1, title: 'Skills & Experience', icon: Briefcase, description: 'What you bring to the table' },
  { id: 2, title: 'Job Preferences', icon: MapPin, description: 'Your ideal role' },
]

const roleOptions = ['Internship', 'Full-time Job', 'Part-time Job', 'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Marketing Manager']
const locationOptions = ['India', 'Remote', 'United States', 'United Kingdom', 'Germany', 'Singapore', 'Canada', 'Australia']

export default function OnboardingPage() {
  const router = useRouter()
  const { resumeFile } = useFileContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    experience: 'Fresher',
    roles: [] as string[],
    locations: [] as string[],
  })
  const [direction, setDirection] = useState(1)

  const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, 2)) }
  const goPrev = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)) }

  const toggleRole = (r: string) => {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(r) ? f.roles.filter(x => x !== r) : [...f.roles, r]
    }))
  }

  const toggleLocation = (l: string) => {
    setForm(f => ({
      ...f,
      locations: f.locations.includes(l) ? f.locations.filter(x => x !== l) : [...f.locations, l]
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Generate a unique session ID
      const sessionId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 8)

      // Generate search links from roles + locations
      const searchLinks: string[] = []
      const roles = form.roles.length > 0 ? form.roles : ['Software Engineer']
      const locations = form.locations.length > 0 ? form.locations : ['Remote']
      for (const role of roles) {
        for (const loc of locations) {
          const q = encodeURIComponent(role)
          const l = encodeURIComponent(loc)
          searchLinks.push(`https://in.indeed.com/jobs?q=${q}&l=${l}`)
          const naukriLoc = loc.toLowerCase() === 'remote' ? 'remote' : loc.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          searchLinks.push(`https://www.naukri.com/${naukriLoc}-jobs?k=${q}`)
        }
      }

      // Save profile to Supabase (NOT to n8n webhook)
      const profileData = {
        session_id: sessionId,
        skills: form.roles,
        experience: [],
        search_links: searchLinks,
        first_name: '',
        last_name: '',
        email: '',
        mobile: '',
        address: '',
        linkedin_url: '',
        portfolio_url: '',
        current_ctc: '',
        expected_ctc: '',
        notice_period: form.experience,
        willing_to_relocate: form.locations.some(l => l !== 'India'),
        internships: [],
        projects: [],
        education: [],
        certifications: [],
        negative_preferences: {},
        common_answers: {},
      }

      const saved = await saveProfile(profileData)
      if (!saved) {
        throw new Error('Failed to save profile to Supabase')
      }

      // Store session in localStorage for dashboard
      localStorage.setItem('fmj_session_id', sessionId)
      localStorage.setItem('fmj_roles', JSON.stringify(form.roles))
      localStorage.setItem('fmj_locations', JSON.stringify(form.locations))
      localStorage.setItem('fmj_experience', form.experience)
      localStorage.setItem('fmj_onboarded', 'true')

      // If resume file exists, also send it to n8n for AI extraction (fire & forget)
      if (resumeFile) {
        const formData = new FormData()
        formData.append('experience', form.experience)
        formData.append('roles', JSON.stringify(form.roles))
        formData.append('locations', JSON.stringify(form.locations))
        formData.append('resume', resumeFile)
        formData.append('session_id', sessionId)

        const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://ramanreddy.app.n8n.cloud/webhook/autoapply-start'
        if (webhookUrl) {
          // Fire & forget — don't block redirect
          fetch(webhookUrl, { method: 'POST', body: formData }).catch(() => {})
        }
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error during onboarding:', error)
      alert('Failed to save your profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <div className="min-h-screen bg-[#08080f] flex flex-col">
      <div className="animated-bg" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white text-sm">FindMyJob.AI</span>
        </Link>
        <span className="text-[#64748b] text-sm">Step {step} of 2</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {steps.map((s) => (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      s.id < step ? 'gradient-primary text-white' :
                      s.id === step ? 'border-2 border-indigo-500 text-indigo-400' :
                      'border border-white/10 text-[#4b5563]'
                    }`}
                  >
                    {s.id < step ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <span className={`text-[10px] font-medium text-center hidden sm:block ${s.id === step ? 'text-white' : 'text-[#4b5563]'}`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-primary rounded-full"
                animate={{ width: `${((step - 1) / 1) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="glass-card p-8 relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Step 1: Skills */}
                {step === 1 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Experience</h2>
                    <p className="text-[#64748b] text-sm mb-6">Select your years of experience.</p>

                    {/* Experience */}
                    <div>
                      <label className="text-[#94a3b8] text-xs font-medium mb-2 block">Years of Experience</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['Fresher', '0-1', '1-2', '2-5', '5-10', '10+'].map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setForm(f => ({ ...f, experience: lvl }))}
                            className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                              form.experience === lvl
                                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                : 'bg-white/3 border-white/10 text-[#64748b] hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {lvl === 'Fresher' ? 'Fresher' : `${lvl} yrs`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Preferences */}
                {step === 2 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Job Preferences</h2>
                    <p className="text-[#64748b] text-sm mb-6">What roles and locations are you targeting?</p>

                    <div className="mb-5">
                      <label className="text-[#94a3b8] text-xs font-medium mb-2 block">Preferred Roles</label>
                      <div className="flex flex-wrap gap-2">
                        {roleOptions.map((r) => (
                          <button
                            key={r}
                            onClick={() => toggleRole(r)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              form.roles.includes(r)
                                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                                : 'bg-white/3 border-white/10 text-[#64748b] hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-[#94a3b8] text-xs font-medium mb-2 block">Preferred Locations</label>
                      <div className="flex flex-wrap gap-2">
                        {locationOptions.map((l) => (
                          <button
                            key={l}
                            onClick={() => toggleLocation(l)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              form.locations.includes(l)
                                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                                : 'bg-white/3 border-white/10 text-[#64748b] hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 rounded-2xl glass border border-indigo-500/20">
                      <p className="text-indigo-300 text-xs font-semibold mb-2">Summary</p>
                      <div className="text-[#94a3b8] text-xs space-y-1">
                        <p>📄 {resumeFile ? resumeFile.name : 'No resume (will use Supabase profile)'}</p>
                        <p>💼 {form.experience} {form.experience === 'Fresher' ? '' : 'years '}experience</p>
                        <p>🎯 {form.roles.length || 0} roles · {form.locations.length || 0} locations</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
              <button
                onClick={goPrev}
                disabled={step === 1}
                className="btn-secondary py-2.5 px-5 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {step < 2 ? (
                <button onClick={goNext} className="btn-primary py-2.5 px-6">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting} id="onboarding-finish" className="btn-primary py-2.5 px-6">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save & Go to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
