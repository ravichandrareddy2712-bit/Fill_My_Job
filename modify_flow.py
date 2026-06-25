import re

with open('src/components/landing/HeroSection.tsx', 'r', encoding='utf-8') as f:
    hero = f.read()

# Remove state logic in HeroSection
state_old = '''  const [isDragging, setIsDragging] = useState(false)
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
        // Store extracted data for onboarding pre-fill
        if (typeof window !== 'undefined' && extracted) {
          sessionStorage.setItem('fmj_extracted', JSON.stringify(extracted))
          localStorage.removeItem('fmj_onboarding_draft') // Clear any old draft
        }
        setExtractionStep('Profile extracted! Redirecting...')
        await new Promise(r => setTimeout(r, 600))
      } else {
        // Even if extraction fails, still go to onboarding — user fills manually
        setExtractionStep('Redirecting to onboarding...')
        await new Promise(r => setTimeout(r, 400))
      }

      router.push('/onboarding')
    } catch {
      // Network error — still redirect, user fills manually
      setExtractionStep('Redirecting to onboarding...')
      await new Promise(r => setTimeout(r, 500))
      router.push('/onboarding')
    }
  }'''

hero = hero.replace(state_old, '')
hero = hero.replace('const { setResumeFile } = useFileContext()\n  ', '')

# Replace dropzone UI with CTA button
# Using regex to replace everything inside the motion.div
hero = re.sub(r'(<motion\.div variants={fadeUp} className="mt-8">).*?(</motion\.div>)', 
r'''\1
              <button
                onClick={() => router.push('/onboarding')}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#08080f] rounded-xl font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />
                Start AutoApplying Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            \2''', hero, flags=re.DOTALL | re.MULTILINE)

with open('src/components/landing/HeroSection.tsx', 'w', encoding='utf-8') as f:
    f.write(hero)

print("HeroSection modified")

with open('src/app/onboarding/page.tsx', 'r', encoding='utf-8') as f:
    page = f.read()

# Add lucide icons
page = page.replace('ArrowRight, ArrowLeft, Check, X, Plus, ChevronDown, BookOpen, User, Building, MapPin, ExternalLink, Calendar, Search', 'ArrowRight, ArrowLeft, Check, X, Plus, ChevronDown, BookOpen, User, Building, MapPin, ExternalLink, Calendar, Search, Upload, FileText, Loader2')

# Add extraction states and handleFile to page.tsx
state_add = '''  const [isDragging, setIsDragging] = useState(false)
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

  const setP = (key: string, val: string | boolean) => setPersonal(p => ({ ...p, [key]: val }))'''

page = page.replace('  const setP = (key: string, val: string | boolean) => setPersonal(p => ({ ...p, [key]: val }))', state_add)

# Change steps array
steps_old = "const steps = ['Personal Details', 'Target Roles', 'Experience & Projects', 'Confirm & Q&A']"
steps_new = "const steps = ['Resume', 'Personal Details', 'Target Roles', 'Experience & Projects', 'Confirm & Q&A']"
page = page.replace(steps_old, steps_new)

# Add Step 1 UI
step1_ui = '''
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

              {!isExtracting && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => { setDirection(1); setStep(2) }}
                    className="text-[#94a3b8] hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    Skip and fill manually <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
'''

# We need to replace Step 1 UI with Step 2, Step 2 with Step 3, etc.
page = page.replace('{step === 4 && (', '{step === 5 && (')
page = page.replace('{step === 3 && (', '{step === 4 && (')
page = page.replace('{step === 2 && (', '{step === 3 && (')
page = page.replace('{step === 1 && (', '{step === 999 && (') # Temporary placeholder
page = page.replace('{step === 999 && (', step1_ui + '\n          {/* Step 2: Personal Details */}\n          {step === 2 && (')

# Also update the progress bar and next/prev buttons logic!
# Current: validateStep(step) switch uses cases 1, 2, 3
page = page.replace('case 1:', 'case 2:')
page = page.replace('case 2:', 'case 3:')
page = page.replace('case 3:', 'case 4:')

with open('src/app/onboarding/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page)

print("Onboarding page modified")
