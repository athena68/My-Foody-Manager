"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Location } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Star, Search, MapPin } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export default function LocationList() {
  const router = useRouter()
  const { user } = useAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchLocations = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from("locations").select("*").eq("user_id", user.id)

        if (error) throw error

        setLocations(data || [])
      } catch (error) {
        console.error("Error fetching locations:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load locations.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [user, toast])

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Food Spots</h1>
        <Button asChild>
          <Link href="/add">Add New Location</Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredLocations.map((location) => (
          <Link key={location.id} href={`/locations/${location.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-lg">{location.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{location.address}</span>
                  </div>

                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1">{location.rating}</span>
                  </div>

                  {location.tags && location.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {location.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredLocations.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No locations found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

