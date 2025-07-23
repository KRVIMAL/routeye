// hooks/useGoogleMaps.ts - Enhanced version to match working monitoring code
import { useState, useEffect, useRef, RefObject } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface UseGoogleMapsReturn {
  google: typeof google | null;
  map: google.maps.Map | null;
  isLoaded: boolean;
  error: Error | null;
}

export const useGoogleMaps = (
  mapRef: RefObject<HTMLDivElement | null>,
  defaultCenter = { lat: 20.5937, lng: 78.9629 },
  defaultZoom = 12
): UseGoogleMapsReturn => {
  const [google, setGoogle] = useState<typeof window.google | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use a ref to track initialization status
  const initialized = useRef(false);
  
  // Load Google Maps API - run only once
  useEffect(() => {
    if (initialized.current || !API_KEY) {
      if (!API_KEY) {
        setError(new Error("Google Maps API key is not configured"));
      }
      return;
    }
    
    initialized.current = true;
    
    const loadGoogleMaps = async () => {
      try {
        console.log("Loading Google Maps with API key:", API_KEY ? "Present" : "Missing");
        
        const loader = new Loader({
          apiKey: API_KEY,
          version: "weekly",
          libraries: ["places", "geometry"],
          // Add region and language for better performance
          region: "IN",
          language: "en",
        });
        
        const googleMaps = await loader.load();
        console.log("Google Maps loaded successfully");
        setGoogle(googleMaps);
        setIsLoaded(true);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Error loading Google Maps:", error);
        setError(error);
      }
    };
    
    loadGoogleMaps();
  }, []);
  
  // Initialize Map - separate dependency list
  useEffect(() => {
    if (!google || !isLoaded || !mapRef?.current || map) return;
    
    try {
      console.log("Initializing Google Maps instance");
      
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        // Add these options for better performance and appearance
        gestureHandling: "cooperative",
        backgroundColor: "#f5f5f5",
        clickableIcons: false,
        // Disable default UI for cleaner look (optional)
        disableDefaultUI: false,
        styles: [
          // Optional: Add custom map styling
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
      
      console.log("Map instance created successfully");
      setMap(mapInstance);
      
      // Ensure the map container has proper dimensions
      if (mapRef.current) {
        mapRef.current.style.height = "100%";
        mapRef.current.style.width = "100%";
      }
      
      // Trigger a resize after a short delay to ensure proper rendering
      setTimeout(() => {
        google.maps.event.trigger(mapInstance, 'resize');
      }, 100);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error initializing map:", error);
      setError(error);
    }
  }, [google, isLoaded, mapRef, defaultCenter, defaultZoom]);
  
  return { google, map, isLoaded, error };
};