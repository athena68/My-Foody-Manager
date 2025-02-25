"use client"

if (process.env.NODE_ENV === "development") {
  const originalError = console.error
  console.error = (...args) => {
    if (/ResizeObserver/.test(args[0])) return
    originalError.call(console, ...args)
  }
}

import { useEffect, useState, useMemo, useCallback } from "react"
import { GoogleMap, Marker } from "@react-google-maps/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Navigation } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Location } from "@/lib/types"
import { useGoogleMaps } from "@/components/maps/map-provider"

// Define types for map container
interface MapContainerProps {
  style: { width: string; height: string }
}

const MapContainer = ({ style }: MapContainerProps) => (
  <div style={style} className="relative rounded-md overflow-hidden" />
)

// Memoize static values
const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 8rem)",
}

const defaultCenter = {
  lat: 21.0278,
  lng: 105.8342,
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  gestureHandling: "cooperative",
}

export default function MapView() {
  const { user } = useAuth()
  const { isLoaded, loadError } = useGoogleMaps()
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [center, setCenter] = useState(defaultCenter)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null)
  const [isMapMounted, setIsMapMounted] = useState(false)

  // Fetch locations
  useEffect(() => {
    if (user) {
      const fetchLocations = async () => {
        const { data, error } = await supabase.from("locations").select("*").eq("user_id", user.id)
        if (data && !error) {
          setLocations(data)
        }
      }
      fetchLocations()
    }
  }, [user])

  // Handle map mounting
  useEffect(() => {
    setIsMapMounted(true)
    return () => setIsMapMounted(false)
  }, [])

  // Create info window instance
  useEffect(() => {
    if (isLoaded && !infoWindow && window.google) {
      setInfoWindow(new window.google.maps.InfoWindow())
    }
  }, [isLoaded, infoWindow])

  // Memoize filtered locations
  const filteredLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.address.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [locations, searchQuery],
  )

  // Memoize map callbacks
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleMarkerClick = useCallback(
    (location: Location) => {
      if (!map || !infoWindow) return

      const content = `
        <div class="p-2">
          <h3 class="font-semibold">${location.name}</h3>
          <p class="text-sm text-muted-foreground">${location.address}</p>
          <div class="mt-2">
            <a href="/locations/${location.id}" class="inline-block px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              View Details
            </a>
          </div>
        </div>
      `

      infoWindow.setContent(content)
      infoWindow.close()
      const markerPosition = new google.maps.LatLng(location.latitude, location.longitude)
      infoWindow.setPosition(markerPosition)
      infoWindow.open(map)
      setSelectedLocation(location)
    },
    [map, infoWindow],
  )

  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCenter(newCenter)
          map?.panTo(newCenter)
        },
        (error) => {
          console.error("Error getting user location:", error)
        },
      )
    }
  }, [map])

  if (loadError) return <div>Error loading Maps</div>
  if (!isLoaded) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon" onClick={getUserLocation}>
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isMapMounted && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
              options={mapOptions}
              onLoad={onMapLoad}
              onUnmount={onUnmount}
            >
              {filteredLocations.map((location) => (
                <Marker
                  key={location.id}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  title={location.name}
                  onClick={() => handleMarkerClick(location)}
                />
              ))}
            </GoogleMap>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

