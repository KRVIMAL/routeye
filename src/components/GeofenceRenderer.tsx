import React, { useEffect, useRef } from 'react';

// Types
interface Coordinate {
  lat: number;
  lng: number;
}

interface GeofenceData {
  id: string;
  name: string;
  phoneNumber: string;
  shapeType: 'circle' | 'polygon';
  visibility: 'public' | 'private';
  coordinates: Coordinate[];
  radius?: number;
  color: string;
  perimeter: number;
  area: number;
  createdAt: string;
}

interface GeofenceRendererProps {
  map: any; // Using any to avoid Google Maps type issues
  google: any; // Using any to avoid Google Maps type issues
  geofences: GeofenceData[];
  selectedGeofence: GeofenceData | null;
  onGeofenceSelect: (geofence: GeofenceData | null) => void;
}

export const GeofenceRenderer: React.FC<GeofenceRendererProps> = ({
  map,
  google,
  geofences,
  selectedGeofence,
  onGeofenceSelect
}) => {
  const shapesRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!map || !google) return;

    // Clear existing shapes
    shapesRef.current.forEach(shape => {
      try {
        shape.setMap(null);
      } catch (error) {
        console.error('Error clearing shape:', error);
      }
    });
    shapesRef.current.clear();

    // Create new shapes
    geofences.forEach(geofence => {
      try {
        let shape: any;

        if (geofence.shapeType === 'circle' && geofence.radius) {
          shape = new google.maps.Circle({
            strokeColor: geofence.color,
            strokeOpacity: selectedGeofence?.id === geofence.id ? 1 : 0.8,
            strokeWeight: selectedGeofence?.id === geofence.id ? 3 : 2,
            fillColor: geofence.color,
            fillOpacity: selectedGeofence?.id === geofence.id ? 0.35 : 0.2,
            map: map,
            center: geofence.coordinates[0],
            radius: geofence.radius,
            clickable: true
          });
        } else {
          shape = new google.maps.Polygon({
            paths: geofence.coordinates,
            strokeColor: geofence.color,
            strokeOpacity: selectedGeofence?.id === geofence.id ? 1 : 0.8,
            strokeWeight: selectedGeofence?.id === geofence.id ? 3 : 2,
            fillColor: geofence.color,
            fillOpacity: selectedGeofence?.id === geofence.id ? 0.35 : 0.2,
            map: map,
            clickable: true
          });
        }

        // Add click listener
        google.maps.event.addListener(shape, 'click', () => {
          onGeofenceSelect(selectedGeofence?.id === geofence.id ? null : geofence);
        });

        shapesRef.current.set(geofence.id, shape);
      } catch (error) {
        console.error('Error creating geofence shape:', error);
      }
    });

    // Fit bounds to show all geofences
    if (geofences.length > 0) {
      try {
        const bounds = new google.maps.LatLngBounds();
        
        geofences.forEach(geofence => {
          if (geofence.shapeType === 'circle' && geofence.radius) {
            const center = geofence.coordinates[0];
            // Extend bounds to include circle area
            const radiusInDegrees = geofence.radius / 111320; // Rough conversion
            bounds.extend({ lat: center.lat + radiusInDegrees, lng: center.lng + radiusInDegrees });
            bounds.extend({ lat: center.lat - radiusInDegrees, lng: center.lng - radiusInDegrees });
          } else {
            geofence.coordinates.forEach(coord => {
              bounds.extend(coord);
            });
          }
        });
        
        map.fitBounds(bounds);
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }

    return () => {
      // Cleanup on unmount
      shapesRef.current.forEach(shape => {
        try {
          shape.setMap(null);
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      });
      shapesRef.current.clear();
    };
  }, [map, google, geofences, selectedGeofence, onGeofenceSelect]);

  return null; // This component doesn't render anything directly
};