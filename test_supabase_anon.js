const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yzaijkavahxqcovzgszv.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6YWlqa2F2YWh4cWNvdnpnc3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODg1MDksImV4cCI6MjA5NzM2NDUwOX0.vqnro6-VNT042iLxpOh0ZWRl4tnbiw6gApdkMAgEKgk';

async function test() {
  const profileData = {
    session_id: "test-fixed-id-1234",
    first_name: "Test",
    last_name: "User",
    email: "test@example.com"
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?on_conflict=session_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(profileData),
  });

  console.log('Status 1:', res.status, await res.text());

  const res2 = await fetch(`${SUPABASE_URL}/rest/v1/users?on_conflict=session_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(profileData),
  });

  console.log('Status 2:', res2.status, await res2.text());
}

test();
