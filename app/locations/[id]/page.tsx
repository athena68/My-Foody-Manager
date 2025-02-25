"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Location } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Star, Calendar, Trash2, Edit } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"

export default function LocationDetails() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  useEffect(() => {
    const fetchLocation = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("locations")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single()

        if (error) throw error

        if (!data) {
          toast({
            variant: "destructive",
            title: "Location not found",
            description: "The requested location could not be found.",
          })
          router.push("/list")
          return
        }

        setLocation(data)
      } catch (error) {
        console.error("Error fetching location:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load location details.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLocation()
  }, [user, params.id, router, toast])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this location?")) return

    try {
      const { error } = await supabase.from("locations").delete().eq("id", location?.id).eq("user_id", user?.id)

      if (error) throw error

      toast({
        title: "Location deleted",
        description: "The location has been successfully deleted.",
      })
      router.push("/list")
    } catch (error) {
      console.error("Error deleting location:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete location.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!location) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/list">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/locations/${location.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{location.name}</span>
            <div className="flex items-center text-yellow-500">
              <Star className="h-5 w-5 fill-current" />
              <span className="ml-1 text-lg">{location.rating}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{location.address}</span>
            </div>

            {location.visit_history && location.visit_history.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Visit History</span>
                </div>
                <div className="space-y-2">
                  {location.visit_history.map((visit, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{format(new Date(visit.date), "MMMM d, yyyy")}</div>
                      {visit.notes && <div className="text-muted-foreground mt-1">{visit.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {location.tags && location.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {location.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {location.notes && (
              <div className="prose prose-sm max-w-none">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <div className="whitespace-pre-wrap">{location.notes}</div>
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoaded && location ? (
                <GoogleMap
                  mapContainerStyle={{
                    width: "100%",
                    height: "300px",
                  }}
                  center={{
                    lat: location.latitude,
                    lng: location.longitude,
                  }}
                  zoom={15}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                >
                  <Marker
                    position={{
                      lat: location.latitude,
                      lng: location.longitude,
                    }}
                    title={location.name}
                  />
                </GoogleMap>
              ) : (
                <div>Loading Map...</div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

