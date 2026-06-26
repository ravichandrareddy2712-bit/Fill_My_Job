import sys

file_path = "src/app/onboarding/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update steps array
old_steps = """const steps = [
  { id: 1, title: 'Upload Resume', icon: Upload, description: 'Quick auto-fill' },
  { id: 2, title: 'Personal Details', icon: User, description: 'Basic info about you' },
  { id: 3, title: 'Target Roles', icon: Briefcase, description: 'What you\\'re looking for' },
  { id: 4, title: 'Experience & Projects', icon: BookOpen, description: 'Resume Details' },
  { id: 5, title: 'Confirm & Q&A', icon: CheckCircle2, description: 'Review & common answers' },
]"""
new_steps = """const steps = [
  { id: 1, title: 'Upload Resume', icon: Upload, description: 'Quick auto-fill' },
  { id: 2, title: 'Personal Details', icon: User, description: 'Basic info about you' },
  { id: 3, title: 'Target Roles', icon: Briefcase, description: 'What you\\'re looking for' },
  { id: 4, title: 'Experience & Projects', icon: BookOpen, description: 'Resume Details' },
  { id: 5, title: 'Skills', icon: BrainCircuit, description: 'Tools & Languages' },
  { id: 6, title: 'Confirm & Q&A', icon: CheckCircle2, description: 'Review & common answers' },
]"""
content = content.replace(old_steps, new_steps)

# 2. Add skillInput state
content = content.replace("const [locationInput, setLocationInput] = useState('')", "const [locationInput, setLocationInput] = useState('')\n  const [skillInput, setSkillInput] = useState('')")

# 3. Add addSkill function
add_skill_fn = """  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) { setSkills(prev => [...prev, s]); setSkillInput('') }
  }
"""
content = content.replace("  const addLocation = () => {", add_skill_fn + "  const addLocation = () => {")

# 4. update validateStep(6)
content = content.replace("const e = validateStep(5)", "const e = validateStep(6)")

# 5. Header / Progress bar
content = content.replace("Step {step} of 5", "Step {step} of 6")
content = content.replace("((step - 1) / 4) * 100", "((step - 1) / 5) * 100")
content = content.replace("setStep(s => Math.min(s + 1, 5))", "setStep(s => Math.min(s + 1, 6))")

# 6. Change Confirm Q&A to step 6
content = content.replace("{/* ══════════════════════════ STEP 5 ══════════════════════════ */}\\n                {step === 5 && (", "{/* ══════════════════════════ STEP 6 ══════════════════════════ */}\\n                {step === 6 && (")

# 7. Remove Extracted Skills from Step 4 and insert Step 5 Skills
ext_skills_old = """                    {/* Extracted Skills */}
                    {skills.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[#64748b] text-xs font-medium mb-2 uppercase tracking-wider">Extracted Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((s, i) => <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white">{s}</span>)}
                        </div>
                      </div>
                    )}"""

step_5_skills = """                {/* ══════════════════════════ STEP 5 ══════════════════════════ */}
                {step === 5 && (
                  <div>
                    <h2 className="font-display font-bold text-2xl text-white mb-1">Your Skills</h2>
                    <p className="text-[#64748b] text-sm mb-5">Add all your programming languages, frameworks, tools, and soft skills.</p>
                    
                    <Field label="Add a Skill (press Enter)">
                      <div className="flex gap-2 mb-4">
                        <input className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-[#4b5563] outline-none focus:border-indigo-500/60 focus:bg-white/7 transition-all" placeholder="e.g. React, Python, AWS..." value={skillInput} onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} />
                        <button onClick={addSkill} className="btn-secondary py-2.5 px-4 text-sm whitespace-nowrap">Add</button>
                      </div>
                    </Field>

                    <div className="flex flex-wrap gap-2 min-h-32 content-start">
                      {skills.length === 0 ? (
                        <p className="text-[#64748b] text-xs italic">No skills added yet.</p>
                      ) : skills.map(s => (
                        <span key={s} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium group">
                          {s}
                          <button onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="opacity-60 hover:opacity-100 hover:text-rose-400 transition-all"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
"""

content = content.replace(ext_skills_old, "")
content = content.replace("{/* ══════════════════════════ STEP 6 ══════════════════════════ */}", step_5_skills + "\\n                {/* ══════════════════════════ STEP 6 ══════════════════════════ */}")

# 8. Footer button
content = content.replace("{step < 5 ?", "{step < 6 ?")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Modified page.tsx for 6 steps!")
