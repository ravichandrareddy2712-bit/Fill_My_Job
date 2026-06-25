import re

with open('src/app/onboarding/page.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add BookOpen to imports
code = code.replace("ArrowRight, ArrowLeft, Check, X, Plus, ChevronDown,", "ArrowRight, ArrowLeft, Check, X, Plus, ChevronDown, BookOpen,")

# 2. Update steps
steps_old = """const steps = [
  { id: 1, title: 'Personal Details', icon: User, description: 'Basic info about you' },
  { id: 2, title: 'Target Roles', icon: Briefcase, description: 'What you\\'re looking for' },
  { id: 3, title: 'Confirm & Q&A', icon: CheckCircle2, description: 'Review & common answers' },
]"""
steps_new = """const steps = [
  { id: 1, title: 'Personal Details', icon: User, description: 'Basic info about you' },
  { id: 2, title: 'Target Roles', icon: Briefcase, description: 'What you\\'re looking for' },
  { id: 3, title: 'Experience & Projects', icon: BookOpen, description: 'Resume Details' },
  { id: 4, title: 'Confirm & Q&A', icon: CheckCircle2, description: 'Review & common answers' },
]"""
code = code.replace(steps_old, steps_new)

# 3. State additions
state_old = """  // ─── Step 3: Q&A
  const [qa, setQA] = useState({"""
state_new = """  // ─── Step 3: Experience & Projects
  const [experience, setExperience] = useState<Array<{ company: string; role: string; start_date?: string; end_date?: string; location?: string; description?: string; duration?: string }>>([])
  const [projects, setProjects] = useState<Array<{ name: string; start_date?: string; end_date?: string; description?: string; link?: string }>>([])
  const [skills, setSkills] = useState<string[]>([])

  // ─── Step 4: Q&A
  const [qa, setQA] = useState({"""
code = code.replace(state_old, state_new)

# 4. UseEffect parse additions
parse_old = """      if (ex.target_roles?.length) setRoles(ex.target_roles.slice(0, 5))"""
parse_new = """      if (ex.target_roles?.length) setRoles(ex.target_roles.slice(0, 5))
      if (ex.experience) setExperience(ex.experience)
      if (ex.projects) setProjects(ex.projects)
      if (ex.skills) setSkills(ex.skills)
"""
code = code.replace(parse_old, parse_new)

# 5. Nav logic max step
code = code.replace("setStep(s => Math.min(s + 1, 3))", "setStep(s => Math.min(s + 1, 4))")
code = code.replace("const e = validateStep(3)", "const e = validateStep(4)")
code = code.replace("Step {step} of 3", "Step {step} of 4")

# 6. handleSubmit payload
payload_old = """        experience: (extracted.experience as Array<{ company: string; role: string; duration: string }>) || [],
        internships: (extracted.internships as unknown[]) || [],
        projects: (extracted.projects as unknown[]) || [],
        education: (extracted.education as unknown[]) || [],
        certifications: (extracted.certifications as unknown[]) || [],
        resume_text: (extracted.resume_text as string) || '',"""
payload_new = """        experience: experience,
        projects: projects,
        skills: Array.from(new Set([...roles, ...skills])),
        internships: (extracted.internships as unknown[]) || [],
        education: (extracted.education as unknown[]) || [],
        certifications: (extracted.certifications as unknown[]) || [],
        resume_text: (extracted.resume_text as string) || '',"""
code = code.replace(payload_old, payload_new)

# 7. Add step 3 JSX
step3_jsx = """
                {/* ══════════════════════════ STEP 3 ══════════════════════════ */}
                {step === 3 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Experience & Projects</h2>
                    <p className="text-[#64748b] text-sm mb-5">Review and add your work experience and projects.</p>

                    {/* Extracted Skills */}
                    {skills.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[#64748b] text-xs font-medium mb-2 uppercase tracking-wider">Extracted Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((s, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white">{s}</span>)}
                        </div>
                      </div>
                    )}

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
"""
code = code.replace("{/* ══════════════════════════ STEP 3 ══════════════════════════ */}", step3_jsx + "\n                {/* ══════════════════════════ STEP 4 ══════════════════════════ */}")
code = code.replace("step === 3 && (", "step === 4 && (")

# 8. Update summary in step 4
summary_old = """                        <div className="col-span-2"><p className="text-[#4b5563] uppercase tracking-wider text-[10px] mb-1">Locations</p>
                          <p className="text-[#94a3b8]">{locations.length > 0 ? locations.join(', ') : 'Not specified'}</p>
                        </div>
                      </div>
                    </div>"""
summary_new = """                        <div className="col-span-2"><p className="text-[#4b5563] uppercase tracking-wider text-[10px] mb-1">Locations</p>
                          <p className="text-[#94a3b8]">{locations.length > 0 ? locations.join(', ') : 'Not specified'}</p>
                        </div>
                        <div className="col-span-2"><p className="text-[#4b5563] uppercase tracking-wider text-[10px] mb-1">LinkedIn</p>
                          <p className="text-[#94a3b8] truncate">{personal.linkedin_url || '—'}</p>
                        </div>
                        <div className="col-span-2 mt-2 pt-2 border-t border-indigo-500/10">
                          <p className="text-indigo-300 font-semibold mb-2 text-xs">Resume Details</p>
                          <div className="flex items-center gap-4 text-[#94a3b8]">
                            <span><strong className="text-white">{experience.length}</strong> Experiences</span>
                            <span><strong className="text-white">{projects.length}</strong> Projects</span>
                            <span><strong className="text-white">{skills.length}</strong> Skills</span>
                          </div>
                        </div>
                      </div>
                    </div>"""
code = code.replace(summary_old, summary_new)

# 9. step < 3 to step < 4
code = code.replace("step < 3 ?", "step < 4 ?")
code = code.replace("{((step - 1) / 2) * 100}", "{((step - 1) / 3) * 100}")

with open('src/app/onboarding/page.tsx', 'w', encoding='utf-8') as f:
    f.write(code)

print("success")
