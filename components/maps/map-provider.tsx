"use client"

import React from "react"
import { useLoadScript } from "@react-google-maps/api"
import { createContext, useContext, useState, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { GOOGLE_MAPS_CONFIG } from "@/lib/google-maps"

interface MapContextType {
  isLoaded: boolean
  loadError: Error | null
}

const MapContext = createContext<MapContextType>({
  isLoaded: false,
  loadError: null,
})

export const useGoogleMaps = () => useContext(MapContext)

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [loadError, setLoadError] = useState<Error | null>(null)

  const { isLoaded, loadError: scriptLoadError } = useLoadScript(GOOGLE_MAPS_CONFIG)

  const handleScriptLoad = useCallback(() => {
    if (scriptLoadError) {
      setLoadError(scriptLoadError)
    }
  }, [scriptLoadError])

  React.useEffect(() => {
    handleScriptLoad()
  }, [handleScriptLoad])

  if (!isLoaded) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading maps...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-center text-destructive">
          <p className="font-semibold">Error loading Google Maps</p>
          <p className="text-sm">{loadError.message}</p>
        </div>
      </div>
    )
  }

  return <MapContext.Provider value={{ isLoaded, loadError }}>{children}</MapContext.Provider>
}

