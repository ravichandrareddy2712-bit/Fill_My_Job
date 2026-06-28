-- ============================================================
-- FindMyJob.AI — Supabase Migration v2
-- Run this in Supabase → SQL Editor
-- ============================================================

-- TABLE: extension_tasks (Ghost Mouse task queue)
-- n8n writes tasks here → extension polls every 60s → applies
CREATE TABLE IF NOT EXISTS extension_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  apply_link TEXT,
  apply_type TEXT CHECK (apply_type IN ('easy_apply', 'direct_external')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'failed', 'skipped')),
  field_mappings JSONB DEFAULT '[]',
  match_score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-update updated_at on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_extension_tasks ON extension_tasks;
CREATE TRIGGER set_updated_at_extension_tasks
  BEFORE UPDATE ON extension_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- TABLE: portal_sessions (stores extension cookies per user)
-- Extension sends portal cookies here after user clicks "Send to Agent"
CREATE TABLE IF NOT EXISTS portal_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  portals JSONB DEFAULT '{}',  -- { naukri: { cookies: [], search_url: '...' }, linkedin: {...} }
  saved_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add missing columns to users table if they don't exist
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS portal_sessions_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sessions_saved_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS internships JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS negative_preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS search_links JSONB DEFAULT '[]';

-- ============================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================

-- Enable RLS
ALTER TABLE extension_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_extension_tasks" ON extension_tasks;
CREATE POLICY "anon_all_extension_tasks" ON extension_tasks
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_portal_sessions" ON portal_sessions;
CREATE POLICY "anon_all_portal_sessions" ON portal_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_extension_tasks_session_status 
  ON extension_tasks(session_id, status);

CREATE INDEX IF NOT EXISTS idx_extension_tasks_status 
  ON extension_tasks(status) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_portal_sessions_session_id 
  ON portal_sessions(session_id);

-- ============================================================
-- VERIFY: run this to confirm tables exist
-- ============================================================
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'applications', 'extension_tasks', 'portal_sessions');
