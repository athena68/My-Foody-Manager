"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Location } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"

export default function EditLocation() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("locations")
        .update({
          name: location.name,
          address: location.address,
          rating: location.rating,
          notes: location.notes,
          latitude: location.latitude,
          longitude: location.longitude,
          tags: location.tags,
        })
        .eq("id", location.id)
        .eq("user_id", user?.id)

      if (error) throw error

      toast({
        title: "Location updated",
        description: "Your changes have been saved successfully.",
      })
      router.push(`/locations/${location.id}`)
    } catch (error) {
      console.error("Error updating location:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update location.",
      })
    } finally {
      setSaving(false)
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
          <Link href={`/locations/${location.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Location</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={location.name}
                  onChange={(e) => setLocation({ ...location, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={location.address}
                  onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={location.rating}
                  onChange={(e) => setLocation({ ...location, rating: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={location.notes}
                  onChange={(e) => setLocation({ ...location, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label>Location</Label>
                <Card>
                  <CardContent className="p-0">
                    {isLoaded ? (
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
                        onClick={(e) => {
                          if (e.latLng) {
                            setLocation({
                              ...location,
                              latitude: e.latLng.lat(),
                              longitude: e.latLng.lng(),
                            })
                          }
                        }}
                      >
                        <Marker
                          position={{
                            lat: location.latitude,
                            lng: location.longitude,
                          }}
                          draggable={true}
                          onDragEnd={(e) => {
                            if (e.latLng) {
                              setLocation({
                                ...location,
                                latitude: e.latLng.lat(),
                                longitude: e.latLng.lng(),
                              })
                            }
                          }}
                        />
                      </GoogleMap>
                    ) : (
                      <div>Loading Map...</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/locations/${location.id}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

