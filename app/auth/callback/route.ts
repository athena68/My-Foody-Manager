import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const error = requestUrl.searchParams.get("error")
    const error_description = requestUrl.searchParams.get("error_description")

    if (error) {
      console.error("Auth error:", error, error_description)
      // Use relative URL for redirect
      return NextResponse.redirect(
        `${requestUrl.origin}/?error=${encodeURIComponent(error_description || "Authentication failed")}`,
      )
    }

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

      if (sessionError) {
        console.error("Session exchange error:", sessionError)
        return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent("Failed to create session")}`)
      }

      // Successful authentication - redirect to home page
      return NextResponse.redirect(`${requestUrl.origin}/`)
    }

    // No code or error present - redirect to home with error
    return NextResponse.redirect(`${requestUrl.origin}/?error=Invalid callback`)
  } catch (error) {
    console.error("Unhandled auth callback error:", error)
    const requestUrl = new URL(request.url)
    return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent("An unexpected error occurred")}`)
  }
}

