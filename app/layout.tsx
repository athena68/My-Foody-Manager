import type React from "react"
import "@/styles/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { AuthProvider } from "@/components/auth/auth-provider"
import { MapProvider } from "@/components/maps/map-provider"
import { Toaster } from "@/components/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "My Foody Manager",
  description: "Manage your favorite restaurants and food spots",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <MapProvider>
              <div className="min-h-screen bg-background">
                <Navigation />
                <main className="container mx-auto py-6">{children}</main>
              </div>
            </MapProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}

