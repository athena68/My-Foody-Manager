"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { debug } from "@/lib/debug"

interface AuthContextType {
  user: User | null
  session: Session | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signIn: async () => {},
  signOut: async () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Check for authentication error in URL
  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error")
    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: decodeURIComponent(error),
      })
      // Remove error from URL
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [toast])

  useEffect(() => {
    const initializeAuth = async () => {
      debug.auth("Initializing auth provider")
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error

        setSession(session)
        setUser(session?.user ?? null)

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          router.refresh()
        })

        return () => subscription.unsubscribe()
      } catch (error) {
        debug.error("Error in auth initialization", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [supabase, router])

  // Update the signIn function
  const signIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          skipBrowserRedirect: false, // Ensure browser handles the redirect
        },
      })

      if (error) throw error

      debug.auth("Sign in initiated", { data })
    } catch (error) {
      debug.error("Sign in error:", error)
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "There was a problem signing in. Please try again.",
      })
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setSession(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      debug.error("Sign out error:", error)
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: "There was a problem signing out. Please try again.",
      })
    }
  }

  return <AuthContext.Provider value={{ user, session, signIn, signOut, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

