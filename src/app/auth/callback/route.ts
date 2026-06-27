import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the authenticated user's ID
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if the user already has a profile in `user_profiles`
        // We use the same REST API logic here just mapped to session_id = user.id
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?session_id=eq.${user.id}&select=*&limit=1`, {
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          }
        })
        
        if (res.ok) {
          const rows = await res.json()
          if (rows && rows.length > 0) {
            // Profile exists, redirect to dashboard
            return NextResponse.redirect(`${origin}/dashboard`)
          } else {
            // No profile, redirect to onboarding
            return NextResponse.redirect(`${origin}/onboarding`)
          }
        }
      }

      // Default redirect
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
