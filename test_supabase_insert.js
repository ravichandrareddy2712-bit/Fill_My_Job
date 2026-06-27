const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzaijkavahxqcovzgszv.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWlqa2F2YWh4cWNvdnpnc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODg1MDksImV4cCI6MjA5NzM2NDUwOX0.vqnro6-VNT042iLxpOh0ZWRl4tnbiw6gApdkMAgEKgk';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWlqa2F2YWh4cWNvdnpnc3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc4ODUwOSwiZXhwIjoyMDk3MzY0NTA5fQ.qrKZAj_BoJkq3ZFI_tey-xiSf3uAe8XE_Jux9ExsHXA';

async function test() {
  const profileData = {
    session_id: "test-" + Date.now(),
    first_name: "Test",
    last_name: "User",
    middle_name: "",
    gender: "Male",
    dob: "2000-01-01",
    mobile: "1234567890",
    email: "test@example.com",
    current_city: "City",
    full_address: "Address",
    linkedin_url: "",
    portfolio_url: "",
    current_ctc: "",
    expected_ctc: "",
    notice_period: "Immediate",
    willing_to_relocate: true,
    experience_years: 0,
    target_roles: ["Developer"],
    preferred_locations: ["Remote"],
    work_type: "Any",
    experience: [],
    projects: [],
    skills: ["HTML"],
    resume_text: "",
    common_answers: {}
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?on_conflict=session_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(profileData),
  });

  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

test();
