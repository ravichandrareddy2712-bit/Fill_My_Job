// Lightweight Supabase REST client — no SDK needed
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzaijkavahxqcovzgszv.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWlqa2F2YWh4cWNvdnpnc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODg1MDksImV4cCI6MjA5NzM2NDUwOX0.vqnro6-VNT042iLxpOh0ZWRl4tnbiw6gApdkMAgEKgk'

const headers = () => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
})

// ─── Profile ─────────────────────────────────────────────────
export interface UserProfile {
  id?: string
  session_id?: string
  email?: string
  first_name?: string
  last_name?: string
  middle_name?: string
  gender?: string
  dob?: string
  mobile?: string
  current_city?: string
  full_address?: string
  address?: string  // legacy compat
  linkedin_url?: string
  portfolio_url?: string
  current_ctc?: string
  expected_ctc?: string
  notice_period?: string
  willing_to_relocate?: boolean
  experience_years?: number
  target_roles?: string[]
  preferred_locations?: string[]
  work_type?: string
  resume_url?: string
  resume_text?: string
  skills?: string[]
  experience?: Array<{ company: string; role: string; start_date?: string; end_date?: string; location?: string; description?: string; duration?: string }>
  projects?: Array<{ name: string; start_date?: string; end_date?: string; description?: string; link?: string }>
  education?: unknown[]
  certifications?: unknown[]
  common_answers?: Record<string, string>
  portal_links?: Record<string, unknown>
  plan?: string
  whatsapp_number?: string
  created_at?: string
  updated_at?: string
}

/** Save or upsert a profile (merges on session_id) */
export async function saveProfile(data: Partial<UserProfile>): Promise<UserProfile | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?on_conflict=session_id`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorText = await res.text()
    console.error('Supabase saveProfile error:', res.status, errorText)
    throw new Error(`Supabase Error ${res.status}: ${errorText}`)
  }
  const rows = await res.json()
  return Array.isArray(rows) ? rows[0] : rows
}

/** Get profile by session_id (or most recent if no session_id) */
export async function getProfile(sessionId?: string): Promise<UserProfile | null> {
  let url = `${SUPABASE_URL}/rest/v1/users?select=*&order=id.desc&limit=1`
  if (sessionId) {
    url = `${SUPABASE_URL}/rest/v1/users?session_id=eq.${encodeURIComponent(sessionId)}&select=*&limit=1`
  }
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) return null
  const rows = await res.json()
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
}

// ─── Scraped Jobs ─────────────────────────────────────────────
export interface ScrapedJob {
  id?: string
  session_id?: string
  job_title?: string
  company?: string
  location?: string
  portal?: string
  apply_link?: string
  apply_type?: string
  match_score?: number
  date_scraped?: string
  status?: string // 'Found', 'Applied', 'Skipped', 'Failed'
}

/** Get all scraped jobs for a session, ordered newest first */
export async function getScrapedJobs(sessionId: string): Promise<ScrapedJob[]> {
  const url = `${SUPABASE_URL}/rest/v1/scraped_jobs?session_id=eq.${encodeURIComponent(sessionId)}&select=*&order=date_scraped.desc,id.desc&limit=200`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) return []
  return res.json()
}

// ─── Applications ─────────────────────────────────────────────
export interface Application {
  id?: string
  session_id?: string
  company?: string
  job_title?: string
  portal?: string
  apply_type?: string
  status?: string
  apply_link?: string
  applied_at?: string
  notes?: string
  screenshot_url?: string
}

/** Get all applications for a session, ordered newest first */
export async function getApplications(sessionId: string): Promise<Application[]> {
  const url = `${SUPABASE_URL}/rest/v1/applications?session_id=eq.${encodeURIComponent(sessionId)}&select=*&order=applied_at.desc&limit=100`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) return []
  return res.json()
}

// ─── Agent Runs ───────────────────────────────────────────────
export interface AgentRun {
  id?: string
  session_id?: string
  status?: string // 'running', 'scraping', 'applying', 'done', 'error'
  message?: string
  jobs_found?: number
  jobs_applied?: number
  started_at?: string
  finished_at?: string
}

/** Get the latest agent run for a session */
export async function getLatestAgentRun(sessionId: string): Promise<AgentRun | null> {
  const url = `${SUPABASE_URL}/rest/v1/agent_runs?session_id=eq.${encodeURIComponent(sessionId)}&select=*&order=started_at.desc&limit=1`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) return null
  const rows = await res.json()
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
}

/** Create a new agent run */
export async function createAgentRun(sessionId: string): Promise<AgentRun | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/agent_runs`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      session_id: sessionId,
      status: 'running',
      message: 'Agent started...',
      jobs_found: 0,
      jobs_applied: 0,
    }),
  })
  if (!res.ok) return null
  const rows = await res.json()
  return Array.isArray(rows) ? rows[0] : rows
}

// ─── Stats ────────────────────────────────────────────────────

export interface DashboardStats {
  jobsFoundToday: number
  appliedToday: number
  pending: number
  responses: number
}

/** Get dashboard stats combining scraped_jobs + applications */
export async function getDashboardStats(sessionId: string): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0]

  const [apps, jobs] = await Promise.all([
    getApplications(sessionId),
    getScrapedJobs(sessionId),
  ])

  const jobsFoundToday = jobs.filter(j => j.date_scraped === today).length
  const appliedToday = apps.filter(a => a.applied_at?.startsWith(today) && (a.status?.includes('Applied') || a.status?.includes('✅'))).length
  const pending = apps.filter(a => a.status === 'Pending' || a.status?.includes('Pending') || a.status?.includes('⏳')).length
  const responses = apps.filter(a => a.status?.includes('Response') || a.status?.includes('Interview') || a.status?.includes('Offer') || a.status?.includes('📬')).length

  return { jobsFoundToday, appliedToday, pending, responses }
}

/** Legacy compat — old getApplicationStats */
export async function getApplicationStats(sessionId: string): Promise<{
  total: number
  appliedToday: number
  pending: number
  responses: number
}> {
  const s = await getDashboardStats(sessionId)
  return {
    total: s.jobsFoundToday,
    appliedToday: s.appliedToday,
    pending: s.pending,
    responses: s.responses,
  }
}
