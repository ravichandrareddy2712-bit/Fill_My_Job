// Lightweight Supabase REST client — no SDK needed
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzaijkavahxqcovzgszv.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWlqa2F2YWh4cWNvdnpnc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODg1MDksImV4cCI6MjA5NzM2NDUwOX0.vqnro6-VNT042iLxpOh0ZWRl4tnbiw6gApdkMAgEKgk'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWlqa2F2YWh4cWNvdnpnc3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc4ODUwOSwiZXhwIjoyMDk3MzY0NTA5fQ.qrKZAj_BoJkq3ZFI_tey-xiSf3uAe8XE_Jux9ExsHXA'

const headers = () => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
})

// ─── Profile ─────────────────────────────────────────────────
export interface UserProfile {
  id?: string
  session_id?: string
  email?: string
  first_name?: string
  last_name?: string
  gender?: string
  dob?: string
  mobile?: string
  address?: string
  linkedin_url?: string
  portfolio_url?: string
  current_ctc?: string
  expected_ctc?: string
  notice_period?: string
  willing_to_relocate?: boolean
  skills?: string[]
  experience?: Array<{ company: string; role: string; duration: string }>
  internships?: unknown[]
  projects?: unknown[]
  education?: unknown[]
  certifications?: unknown[]
  negative_preferences?: Record<string, unknown>
  common_answers?: Record<string, string>
  search_links?: string[]
  created_at?: string
}

/** Save or upsert a profile (merges on session_id) */
export async function saveProfile(data: Partial<UserProfile>): Promise<UserProfile | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    console.error('Supabase saveProfile error:', res.status, await res.text())
    return null
  }
  const rows = await res.json()
  return Array.isArray(rows) ? rows[0] : rows
}

/** Get the most recent profile (or by session_id) */
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

// ─── Extension Tasks ─────────────────────────────────────────
export interface ExtensionTask {
  id?: string
  session_id?: string
  apply_link: string
  job_title?: string
  company?: string
  field_mappings: Array<{ field_selector: string; field_label: string; value_to_enter: string; confidence: number }>
  status: 'pending' | 'completed' | 'skipped'
  created_at?: string
}

/** Save a task for the browser extension to handle */
export async function saveExtensionTask(task: Omit<ExtensionTask, 'id' | 'created_at'>): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/extension_tasks`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(task),
  })
  return res.ok
}

/** Get pending extension tasks */
export async function getPendingTasks(sessionId?: string): Promise<ExtensionTask[]> {
  let url = `${SUPABASE_URL}/rest/v1/extension_tasks?status=eq.pending&order=created_at.desc&limit=20`
  if (sessionId) {
    url += `&session_id=eq.${encodeURIComponent(sessionId)}`
  }
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) return []
  return res.json()
}

/** Mark an extension task as completed */
export async function completeExtensionTask(taskId: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/extension_tasks?id=eq.${taskId}`, {
    method: 'PATCH',
    headers: {
      ...headers(),
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ status: 'completed' }),
  })
  return res.ok
}
