import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzaijkavahxqcovzgszv.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWlqa2F2YWh4cWNvdnpnc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODg1MDksImV4cCI6MjA5NzM2NDUwOX0.vqnro6-VNT042iLxpOh0ZWRl4tnbiw6gApdkMAgEKgk'

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
