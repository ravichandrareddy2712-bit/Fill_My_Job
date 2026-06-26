'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BrainCircuit, User, Briefcase, CheckCircle2,
  ArrowRight, ArrowLeft, Check, X, Plus, ChevronDown, BookOpen, Upload, FileText, Loader2,
} from 'lucide-react'
import { useFileContext } from '@/context/FileContext'
import { saveProfile } from '@/lib/supabase'

// ─── Role Lists ───────────────────────────────────────────────
const TECH_ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Mobile Developer (Android)', 'Mobile Developer (iOS)', 'Flutter Developer', 'React Native Developer',
  'DevOps Engineer', 'Cloud Engineer (AWS)', 'Cloud Engineer (GCP)', 'Cloud Engineer (Azure)',
  'Data Engineer', 'Data Scientist', 'Data Analyst', 'ML Engineer', 'AI/LLM Engineer',
  'Cybersecurity Analyst', 'QA Engineer', 'Embedded Systems Engineer', 'Blockchain Developer',
  'Game Developer', 'AR/VR Developer', 'Database Administrator', 'Network Engineer', 'IT Support',
]
const NONTTECH_ROLES = [
  'Product Manager', 'Project Manager', 'Business Analyst', 'UI/UX Designer', 'Graphic Designer',
  'Content Writer', 'Copywriter', 'Digital Marketing Manager', 'SEO Specialist', 'Social Media Manager',
  'HR Manager', 'Recruiter', 'Sales Executive', 'Business Development', 'Finance Analyst',
  'Accountant', 'Operations Manager', 'Supply Chain', 'Customer Success', 'Legal Counsel', 'Teaching / Edtech',
]

const NOTICE_OPTIONS = ['Immediate', '15 days', '30 days', '60 days', '90 days']
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
const WORK_TYPE_OPTIONS = ['Remote', 'Hybrid', 'Onsite', 'Any']

const steps = [
  { id: 1, title: 'Upload Resume', icon: Upload, description: 'Quick auto-fill' },
  { id: 2, title: 'Personal Details', icon: User, description: 'Basic info about you' },
  { id: 3, title: 'Target Roles', icon: Briefcase, description: 'What you\'re looking for' },
  { id: 4, title: 'Experience & Projects', icon: BookOpen, description: 'Resume Details' },
  { id: 5, title: 'Skills', icon: BrainCircuit, description: 'Tools & Languages' },
  { id: 6, title: 'Confirm & Q&A', icon: CheckCircle2, description: 'Review & common answers' },
]

// ─── Field Component ──────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#4b5563] outline-none focus:border-indigo-500/60 focus:bg-white/7 transition-all'
const selectCls = `${inputCls} appearance-none`

