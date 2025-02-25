import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { debug } from "@/lib/debug"

const protectedRoutes = ["/add", "/list", "/map"]

export async function middleware(req: NextRequest) {
  debug.auth(`Checking route ${req.nextUrl.pathname}`)

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      debug.error("Middleware session error", error)
    }

    // Allow access to auth callback route even without session
    if (req.nextUrl.pathname.startsWith("/auth/callback")) {
      return res
    }

    debug.auth("Session check", {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      isProtected: protectedRoutes.includes(req.nextUrl.pathname),
    })

    // If the route is protected and there's no session, redirect to home
    if (protectedRoutes.includes(req.nextUrl.pathname) && !session) {
      debug.auth("Unauthorized access, redirecting to home")
      const redirectUrl = new URL("/", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    debug.error("Middleware error", error)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (auth callback route)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)",
  ],
}

