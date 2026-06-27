'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BrainCircuit, Chrome, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { getProfile } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Check if user is already logged in or returning from OAuth redirect
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // User is logged in via Google
        const userId = session.user.id
        
        // Save the Supabase Auth ID as our app's session ID
        localStorage.setItem('fmj_session_id', userId)
        
        // Save email so onboarding can prefill it if needed
        if (session.user.email) {
          localStorage.setItem('fmj_google_email', session.user.email)
        }
        
        // Check if they already have a profile in the database
        const profile = await getProfile(userId)
        
        if (profile) {
          // Profile exists, go straight to dashboard
          localStorage.setItem('fmj_onboarded', 'true')
          router.replace('/dashboard')
        } else {
          // New user, needs onboarding
          router.replace('/onboarding')
        }
      } else {
        setCheckingSession(false)
      }
    }
    
    checkSession()

    // Listen for auth state changes (e.g. when OAuth redirect lands)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkSession()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login',
      }
    })
    
    if (error) {
      console.error('Google login error:', error.message)
      alert('Failed to login with Google: ' + error.message)
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#08080f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080f] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="glass-card p-8 md:p-12 max-w-md w-full text-center relative z-10"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
          <BrainCircuit className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome Back</h1>
        <p className="text-[#94a3b8] text-sm mb-8">Sign in to access your AI job application agent.</p>
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-[#0f172a] font-semibold text-sm hover:bg-slate-100 transition-colors disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Chrome className="w-5 h-5 text-rose-500" />
              Continue with Google
            </>
          )}
        </button>

        <p className="text-[#4b5563] text-xs mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}
