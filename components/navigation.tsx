"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Utensils, Map, List, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthButton } from "@/components/auth/auth-button"
import { useAuth } from "@/components/auth/auth-provider"

export function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Utensils className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">My Foody Manager</span>
          </Link>
          {user && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/map"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === "/map" ? "text-foreground" : "text-foreground/60",
                )}
              >
                <div className="flex items-center space-x-2">
                  <Map className="h-4 w-4" />
                  <span>Map</span>
                </div>
              </Link>
              <Link
                href="/list"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === "/list" ? "text-foreground" : "text-foreground/60",
                )}
              >
                <div className="flex items-center space-x-2">
                  <List className="h-4 w-4" />
                  <span>List</span>
                </div>
              </Link>
            </nav>
          )}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {user && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}

