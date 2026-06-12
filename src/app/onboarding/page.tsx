'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  BrainCircuit, User, Upload, Briefcase, MapPin,
  ArrowRight, ArrowLeft, Check, CloudUpload, X, Plus
} from 'lucide-react'

const steps = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Tell us about yourself' },
  { id: 2, title: 'Upload Documents', icon: Upload, description: 'Resume & cover letter' },
  { id: 3, title: 'Skills & Experience', icon: Briefcase, description: 'What you bring to the table' },
  { id: 4, title: 'Job Preferences', icon: MapPin, description: 'Your ideal role' },
]

function UploadBox({
  label, accept, file, onFile, onClear
}: {
  label: string
  accept: string
  file: File | null
  onFile: (f: File) => void
  onClear: () => void
}) {
  const [dragging, setDragging] = useState(false)

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
        dragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5'
      } ${file ? 'border-emerald-400/40 bg-emerald-500/5' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
      onClick={() => !file && document.getElementById(`upload-${label}`)?.click()}
    >
      <input
        id={`upload-${label}`}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      {file ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">{file.name}</p>
              <p className="text-[#64748b] text-xs">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClear() }}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#64748b] hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <CloudUpload className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
          <p className="text-white font-medium text-sm mb-1">{label}</p>
          <p className="text-[#64748b] text-xs">Drag & drop or click to browse (PDF, max 10MB)</p>
        </>
      )}
    </div>
  )
}

const skillSuggestions = ['React', 'TypeScript', 'Python', 'Node.js', 'SQL', 'AWS', 'Docker', 'Figma', 'Product Management', 'Data Analysis', 'Machine Learning', 'Leadership']
const roleOptions = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'Marketing Manager', 'DevOps Engineer', 'Business Analyst', 'Sales Engineer']
const locationOptions = ['Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Singapore', 'Toronto', 'Austin']

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    resume: null as File | null,
    coverLetter: null as File | null,
    skills: [] as string[],
    experience: '2-5',
    roles: [] as string[],
    locations: [] as string[],
  })
  const [skillInput, setSkillInput] = useState('')
  const [direction, setDirection] = useState(1)

  const goNext = () => { setDirection(1); setStep((s) => Math.min(s + 1, 4)) }
  const goPrev = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)) }

  const toggleSkill = (s: string) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
    }))
  }

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

  const addCustomSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, skillInput.trim()] }))
      setSkillInput('')
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
        <span className="text-[#64748b] text-sm">Step {step} of 4</span>
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
                animate={{ width: `${((step - 1) / 3) * 100}%` }}
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
                {/* Step 1: Personal Info */}
                {step === 1 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Personal Information</h2>
                    <p className="text-[#64748b] text-sm mb-6">Let&apos;s get to know you better.</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">First Name</label>
                          <input id="first-name" className="input-glass" placeholder="John" value={form.firstName}
                            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">Last Name</label>
                          <input id="last-name" className="input-glass" placeholder="Doe" value={form.lastName}
                            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">Email Address</label>
                        <input id="email" type="email" className="input-glass" placeholder="john@example.com" value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                      <div>
                        <label className="text-[#94a3b8] text-xs font-medium mb-1.5 block">Phone Number</label>
                        <input id="phone" type="tel" className="input-glass" placeholder="+1 (555) 000-0000" value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Upload */}
                {step === 2 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Upload Documents</h2>
                    <p className="text-[#64748b] text-sm mb-6">Your resume is required. Cover letter is optional.</p>
                    <div className="space-y-4">
                      <UploadBox
                        label="Upload Resume (PDF) *"
                        accept=".pdf"
                        file={form.resume}
                        onFile={(f) => setForm(x => ({ ...x, resume: f }))}
                        onClear={() => setForm(x => ({ ...x, resume: null }))}
                      />
                      <UploadBox
                        label="Upload Cover Letter (PDF) — optional"
                        accept=".pdf"
                        file={form.coverLetter}
                        onFile={(f) => setForm(x => ({ ...x, coverLetter: f }))}
                        onClear={() => setForm(x => ({ ...x, coverLetter: null }))}
                      />
                      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-indigo-300 text-xs">
                          🔒 Your files are encrypted and never shared. Our AI will extract skills automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Skills */}
                {step === 3 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Skills & Experience</h2>
                    <p className="text-[#64748b] text-sm mb-6">Select your skills or add custom ones.</p>

                    {/* Skills */}
                    <div className="mb-5">
                      <label className="text-[#94a3b8] text-xs font-medium mb-2 block">Skills</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {skillSuggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => toggleSkill(s)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                              form.skills.includes(s)
                                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                : 'bg-white/3 border-white/10 text-[#64748b] hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          className="input-glass text-sm flex-1"
                          placeholder="Add custom skill..."
                          value={skillInput}
                          onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addCustomSkill()}
                        />
                        <button onClick={addCustomSkill} className="btn-primary py-2.5 px-4">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="text-[#94a3b8] text-xs font-medium mb-2 block">Years of Experience</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['0-1', '1-2', '2-5', '5-10', '10+'].map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setForm(f => ({ ...f, experience: lvl }))}
                            className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                              form.experience === lvl
                                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                : 'bg-white/3 border-white/10 text-[#64748b] hover:border-white/20 hover:text-white'
                            }`}
                          >
                            {lvl} yrs
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Preferences */}
                {step === 4 && (
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
                        <p>👤 {form.firstName || 'Name'} {form.lastName} · {form.email || 'email'}</p>
                        <p>💼 {form.experience} years experience · {form.skills.length} skills</p>
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

              {step < 4 ? (
                <button onClick={goNext} className="btn-primary py-2.5 px-6">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link href="/dashboard" id="onboarding-finish" className="btn-primary py-2.5 px-6">
                  <Check className="w-4 h-4" />
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
