"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"
import { GoogleMap, MarkerF } from "@react-google-maps/api"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGoogleMaps } from "@/components/maps/map-provider"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

// Common tags array
const commonTags = [
  // Drink Types
  "Coffee",
  "Tea",
  "Beer",
  "Wine",
  "Cocktails",
  "Craft Beer",
  "Local Brews",
  "Import Beer",
  "Draft Beer",
  // Food Categories
  "Breakfast",
  "Lunch",
  "Dinner",
  "Brunch",
  "Bar Food",
  "Pub Grub",
  "Snacks",
  // Establishment Types
  "Cafe",
  "Restaurant",
  "Bakery",
  "Brewery",
  "Brewpub",
  "Sports Bar",
  "Wine Bar",
  "Gastropub",
  "Beer Garden",
  "Taproom",
  // Food Types
  "Dessert",
  "Pizza",
  "Burgers",
  "Wings",
  "BBQ",
  // Dietary
  "Vegan",
  "Vegetarian",
  "Gluten-free",
  // Amenities
  "Pet-friendly",
  "Wi-Fi",
  "Outdoor seating",
  "Live Music",
  "Sports TV",
  "Pool Table",
  "Darts",
  "Board Games",
  "Trivia Night",
  "Happy Hour",
  // Atmosphere
  "Casual",
  "Upscale",
  "Dive Bar",
  "Family-friendly",
  "Quiet",
  "Lively",
]

const mapContainerStyle = {
  width: "100%",
  height: "400px",
}

