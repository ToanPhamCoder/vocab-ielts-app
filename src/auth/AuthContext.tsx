import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { clearLocalData, syncOnLogin } from '../sync/syncService'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  syncing: boolean
  configured: boolean
  signInWithEmail: (email: string, password: string) => Promise<string | null>
  signUpWithEmail: (email: string, password: string) => Promise<string | null>
  signInWithGoogle: () => Promise<string | null>
  signOut: () => Promise<void>
  refreshSync: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const runSync = useCallback(async () => {
    if (!supabase) return
    setSyncing(true)
    try {
      await syncOnLogin()
    } catch (e) {
      console.error('syncOnLogin', e)
    } finally {
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
      if (data.session) void runSync()
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      if (event === 'SIGNED_IN') void runSync()
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [runSync])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Supabase chưa cấu hình'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'Supabase chưa cấu hình'
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return 'Supabase chưa cấu hình'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    await clearLocalData()
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      syncing,
      configured: isSupabaseConfigured,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      refreshSync: runSync,
    }),
    [user, session, loading, syncing, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, runSync],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