// ─── Role Chip ────────────────────────────────────────────────
function RoleChip({ role, onRemove }: { role: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-medium">
      {role}
      <button onClick={onRemove} className="hover:text-rose-400 transition-colors"><X className="w-3 h-3" /></button>
    </span>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { resumeFile, setResumeFile } = useFileContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [roleSearch, setRoleSearch] = useState('')
  const [customRole, setCustomRole] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ─── Step 1: Personal Details
  const [personal, setPersonal] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    gender: '',
    dob: '',
    mobile: '',
    email: '',
    current_city: '',
    full_address: '',
    linkedin_url: '',
    portfolio_url: '',
    current_ctc: '',
    expected_ctc: '',
    notice_period: 'Immediate',
    willing_to_relocate: false,
    experience_years: '',
  })

  // ─── Step 2: Roles
  const [roles, setRoles] = useState<string[]>([])
  const [work_type, setWorkType] = useState('Any')
  const [locations, setLocations] = useState<string[]>([])

  // ─── Step 3: Experience & Projects
  const [experience, setExperience] = useState<Array<{ company: string; role: string; start_date?: string; end_date?: string; location?: string; description?: string; duration?: string }>>([])
  const [projects, setProjects] = useState<Array<{ name: string; start_date?: string; end_date?: string; description?: string; link?: string }>>([])
  const [skills, setSkills] = useState<string[]>([])

  // ─── Step 4: Q&A
  const [qa, setQA] = useState({
    years_in_primary_skill: '',
    night_shifts: 'No',
    valid_passport: 'No',
    fresher_or_experienced: 'Fresher',
    highest_qualification: '',
    current_employer: '',
  })

  // Pre-fill from local draft or AI extraction
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let draft: any = null
    try {
      const rawDraft = localStorage.getItem('fmj_onboarding_draft')
      if (rawDraft) draft = JSON.parse(rawDraft)
    } catch { /* ignore */ }

    let ex: any = null
    try {
      const raw = sessionStorage.getItem('fmj_extracted')
      if (raw) ex = JSON.parse(raw)
    } catch { /* ignore */ }

    const data = draft || ex
    if (!data) return

    try {
      setPersonal(p => ({
        ...p,
        first_name: data.first_name || p.first_name,
        last_name: data.last_name || p.last_name,
        middle_name: data.middle_name || p.middle_name,
        email: data.email || p.email,
        mobile: data.mobile || p.mobile,
        gender: data.gender || p.gender,
        dob: data.dob || p.dob,
        current_city: data.current_city || p.current_city,
        full_address: data.full_address || p.full_address,
        linkedin_url: data.linkedin_url || p.linkedin_url,
        portfolio_url: data.portfolio_url || p.portfolio_url,
        current_ctc: data.current_ctc || p.current_ctc,
        expected_ctc: data.expected_ctc || p.expected_ctc,
        notice_period: data.notice_period || p.notice_period,
        willing_to_relocate: data.willing_to_relocate ?? p.willing_to_relocate,
        experience_years: data.experience_years?.toString() || p.experience_years,
      }))
      if (data.target_roles?.length) setRoles(data.target_roles.slice(0, 5))
      if (data.experience) setExperience(data.experience)
      if (data.projects) setProjects(data.projects)
      if (data.skills) setSkills(data.skills)
      if (data.locations) setLocations(data.locations)
      if (data.work_type) setWorkType(data.work_type)

      if (data.common_answers) {
        setQA(q => ({
          ...q,
          years_in_primary_skill: data.common_answers.years_in_primary_skill || q.years_in_primary_skill,
          fresher_or_experienced: data.is_fresher ? 'Fresher' : (data.common_answers.fresher_or_experienced || 'Experienced'),
          highest_qualification: data.common_answers.highest_qualification || data.highest_qualification || q.highest_qualification,
          current_employer: data.common_answers.current_employer || data.current_employer || q.current_employer,
        }))
      }
    } catch { /* ignore */ }
  }, [])

  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionStep, setExtractionStep] = useState('')

  const handleFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    setResumeFile(file)
    setIsExtracting(true)
    setExtractionStep('Reading your resume...')

    try {
      // Show progressive loading messages
      const stepTimer1 = setTimeout(() => setExtractionStep('Extracting skills & experience...'), 1200)
      const stepTimer2 = setTimeout(() => setExtractionStep('Building your profile...'), 2800)

      const formData = new FormData()
      formData.append('resume', file)

      const res = await fetch('/api/extract-resume', {
        method: 'POST',
        body: formData,
      })

      clearTimeout(stepTimer1)
      clearTimeout(stepTimer2)

      if (res.ok) {
        const extracted = await res.json()
        if (typeof window !== 'undefined' && extracted) {
          sessionStorage.setItem('fmj_extracted', JSON.stringify(extracted))
          localStorage.removeItem('fmj_onboarding_draft') // Clear old draft
          
          // Populate state directly here so we don't have to wait for useEffect reload
          setPersonal(p => ({
            ...p,
            first_name: extracted.first_name || p.first_name,
            last_name: extracted.last_name || p.last_name,
            middle_name: extracted.middle_name || p.middle_name,
            email: extracted.email || p.email,
            mobile: extracted.mobile || p.mobile,
            gender: extracted.gender || p.gender,
            dob: extracted.dob || p.dob,
            current_city: extracted.current_city || p.current_city,
            full_address: extracted.full_address || p.full_address,
            linkedin_url: extracted.linkedin_url || p.linkedin_url,
            portfolio_url: extracted.portfolio_url || p.portfolio_url,
            current_ctc: extracted.current_ctc || p.current_ctc,
            expected_ctc: extracted.expected_ctc || p.expected_ctc,
            notice_period: extracted.notice_period || p.notice_period,
            willing_to_relocate: extracted.willing_to_relocate ?? p.willing_to_relocate,
            experience_years: extracted.experience_years?.toString() || p.experience_years,
          }))
          if (extracted.target_roles?.length) setRoles(extracted.target_roles.slice(0, 5))
          if (extracted.experience) setExperience(extracted.experience)
          if (extracted.projects) setProjects(extracted.projects)
          if (extracted.skills) setSkills(extracted.skills)
          if (extracted.locations) setLocations(extracted.locations)
          if (extracted.work_type) setWorkType(extracted.work_type)

          if (extracted.common_answers) {
            setQA(q => ({
              ...q,
              years_in_primary_skill: extracted.common_answers.years_in_primary_skill || q.years_in_primary_skill,
              fresher_or_experienced: extracted.is_fresher ? 'Fresher' : (extracted.common_answers.fresher_or_experienced || 'Experienced'),
              highest_qualification: extracted.common_answers.highest_qualification || extracted.highest_qualification || q.highest_qualification,
              current_employer: extracted.common_answers.current_employer || extracted.current_employer || q.current_employer,
            }))
          }
        }
        setExtractionStep('Profile extracted!')
        await new Promise(r => setTimeout(r, 600))
        setIsExtracting(false)
        setStep(2) // move to personal details
      } else {
        setExtractionStep('Failed to extract. Please fill manually.')
        await new Promise(r => setTimeout(r, 1000))
        setIsExtracting(false)
        setStep(2)
      }
    } catch {
      setExtractionStep('Error during extraction. Please fill manually.')
      await new Promise(r => setTimeout(r, 1000))
      setIsExtracting(false)
      setStep(2)
    }
  }

  const setP = (key: string, val: string | boolean) => setPersonal(p => ({ ...p, [key]: val }))

  // ─── Autosave Draft ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Wait a tick to ensure state is actually populated, avoid overwriting with empties on first render
    const timer = setTimeout(() => {
      const draft = {
        first_name: personal.first_name, last_name: personal.last_name, middle_name: personal.middle_name,
        gender: personal.gender, dob: personal.dob, mobile: personal.mobile, email: personal.email,
        current_city: personal.current_city, full_address: personal.full_address,
        linkedin_url: personal.linkedin_url, portfolio_url: personal.portfolio_url,
        current_ctc: personal.current_ctc, expected_ctc: personal.expected_ctc,
        notice_period: personal.notice_period, willing_to_relocate: personal.willing_to_relocate,
        experience_years: personal.experience_years,
        target_roles: roles, work_type, locations,
        experience, projects, skills,
        common_answers: qa
      }
      localStorage.setItem('fmj_onboarding_draft', JSON.stringify(draft))
    }, 1000)
    return () => clearTimeout(timer)
  }, [personal, roles, work_type, locations, experience, projects, skills, qa])
  const goNext = () => {
    const e = validateStep(step)
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setDirection(1)
    setStep(s => Math.min(s + 1, 6))
  }
  const goPrev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); setErrors({}) }

  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {}
    if (s === 2) {
      if (!personal.first_name.trim()) e.first_name = 'Required'
      if (!personal.last_name.trim()) e.last_name = 'Required'
      if (!personal.email.trim()) e.email = 'Required'
      if (!personal.mobile.trim()) e.mobile = 'Required'
    }
    if (s === 3) {
      if (roles.length === 0) e.roles = 'Select at least one role'
    }
    return e
  }

  const toggleRole = (r: string) => {
    setRoles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
    setErrors(e => ({ ...e, roles: '' }))
  }

  const addCustomRole = () => {
    const r = customRole.trim()
    if (r && !roles.includes(r)) { setRoles(prev => [...prev, r]); setRoleSearch(''); setCustomRole('') }
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) { setSkills(prev => [...prev, s]); setSkillInput('') }
  }
  const addLocation = () => {
    const locs = locationInput.split(',').map(l => l.trim()).filter(Boolean)
    setLocations(prev => [...new Set([...prev, ...locs])])
    setLocationInput('')
  }

  const filteredRoles = (list: string[]) =>
    roleSearch ? list.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase())) : list

  const handleSubmit = async () => {
    const e = validateStep(6)
    if (Object.keys(e).length > 0) { setErrors(e); return }

    setIsSubmitting(true)
    try {
      const sessionId = localStorage.getItem('fmj_session_id') || (Date.now().toString() + '-' + Math.random().toString(36).substring(2, 8))

      // Build search links from roles + locations
      const searchLinks: string[] = []
      const effectiveRoles = roles.length > 0 ? roles : ['Software Engineer']
      const effectiveLocs = locations.length > 0 ? locations : ['Remote']
      for (const role of effectiveRoles.slice(0, 3)) {
        for (const loc of effectiveLocs.slice(0, 2)) {
          const q = encodeURIComponent(role)
          const l = encodeURIComponent(loc)
          searchLinks.push(`https://in.indeed.com/jobs?q=${q}&l=${l}`)
          const naukriLoc = loc.toLowerCase() === 'remote' ? 'remote' : loc.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          searchLinks.push(`https://www.naukri.com/${naukriLoc}-jobs?k=${q}`)
        }
      }

      // Get extracted data if present
      let extracted: Record<string, unknown> = {}
      try {
        const raw = sessionStorage.getItem('fmj_extracted')
        if (raw) extracted = JSON.parse(raw)
      } catch { /* ignore */ }

      const profileData = {
        session_id: sessionId,
        // Step 1
        first_name: personal.first_name,
        last_name: personal.last_name,
        middle_name: personal.middle_name,
        gender: personal.gender,
        dob: personal.dob,
        mobile: personal.mobile.replace(/\D/g, '').slice(-10),
        email: personal.email,
        current_city: personal.current_city,
        full_address: personal.full_address,
        address: personal.full_address, // legacy compat
        linkedin_url: personal.linkedin_url,
        portfolio_url: personal.portfolio_url,
        current_ctc: personal.current_ctc,
        expected_ctc: personal.expected_ctc,
        notice_period: personal.notice_period,
        willing_to_relocate: personal.willing_to_relocate,
        experience_years: parseInt(personal.experience_years) || 0,
        // Step 2
        target_roles: roles,
        preferred_locations: locations,
        work_type,
        search_links: searchLinks,
        // Resume data from extraction
        experience: experience,
        projects: projects,
        skills: Array.from(new Set([...roles, ...skills])),
        resume_text: (extracted.resume_text as string) || '',
        // Step 3
        common_answers: {
          years_in_primary_skill: qa.years_in_primary_skill,
          night_shifts: qa.night_shifts,
          valid_passport: qa.valid_passport,
          fresher_or_experienced: qa.fresher_or_experienced,
          highest_qualification: qa.highest_qualification,
          current_employer: qa.current_employer,
        },
      }

      const saved = await saveProfile(profileData)
      if (!saved) throw new Error('Failed to save profile to Supabase')

      localStorage.setItem('fmj_session_id', sessionId)
      localStorage.setItem('fmj_roles', JSON.stringify(roles))
      localStorage.setItem('fmj_locations', JSON.stringify(locations))
      localStorage.setItem('fmj_onboarded', 'true')
      localStorage.removeItem('fmj_onboarding_draft')

      // Fire-and-forget: upload resume to N8N if present
      if (resumeFile) {
        const fd = new FormData()
        fd.append('resume', resumeFile)
        fd.append('session_id', sessionId)
        fd.append('roles', JSON.stringify(roles))
        fd.append('locations', JSON.stringify(locations))
        fetch('/api/n8n-webhook', { method: 'POST', body: fd }).catch(() => {})
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding submit error:', err)
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
        <span className="text-[#64748b] text-sm">Step {step} of 6</span>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-4 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              {steps.map((s, idx) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      s.id < step ? 'gradient-primary text-white' :
                      s.id === step ? 'border-2 border-indigo-500 text-indigo-400 bg-indigo-500/10' :
                      'border border-white/10 text-[#4b5563]'
                    }`}>
                      {s.id < step ? <Check className="w-3.5 h-3.5" /> : s.id}
                    </div>
                    <span className={`text-[10px] font-medium text-center hidden sm:block ${s.id === step ? 'text-white' : 'text-[#4b5563]'}`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${s.id < step ? 'bg-indigo-500' : 'bg-white/8'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-primary rounded-full"
                animate={{ width: `${((step - 1) / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Card */}
          <div className="glass-card p-6 sm:p-8 relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >

                {/* ══════════════════════════ STEP 1 ══════════════════════════ */}
                
          {/* Step 1: Upload Resume */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 * direction }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Upload your Resume</h2>
                <p className="text-[#94a3b8]">Let our AI extract your details and fill the form for you.</p>
              </div>

              {isExtracting ? (
                <div className="relative border-2 border-dashed border-indigo-400/60 rounded-2xl p-12 text-center bg-indigo-500/8 max-w-xl mx-auto">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                      <FileText className="w-5 h-5 text-indigo-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-white font-semibold text-lg">{extractionStep}</p>
                    <div className="w-full max-w-sm bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full gradient-primary rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '90%' }}
                        transition={{ duration: 4, ease: 'easeInOut' }}
                      />
                    </div>
                    <p className="text-[#64748b] text-sm">This takes 3–5 seconds</p>
                  </div>
                </div>
              ) : (
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer max-w-xl mx-auto ${
                    isDragging ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]' : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const f = e.dataTransfer.files[0]
                    if (f) handleFile(f)
                  }}
                  onClick={() => document.getElementById('onboarding-upload')?.click()}
                >
                  <input
                    id="onboarding-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFile(f)
                    }}
                  />
                  <Upload className="w-12 h-12 text-[#64748b] mx-auto mb-4" />
                  <p className="text-white font-medium text-xl mb-2">Upload Resume to Start</p>
                  <p className="text-[#64748b] text-base">Drag & drop or click to browse · PDF only</p>
                  <p className="text-[#4b5563] text-sm mt-3">Your resume is never stored publicly</p>
                </div>
              )}

            </motion.div>
          )}

          {/* Step 2: Personal Details */}
          {step === 2 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Personal Details</h2>
                    <p className="text-[#64748b] text-sm mb-6">Fill in your basic information. Pre-filled from your resume where possible.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="First Name" required>
                        <input className={inputCls + (errors.first_name ? ' border-rose-500/60' : '')} placeholder="Rahul" value={personal.first_name} onChange={e => setP('first_name', e.target.value)} />
                        {errors.first_name && <p className="text-rose-400 text-[10px] mt-1">{errors.first_name}</p>}
                      </Field>
                      <Field label="Last Name" required>
                        <input className={inputCls + (errors.last_name ? ' border-rose-500/60' : '')} placeholder="Sharma" value={personal.last_name} onChange={e => setP('last_name', e.target.value)} />
                        {errors.last_name && <p className="text-rose-400 text-[10px] mt-1">{errors.last_name}</p>}
                      </Field>
                      <Field label="Middle Name">
                        <input className={inputCls} placeholder="Optional" value={personal.middle_name} onChange={e => setP('middle_name', e.target.value)} />
                      </Field>
                      <Field label="Gender">
                        <div className="relative">
                          <select className={selectCls} value={personal.gender} onChange={e => setP('gender', e.target.value)}>
                            <option value="">Select gender</option>
                            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                        </div>
                      </Field>
                      <Field label="Date of Birth">
                        <input type="date" className={inputCls} value={personal.dob} onChange={e => setP('dob', e.target.value)} />
                      </Field>
                      <Field label="Mobile Number" required>
                        <div className="flex">
                          <span className="px-3 py-2.5 rounded-l-xl bg-white/5 border border-r-0 border-white/10 text-[#64748b] text-sm">+91</span>
                          <input className={inputCls + ' rounded-l-none' + (errors.mobile ? ' border-rose-500/60' : '')} placeholder="9876543210" value={personal.mobile} onChange={e => setP('mobile', e.target.value)} />
                        </div>
                        {errors.mobile && <p className="text-rose-400 text-[10px] mt-1">{errors.mobile}</p>}
                      </Field>
                      <Field label="Email Address" required>
                        <input type="email" className={inputCls + (errors.email ? ' border-rose-500/60' : '')} placeholder="rahul@example.com" value={personal.email} onChange={e => setP('email', e.target.value)} />
                        {errors.email && <p className="text-rose-400 text-[10px] mt-1">{errors.email}</p>}
                      </Field>
                      <Field label="Current City">
                        <input className={inputCls} placeholder="Hyderabad" value={personal.current_city} onChange={e => setP('current_city', e.target.value)} />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Full Address">
                          <textarea className={inputCls} rows={2} placeholder="Door No, Street, City, State, PIN" value={personal.full_address} onChange={e => setP('full_address', e.target.value)} />
                        </Field>
                      </div>
                      <Field label="LinkedIn Profile URL">
                        <input type="url" className={inputCls} placeholder="linkedin.com/in/yourname" value={personal.linkedin_url} onChange={e => setP('linkedin_url', e.target.value)} />
                      </Field>
                      <Field label="Portfolio / GitHub URL">
                        <input type="url" className={inputCls} placeholder="github.com/yourname (optional)" value={personal.portfolio_url} onChange={e => setP('portfolio_url', e.target.value)} />
                      </Field>
                      <Field label="Current CTC">
                        <input className={inputCls} placeholder='3 LPA or "0 — Fresher"' value={personal.current_ctc} onChange={e => setP('current_ctc', e.target.value)} />
                      </Field>
                      <Field label="Expected CTC">
                        <input className={inputCls} placeholder="5 LPA" value={personal.expected_ctc} onChange={e => setP('expected_ctc', e.target.value)} />
                      </Field>
                      <Field label="Notice Period">
                        <div className="relative">
                          <select className={selectCls} value={personal.notice_period} onChange={e => setP('notice_period', e.target.value)}>
                            {NOTICE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
                        </div>
                      </Field>
                      <Field label="Years of Total Experience">
                        <input type="number" min="0" max="50" className={inputCls} placeholder="0 (for fresher)" value={personal.experience_years} onChange={e => setP('experience_years', e.target.value)} />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Willing to Relocate">
                          <div className="flex gap-3 mt-1">
                            {['Yes', 'No'].map(v => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => setP('willing_to_relocate', v === 'Yes')}
                                className={`px-5 py-2 rounded-xl text-sm font-medium border transition-all ${
                                  (personal.willing_to_relocate && v === 'Yes') || (!personal.willing_to_relocate && v === 'No')
                                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                                    : 'bg-white/3 border-white/10 text-[#64748b] hover:border-white/20'
                                }`}
                              >{v}</button>
                            ))}
                          </div>
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════ STEP 2 ══════════════════════════ */}
                {step === 3 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">What roles are you targeting?</h2>
                    <p className="text-[#64748b] text-sm mb-5">Select one or more roles. You can also type a custom role.</p>

                    {/* Search */}
                    <div className="flex gap-2 mb-4">
                      <input
                        className={inputCls}
                        placeholder="Search or type a custom role..."
                        value={roleSearch}
                        onChange={e => { setRoleSearch(e.target.value); setCustomRole(e.target.value) }}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomRole() } }}
                      />
                      {customRole.trim() && !TECH_ROLES.includes(customRole) && !NONTTECH_ROLES.includes(customRole) && (
                        <button onClick={addCustomRole} className="btn-primary py-2.5 px-4 text-sm whitespace-nowrap">
                          <Plus className="w-4 h-4" /> Add
                        </button>
                      )}
                    </div>

                    {/* Selected chips */}
                    {roles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                        <p className="w-full text-indigo-300 text-[10px] font-semibold uppercase tracking-wider mb-1">Selected Roles</p>
                        {roles.map(r => <RoleChip key={r} role={r} onRemove={() => setRoles(prev => prev.filter(x => x !== r))} />)}
                      </div>
                    )}
                    {errors.roles && <p className="text-rose-400 text-xs mb-3">{errors.roles}</p>}

                    {/* Tech Roles */}
                    <div className="mb-4">
                      <p className="text-[#64748b] text-[11px] font-semibold uppercase tracking-wider mb-2">Tech Roles</p>
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                        {filteredRoles(TECH_ROLES).map(r => (
                          <button key={r} onClick={() => toggleRole(r)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              roles.includes(r) ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/3 border-white/10 text-[#64748b] hover:border-white/20 hover:text-white'
                            }`}>{r}</button>
                        ))}
                      </div>
                    </div>

                    {/* Non-Tech Roles */}
                    <div className="mb-5">
                      <p className="text-[#64748b] text-[11px] font-semibold uppercase tracking-wider mb-2">Non-Tech Roles</p>
                      <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                        {filteredRoles(NONTTECH_ROLES).map(r => (
                          <button key={r} onClick={() => toggleRole(r)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              roles.includes(r) ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-white/3 border-white/10 text-[#64748b] hover:border-white/20 hover:text-white'
                            }`}>{r}</button>
                        ))}
                      </div>
                    </div>

                    {/* Work Type */}
                    <Field label="Preferred Work Type">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {WORK_TYPE_OPTIONS.map(w => (
                          <button key={w} type="button" onClick={() => setWorkType(w)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                              work_type === w ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/3 border-white/10 text-[#64748b] hover:border-white/20'
                            }`}>{w}</button>
                        ))}
                      </div>
                    </Field>

                    {/* Preferred Locations */}
                    <div className="mt-4">
                      <Field label="Preferred Locations (comma separated)">
                        <div className="flex gap-2">
                          <input className={inputCls} placeholder="Hyderabad, Bangalore, Remote" value={locationInput} onChange={e => setLocationInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLocation() } }} />
                          <button onClick={addLocation} className="btn-secondary py-2.5 px-4 text-sm whitespace-nowrap">Add</button>
                        </div>
                      </Field>
                      {locations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {locations.map(l => (
                            <span key={l} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-medium">
                              {l}
                              <button onClick={() => setLocations(prev => prev.filter(x => x !== l))}><X className="w-3 h-3 hover:text-rose-400" /></button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                
                {/* ══════════════════════════ STEP 4 ══════════════════════════ */}
                {step === 4 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Experience & Projects</h2>
                    <p className="text-[#64748b] text-sm mb-5">Review and add your work experience and projects.</p>



                    {/* Experience Section */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white font-semibold text-sm">Work Experience</p>
                        <button type="button" onClick={() => setExperience(prev => [...prev, { company: '', role: '', start_date: '', end_date: '', location: '', description: '' }])} className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1"><Plus className="w-3 h-3"/> Add Role</button>
                      </div>
                      
                      <div className="space-y-4">
                        {experience.length === 0 ? (
                          <p className="text-[#64748b] text-xs italic">No experience added.</p>
                        ) : experience.map((exp, i) => (
                          <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 relative group">
                            <button type="button" onClick={() => setExperience(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-3 right-3 text-[#64748b] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Company / Organization"><input className={inputCls} value={exp.company || ''} onChange={e => { const newExp = [...experience]; newExp[i].company = e.target.value; setExperience(newExp) }} /></Field>
                              <Field label="Role / Title"><input className={inputCls} value={exp.role || ''} onChange={e => { const newExp = [...experience]; newExp[i].role = e.target.value; setExperience(newExp) }} /></Field>
                              <Field label="Start Date (e.g. Jan 2021)"><input className={inputCls} value={exp.start_date || ''} onChange={e => { const newExp = [...experience]; newExp[i].start_date = e.target.value; setExperience(newExp) }} /></Field>
                              <Field label="End Date (e.g. Present)"><input className={inputCls} value={exp.end_date || exp.duration || ''} onChange={e => { const newExp = [...experience]; newExp[i].end_date = e.target.value; newExp[i].duration = e.target.value; setExperience(newExp) }} /></Field>
                              <div className="col-span-2">
                                <Field label="Location (Optional)"><input className={inputCls} value={exp.location || ''} onChange={e => { const newExp = [...experience]; newExp[i].location = e.target.value; setExperience(newExp) }} /></Field>
                              </div>
                              <div className="col-span-2">
                                <Field label="Description / Achievements"><textarea className={inputCls} rows={3} value={exp.description || ''} onChange={e => { const newExp = [...experience]; newExp[i].description = e.target.value; setExperience(newExp) }} /></Field>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Projects Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white font-semibold text-sm">Projects</p>
                        <button type="button" onClick={() => setProjects(prev => [...prev, { name: '', start_date: '', end_date: '', description: '' }])} className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1"><Plus className="w-3 h-3"/> Add Project</button>
                      </div>
                      
                      <div className="space-y-4">
                        {projects.length === 0 ? (
                          <p className="text-[#64748b] text-xs italic">No projects added.</p>
                        ) : projects.map((proj, i) => (
                          <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 relative group">
                            <button type="button" onClick={() => setProjects(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-3 right-3 text-[#64748b] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Project Name"><input className={inputCls} value={proj.name || ''} onChange={e => { const newP = [...projects]; newP[i].name = e.target.value; setProjects(newP) }} /></Field>
                              <Field label="Link (Optional)"><input className={inputCls} value={proj.link || ''} onChange={e => { const newP = [...projects]; newP[i].link = e.target.value; setProjects(newP) }} /></Field>
                              <Field label="Start Date"><input className={inputCls} value={proj.start_date || ''} onChange={e => { const newP = [...projects]; newP[i].start_date = e.target.value; setProjects(newP) }} /></Field>
                              <Field label="End Date"><input className={inputCls} value={proj.end_date || ''} onChange={e => { const newP = [...projects]; newP[i].end_date = e.target.value; setProjects(newP) }} /></Field>
                              <div className="col-span-2">
                                <Field label="Description"><textarea className={inputCls} rows={3} value={proj.description || ''} onChange={e => { const newP = [...projects]; newP[i].description = e.target.value; setProjects(newP) }} /></Field>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* ══════════════════════════ STEP 5 ══════════════════════════ */}
                {step === 5 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Confirm & Common Q&A</h2>
                    <p className="text-[#64748b] text-sm mb-5">Review your details and fill in standard application questions.</p>

                    {/* Summary Card */}
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 mb-6">
                      <p className="text-indigo-300 text-xs font-semibold mb-3 uppercase tracking-wider">Profile Summary</p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div><p className="text-[#4b5563] uppercase tracking-wider text-[10px]">Name</p><p className="text-[#94a3b8]">{personal.first_name} {personal.last_name}</p></div>
                        <div><p className="text-[#4b5563] uppercase tracking-wider text-[10px]">Email</p><p className="text-[#94a3b8] truncate">{personal.email || '—'}</p></div>
                        <div><p className="text-[#4b5563] uppercase tracking-wider text-[10px]">Mobile</p><p className="text-[#94a3b8]">{personal.mobile ? `+91 ${personal.mobile}` : '—'}</p></div>
                        <div><p className="text-[#4b5563] uppercase tracking-wider text-[10px]">City</p><p className="text-[#94a3b8]">{personal.current_city || '—'}</p></div>
                        <div><p className="text-[#4b5563] uppercase tracking-wider text-[10px]">Notice</p><p className="text-[#94a3b8]">{personal.notice_period}</p></div>
                        <div><p className="text-[#4b5563] uppercase tracking-wider text-[10px]">Work Type</p><p className="text-[#94a3b8]">{work_type}</p></div>
                        <div className="col-span-2"><p className="text-[#4b5563] uppercase tracking-wider text-[10px] mb-1">Target Roles</p>
                          <div className="flex flex-wrap gap-1">{roles.slice(0, 5).map(r => <span key={r} className="badge badge-indigo text-[9px] py-0.5">{r}</span>)}{roles.length > 5 && <span className="text-[#4b5563] text-[10px]">+{roles.length - 5} more</span>}</div>
                        </div>
                        <div className="col-span-2"><p className="text-[#4b5563] uppercase tracking-wider text-[10px] mb-1">Locations</p>
                          <p className="text-[#94a3b8]">{locations.length > 0 ? locations.join(', ') : 'Not specified'}</p>
                        </div>
                        <div className="col-span-2"><p className="text-[#4b5563] uppercase tracking-wider text-[10px] mb-1">LinkedIn</p>
                          <p className="text-[#94a3b8] truncate">{personal.linkedin_url || '—'}</p>
                        </div>
                        <div className="col-span-2 mt-2 pt-2 border-t border-indigo-500/10">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-indigo-300 font-semibold text-xs">Resume Details</p>
                            {resumeFile && (
                              <span className="text-[#94a3b8] text-[10px] flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                <FileText className="w-3 h-3 text-indigo-400" />
                                <span className="truncate max-w-[150px]">{resumeFile.name}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-[#94a3b8]">
                            <span><strong className="text-white">{experience.length}</strong> Experiences</span>
                            <span><strong className="text-white">{projects.length}</strong> Projects</span>
                            <span><strong className="text-white">{skills.length}</strong> Skills</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Common Q&A */}
                    <div className="space-y-4">
                      <p className="text-white font-semibold text-sm">Common Application Questions</p>

                      <Field label="Years of experience in your primary skill">
                        <input type="number" min="0" className={inputCls} placeholder="e.g. 2" value={qa.years_in_primary_skill} onChange={e => setQA(q => ({ ...q, years_in_primary_skill: e.target.value }))} />
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Willing to work night shifts?">
                          <div className="flex gap-2 mt-1">
                            {['Yes', 'No'].map(v => (
                              <button key={v} type="button" onClick={() => setQA(q => ({ ...q, night_shifts: v }))}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                                  qa.night_shifts === v ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/3 border-white/10 text-[#64748b]'
                                }`}>{v}</button>
                            ))}
                          </div>
                        </Field>
                        <Field label="Valid passport?">
                          <div className="flex gap-2 mt-1">
                            {['Yes', 'No'].map(v => (
                              <button key={v} type="button" onClick={() => setQA(q => ({ ...q, valid_passport: v }))}
                                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                                  qa.valid_passport === v ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'bg-white/3 border-white/10 text-[#64748b]'
                                }`}>{v}</button>
                            ))}
                          </div>
                        </Field>
                      </div>

                      <Field label="Fresher or Experienced?">
                        <div className="flex gap-2 mt-1">
                          {['Fresher', 'Experienced'].map(v => (
                            <button key={v} type="button" onClick={() => setQA(q => ({ ...q, fresher_or_experienced: v }))}
                              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                                qa.fresher_or_experienced === v ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' : 'bg-white/3 border-white/10 text-[#64748b]'
                              }`}>{v}</button>
                          ))}
                        </div>
                      </Field>

                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Highest Qualification">
                          <input className={inputCls} placeholder="B.Tech, MBA, MCA..." value={qa.highest_qualification} onChange={e => setQA(q => ({ ...q, highest_qualification: e.target.value }))} />
                        </Field>
                        <Field label="Current Employer">
                          <input className={inputCls} placeholder="Company name or Fresher" value={qa.current_employer} onChange={e => setQA(q => ({ ...q, current_employer: e.target.value }))} />
                        </Field>
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

              {step < 6 ? (
                <button onClick={goNext} className="btn-primary py-2.5 px-6 flex items-center gap-2">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  id="onboarding-finish"
                  className="btn-primary py-2.5 px-6 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save &amp; Go to Dashboard
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
