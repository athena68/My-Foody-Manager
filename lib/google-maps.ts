import type { LoadScriptProps } from "@react-google-maps/api"

// Define consistent libraries array
export const GOOGLE_MAPS_LIBRARIES: LoadScriptProps["libraries"] = ["places", "maps"]

// Define consistent loader configuration
export const GOOGLE_MAPS_CONFIG = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  id: "google-maps-script", // Use a single consistent ID
  libraries: GOOGLE_MAPS_LIBRARIES,
  version: "weekly",
}

declare global {
  interface Window {
    google: any
  }
}

export const isGoogleMapsLoaded = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.google !== "undefined" &&
    typeof window.google.maps !== "undefined" &&
    typeof window.google.maps.places !== "undefined"
  )
}