const defaultCenter = {
  lat: 21.0278, // Latitude for Hanoi
  lng: 105.8342, // Longitude for Hanoi
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default function AddLocation() {
  const router = useRouter()
  const { user, signIn } = useAuth()
  const { isLoaded: isGoogleMapsLoaded, loadError } = useGoogleMaps()
  const [isServicesInitialized, setIsServicesInitialized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mapRef = useRef<google.maps.Map | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: defaultCenter.lat,
    longitude: defaultCenter.lng,
    rating: 5,
    notes: "",
    tags: [] as string[],
  })
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!isGoogleMapsLoaded || isServicesInitialized) return

    try {
      // Create a hidden div for the map
      const mapDiv = document.createElement("div")
      mapDiv.style.display = "none"
      document.body.appendChild(mapDiv)

      // Initialize map
      const map = new window.google.maps.Map(mapDiv, {
        center: { lat: defaultCenter.lat, lng: defaultCenter.lng },
        zoom: 13,
      })

      // Store map reference
      mapRef.current = map

      // Initialize services
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
      placesServiceRef.current = new window.google.maps.places.PlacesService(map)

      setIsServicesInitialized(true)

      return () => {
        if (mapDiv.parentNode) {
          mapDiv.parentNode.removeChild(mapDiv)
        }
      }
    } catch (error) {
      console.error("Error initializing Google Maps services:", error)
    }
  }, [isGoogleMapsLoaded, isServicesInitialized])

  // Add auth check effect
  useEffect(() => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to add a location.",
        action: (
          <ToastAction altText="Sign in" onClick={signIn}>
            Sign in
          </ToastAction>
        ),
      })
    }
  }, [user, signIn, toast])

  const getPlaceDetails = (placeId: string) => {
    if (!placesServiceRef.current) return

    const request = {
      placeId,
      fields: [
        "name",
        "formatted_address",
        "geometry",
        "place_id",
        "types",
        "rating",
        "international_phone_number",
        "website",
        "opening_hours",
        "price_level",
      ],
    }

    placesServiceRef.current.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        // Automatically set relevant tags based on place types
        const placeTypes = place.types || []
        const relevantTags = placeTypes
          .map((type) => {
            switch (type) {
              case "restaurant":
                return "Restaurant"
              case "cafe":
                return "Cafe"
              case "bar":
                return "Bar"
              case "bakery":
                return "Bakery"
              case "food":
                return "Restaurant"
              default:
                return null
            }
          })
          .filter(Boolean) as string[]

        // Update form data with place details
        setFormData({
          ...formData,
          name: place.name || formData.name,
          address: place.formatted_address || formData.address,
          latitude: place.geometry?.location?.lat() || formData.latitude,
          longitude: place.geometry?.location?.lng() || formData.longitude,
          rating: place.rating || formData.rating,
          tags: Array.from(new Set([...formData.tags, ...relevantTags])),
          notes:
            formData.notes +
            (place.international_phone_number ? `\nPhone: ${place.international_phone_number}` : "") +
            (place.website ? `\nWebsite: ${place.website}` : ""),
        })
      }
    })
  }

  const handleAddressChange = async (value: string) => {
    setFormData({ ...formData, address: value })
    setIsSearching(true)
    setShowSuggestions(true)

    if (!value.trim() || !autocompleteServiceRef.current) {
      setPredictions([])
      setIsSearching(false)
      return
    }

    try {
      const request = {
        input: value,
        types: ["establishment"],
        locationBias: {
          center: {
            lat: formData.latitude,
            lng: formData.longitude,
          },
          radius: 50000, // 50km radius
        },
      }

      autocompleteServiceRef.current.getPlacePredictions(
        request,
        (predictions: google.maps.places.AutocompletePrediction[] | null, status) => {
          setIsSearching(false)
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions)
          } else {
            setPredictions([])
          }
        },
      )
    } catch (error) {
      console.error("Error fetching predictions:", error)
      setIsSearching(false)
    }
  }

  const debouncedHandleAddressChange = useCallback(
    debounce((value: string) => handleAddressChange(value), 300),
    [],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to add a location.",
        action: (
          <ToastAction altText="Sign in" onClick={signIn}>
            Sign in
          </ToastAction>
        ),
      })
      return
    }

    // Validate required fields
    if (!formData.name.trim() || !formData.address.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("locations")
        .insert([
          {
            ...formData,
            user_id: user.id,
            photos: [],
            visit_history: [
              {
                date: new Date().toISOString(),
                notes: "Initial visit",
              },
            ],
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "Location added successfully!",
        description: "Your new location has been saved.",
      })

      // Wait a bit for the toast to be visible before redirecting
      setTimeout(() => {
        router.push("/list")
      }, 1000)
    } catch (error) {
      console.error("Error adding location:", error)
      toast({
        variant: "destructive",
        title: "Failed to add location",
        description: "There was an error saving your location. Please try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isGoogleMapsLoaded || !isServicesInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-destructive">
          <p>Error loading Google Maps</p>
          <p className="text-sm">{loadError.message}</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <div className="relative">
            <Input
              id="address"
              required
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value })
                debouncedHandleAddressChange(e.target.value)
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Start typing to search for places..."
              className="w-full"
            />
            {(isSearching || predictions.length > 0) && showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground shadow-md rounded-md border">
                <div className="p-2">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : predictions.length > 0 ? (
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {predictions.map((prediction) => (
                            <CommandItem
                              key={prediction.place_id}
                              onSelect={() => {
                                getPlaceDetails(prediction.place_id)
                                setShowSuggestions(false)
                                setPredictions([])
                              }}
                              className="cursor-pointer"
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              <div className="flex flex-col">
                                <span className="font-medium">{prediction.structured_formatting.main_text}</span>
                                <span className="text-sm text-muted-foreground">
                                  {prediction.structured_formatting.secondary_text}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  ) : (
                    <div className="py-2 px-3 text-sm text-muted-foreground">No results found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Location</Label>
          <Card>
            <CardContent className="p-0">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{ lat: formData.latitude, lng: formData.longitude }}
                zoom={13}
                onClick={(e: google.maps.MapMouseEvent) => {
                  if (e.latLng) {
                    setFormData({
                      ...formData,
                      latitude: e.latLng.lat(),
                      longitude: e.latLng.lng(),
                    })
                  }
                }}
              >
                <MarkerF
                  position={{ lat: formData.latitude, lng: formData.longitude }}
                  draggable
                  onDragEnd={(e: google.maps.MapMouseEvent) => {
                    if (e.latLng) {
                      setFormData({
                        ...formData,
                        latitude: e.latLng.lat(),
                        longitude: e.latLng.lng(),
                      })
                    }
                  }}
                />
              </GoogleMap>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input
            id="rating"
            type="number"
            min="1"
            max="5"
            required
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn("w-full justify-between", formData.tags.length > 0 ? "h-full" : "")}
              >
                {formData.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <div key={tag} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                        {tag}
                      </div>
                    ))}
                  </div>
                ) : (
                  "Select tags..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList>
                  <CommandEmpty>No tag found.</CommandEmpty>
                  <CommandGroup heading="Drink Types">
                    {commonTags.slice(0, 9).map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.includes(tag)
                              ? formData.tags.filter((t) => t !== tag)
                              : [...formData.tags, tag],
                          })
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", formData.tags.includes(tag) ? "opacity-100" : "opacity-0")}
                        />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Food">
                    {commonTags.slice(9, 16).map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.includes(tag)
                              ? formData.tags.filter((t) => t !== tag)
                              : [...formData.tags, tag],
                          })
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", formData.tags.includes(tag) ? "opacity-100" : "opacity-0")}
                        />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Establishment Type">
                    {commonTags.slice(16, 26).map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.includes(tag)
                              ? formData.tags.filter((t) => t !== tag)
                              : [...formData.tags, tag],
                          })
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", formData.tags.includes(tag) ? "opacity-100" : "opacity-0")}
                        />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Food Types">
                    {commonTags.slice(26, 31).map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.includes(tag)
                              ? formData.tags.filter((t) => t !== tag)
                              : [...formData.tags, tag],
                          })
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", formData.tags.includes(tag) ? "opacity-100" : "opacity-0")}
                        />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Dietary">
                    {commonTags.slice(31, 34).map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.includes(tag)
                              ? formData.tags.filter((t) => t !== tag)
                              : [...formData.tags, tag],
                          })
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", formData.tags.includes(tag) ? "opacity-100" : "opacity-0")}
                        />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Amenities">
                    {commonTags.slice(34, 44).map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.includes(tag)
                              ? formData.tags.filter((t) => t !== tag)
                              : [...formData.tags, tag],
                          })
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", formData.tags.includes(tag) ? "opacity-100" : "opacity-0")}
                        />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandGroup heading="Atmosphere">
                    {commonTags.slice(44).map((tag) => (
                      <CommandItem
                        key={tag}
                        onSelect={() => {
                          setFormData({
                            ...formData,
                            tags: formData.tags.includes(tag)
                              ? formData.tags.filter((t) => t !== tag)
                              : [...formData.tags, tag],
                          })
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", formData.tags.includes(tag) ? "opacity-100" : "opacity-0")}
                        />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Location
      </Button>
    </form>
  )
}

