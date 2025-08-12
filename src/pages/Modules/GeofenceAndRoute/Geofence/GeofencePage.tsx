import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FiPlus, 
  FiSearch, 
  FiMapPin, 
  FiCircle, 
  FiEdit3, 
  FiTrash2, 
  FiChevronDown, 
  FiChevronUp,
  FiTarget,
  FiMove,
  FiRotateCw
} from 'react-icons/fi';

// Types
export interface Coordinate {
  lat: number;
  lng: number;
}

export interface GeofenceData {
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

// Mock data
const mockGeofences: GeofenceData[] = [
  {
    id: '1',
    name: 'Rohini',
    phoneNumber: '9876543210',
    shapeType: 'circle',
    visibility: 'public',
    coordinates: [{ lat: 28.7041, lng: 77.1025 }],
    radius: 1000,
    color: '#2563EB',
    perimeter: 6283.19,
    area: 3141592.65,
    createdAt: '12-03-2024 13:14:02'
  },
  {
    id: '2',
    name: 'Anil',
    phoneNumber: '9876543211',
    shapeType: 'polygon',
    visibility: 'private',
    coordinates: [
      { lat: 28.6891537, lng: 77.006241 },
      { lat: 28.689767, lng: 77.066751 },
      { lat: 28.686612, lng: 77.066751 },
      { lat: 28.686612, lng: 77.000834 }
    ],
    color: '#DC2626',
    perimeter: 13390,
    area: 10193000,
    createdAt: '15-04-2024 08:45:22'
  },
  {
    id: '3',
    name: 'Priya',
    phoneNumber: '9876543212',
    shapeType: 'circle',
    visibility: 'public',
    coordinates: [{ lat: 28.7041, lng: 77.1025 }],
    radius: 500,
    color: '#F59E0B',
    perimeter: 3141.59,
    area: 785398.16,
    createdAt: '20-05-2024 16:30:11'
  }
];

// Hook for Google Maps (simplified for demo)
const useGoogleMaps = (mapRef: React.RefObject<HTMLDivElement>, defaultCenter = { lat: 28.7041, lng: 77.1025 }, defaultZoom = 12) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [google, setGoogle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('useGoogleMaps: Starting initialization');
    console.log('API Key present:', !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
    
    // Check if Google Maps is already loaded
    if ((window as any).google && (window as any).google.maps) {
      console.log('Google Maps already loaded');
      setGoogle((window as any).google);
      setIsLoaded(true);
      return;
    }

    // Check for API key
    if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not found');
      setError('Google Maps API key not configured');
      return;
    }

    // Simulate loading delay and then try to initialize
    const initTimeout = setTimeout(() => {
      try {
        // Try to load Google Maps API
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log('Google Maps script loaded');
          if ((window as any).google && (window as any).google.maps) {
            setGoogle((window as any).google);
            setIsLoaded(true);
          } else {
            setError('Google Maps failed to initialize');
          }
        };
        
        script.onerror = () => {
          console.error('Failed to load Google Maps script');
          setError('Failed to load Google Maps');
        };
        
        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Error loading Google Maps');
      }
    }, 1000);

    return () => {
      clearTimeout(initTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !google || !mapRef.current || map) return;

    console.log('Creating Google Maps instance');
    
    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: "cooperative",
        backgroundColor: "#f5f5f5",
        clickableIcons: false,
      });
      
      console.log('Google Maps instance created successfully');
      setMap(mapInstance);
      
      // Trigger resize after a short delay
      setTimeout(() => {
        google.maps.event.trigger(mapInstance, 'resize');
      }, 100);
      
    } catch (err) {
      console.error('Error creating map instance:', err);
      setError('Error creating map instance');
    }
  }, [isLoaded, google, mapRef.current, defaultCenter, defaultZoom]);
  
  return { google, map, isLoaded, error };
};

const GeofencePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geofences' | 'routes'>('geofences');
  const [geofences, setGeofences] = useState<GeofenceData[]>(mockGeofences);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGeofence, setSelectedGeofence] = useState<GeofenceData | null>(null);
  const [showGeofenceList, setShowGeofenceList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShapeTypeSelector, setShowShapeTypeSelector] = useState(false);
  const [selectedShapeType, setSelectedShapeType] = useState<'circle' | 'polygon'>('circle');
  const [isCreatingGeofence, setIsCreatingGeofence] = useState(false);
  const [newGeofence, setNewGeofence] = useState<Partial<GeofenceData>>({
    name: '',
    phoneNumber: '',
    visibility: 'public',
    coordinates: [],
    radius: 100,
    color: '#2563EB'
  });
  
  const mapRef:any = useRef<HTMLDivElement>(null);
  const { google, map, isLoaded } = useGoogleMaps(mapRef);

  // Log initial state for debugging
  useEffect(() => {
    console.log('Initial geofences loaded:', mockGeofences.length);
    console.log('Geofences:', mockGeofences);
  }, []);

  // Filter geofences based on search
  const filteredGeofences = geofences.filter(geofence =>
    geofence.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    geofence.phoneNumber.includes(searchQuery)
  );

  // Group geofences by shape type
  const groupedGeofences = filteredGeofences.reduce((acc, geofence) => {
    if (!acc[geofence.shapeType]) {
      acc[geofence.shapeType] = [];
    }
    acc[geofence.shapeType].push(geofence);
    return acc;
  }, {} as Record<string, GeofenceData[]>);

  // Render shapes on map when Google Maps is loaded
  useEffect(() => {
    if (!map || !google || !isLoaded) return;

    console.log('Rendering geofences on map:', filteredGeofences.length);

    // Clear existing shapes
    const existingShapes = (window as any).geofenceShapes || [];
    existingShapes.forEach((shape: any) => {
      try {
        shape.setMap(null);
      } catch (error) {
        console.error('Error clearing shape:', error);
      }
    });

    // Create new shapes
    const newShapes: any[] = [];

    filteredGeofences.forEach(geofence => {
      try {
        let shape: any;

        if (geofence.shapeType === 'circle' && geofence.radius) {
          console.log('Creating circle:', geofence.name, geofence.coordinates[0], geofence.radius);
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
        } else if (geofence.coordinates.length > 2) {
          console.log('Creating polygon:', geofence.name, geofence.coordinates);
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

        if (shape) {
          // Add click listener
          google.maps.event.addListener(shape, 'click', () => {
            console.log('Geofence clicked:', geofence.name);
            setSelectedGeofence(selectedGeofence?.id === geofence.id ? null : geofence);
          });

          newShapes.push(shape);
        }
      } catch (error) {
        console.error('Error creating geofence shape:', error);
      }
    });

    // Store shapes globally for cleanup
    (window as any).geofenceShapes = newShapes;

    // Fit bounds to show all geofences
    if (filteredGeofences.length > 0 && newShapes.length > 0) {
      try {
        const bounds = new google.maps.LatLngBounds();
        
        filteredGeofences.forEach(geofence => {
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
        console.log('Map bounds fitted to show all geofences');
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [map, google, isLoaded, filteredGeofences, selectedGeofence]);

  const handleCreateGeofence = () => {
    setShowCreateModal(true);
    setShowShapeTypeSelector(true);
  };

  const handleShapeTypeSelect = (type: 'circle' | 'polygon') => {
    setSelectedShapeType(type);
    setShowShapeTypeSelector(false);
    setIsCreatingGeofence(true);
    
    // Create default shape with proper coordinates
    const defaultCenter = { lat: 28.7041, lng: 77.1025 }; // Delhi coordinates
    
    if (type === 'circle') {
      setNewGeofence(prev => ({
        ...prev,
        shapeType: 'circle',
        coordinates: [defaultCenter],
        radius: 1000
      }));
    } else {
      // Create a square polygon around the default center
      const offset = 0.005; // roughly 500m
      setNewGeofence(prev => ({
        ...prev,
        shapeType: 'polygon',
        coordinates: [
          { lat: defaultCenter.lat + offset, lng: defaultCenter.lng + offset },
          { lat: defaultCenter.lat + offset, lng: defaultCenter.lng - offset },
          { lat: defaultCenter.lat - offset, lng: defaultCenter.lng - offset },
          { lat: defaultCenter.lat - offset, lng: defaultCenter.lng + offset }
        ]
      }));
    }
  };

  const handleCoordinateChange = (index: number, field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setNewGeofence(prev => ({
      ...prev,
      coordinates: prev.coordinates?.map((coord, i) => 
        i === index ? { ...coord, [field]: numValue } : coord
      ) || []
    }));
  };

  const calculatePerimeter = (coords: Coordinate[], shapeType: 'circle' | 'polygon', radius?: number) => {
    if (shapeType === 'circle' && radius) {
      return 2 * Math.PI * radius;
    }
    // Simplified polygon perimeter calculation
    return coords.length * 1000; // Mock calculation
  };

  const calculateArea = (coords: Coordinate[], shapeType: 'circle' | 'polygon', radius?: number) => {
    if (shapeType === 'circle' && radius) {
      return Math.PI * radius * radius;
    }
    // Simplified polygon area calculation
    return coords.length * 500000; // Mock calculation
  };

  const handleSaveGeofence = () => {
    if (!newGeofence.name || !newGeofence.phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const perimeter = calculatePerimeter(
      newGeofence.coordinates || [], 
      newGeofence.shapeType as 'circle' | 'polygon', 
      newGeofence.radius
    );
    const area = calculateArea(
      newGeofence.coordinates || [], 
      newGeofence.shapeType as 'circle' | 'polygon', 
      newGeofence.radius
    );
    
    const geofence: GeofenceData = {
      id: Date.now().toString(),
      name: newGeofence.name,
      phoneNumber: newGeofence.phoneNumber,
      shapeType: newGeofence.shapeType as 'circle' | 'polygon',
      visibility: newGeofence.visibility as 'public' | 'private',
      coordinates: newGeofence.coordinates || [],
      radius: newGeofence.radius,
      color: newGeofence.color || '#2563EB',
      perimeter,
      area,
      createdAt: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-')
    };
    
    console.log('Creating new geofence:', geofence);
    
    setGeofences(prev => {
      const updated = [...prev, geofence];
      console.log('Updated geofences list:', updated);
      return updated;
    });
    
    // Close modal and reset form
    setShowCreateModal(false);
    setIsCreatingGeofence(false);
    setShowShapeTypeSelector(false);
    setNewGeofence({
      name: '',
      phoneNumber: '',
      visibility: 'public',
      coordinates: [],
      radius: 100,
      color: '#2563EB'
    });

    // Select the newly created geofence
    setTimeout(() => {
      setSelectedGeofence(geofence);
    }, 100);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setNewGeofence(prev => ({
            ...prev,
            coordinates: [{ lat: latitude, lng: longitude }]
          }));
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Map Header with Tabs */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-white rounded-lg shadow-sm p-2">
          <div className="flex items-center space-x-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('geofences')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'geofences'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Geofences
              </button>
              <button
                onClick={() => setActiveTab('routes')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'routes'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Routes
              </button>
            </div>
          </div>

          {/* Search and Create Button */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleCurrentLocation}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                title="Use current location"
              >
                <FiTarget className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <button
              onClick={handleCreateGeofence}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Geofence</span>
            </button>
          </div>
        </div>

        {/* Map */}
        <div ref={mapRef} className="w-full h-full bg-gray-200 flex items-center justify-center">
          {!isLoaded ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading Google Maps...</p>
              <p className="text-xs text-gray-500 mt-1">
                {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'No API key found' : 'Initializing...'}
              </p>
            </div>
          ) : !map ? (
            <div className="text-center">
              <FiMapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Initializing map...</p>
            </div>
          ) : (
            // Map is loaded, show status
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm p-3 z-10">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  Map loaded • {filteredGeofences.length} geofences
                </span>
              </div>
              {filteredGeofences.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Create your first geofence to see it on the map
                </p>
              )}
            </div>
          )}
          
          {/* Fallback visual representation when map is not loaded */}
          {!isLoaded && filteredGeofences.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FiMapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading map with {filteredGeofences.length} geofences</p>
                <div className="mt-4 flex justify-center space-x-4">
                  {/* Simulated shapes as placeholders */}
                  {filteredGeofences.slice(0, 3).map((geofence, index) => (
                    <div
                      key={geofence.id}
                      className={`w-16 h-16 border-4 bg-opacity-20 opacity-60 ${
                        geofence.shapeType === 'circle' ? 'rounded-full' : 'transform rotate-45'
                      }`}
                      style={{ 
                        borderColor: geofence.color, 
                        backgroundColor: geofence.color 
                      }}
                      title={geofence.name}
                    ></div>
                  ))}
                  {filteredGeofences.length > 3 && (
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-500">+{filteredGeofences.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Geofence List Panel */}
      {activeTab === 'geofences' && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Geofence List</h2>
              <button
                onClick={() => setShowGeofenceList(!showGeofenceList)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {showGeofenceList ? (
                  <FiChevronUp className="w-4 h-4 text-gray-600" />
                ) : (
                  <FiChevronDown className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
            <div className="mt-2 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for geofences"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Geofence List */}
          {showGeofenceList && (
            <div className="flex-1 overflow-y-auto">
              {Object.entries(groupedGeofences).map(([shapeType, geofenceList]) => (
                <div key={shapeType} className="border-b border-gray-100">
                  <div className="p-3 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700 capitalize flex items-center">
                      {shapeType === 'circle' ? (
                        <FiCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <FiEdit3 className="w-4 h-4 mr-2" />
                      )}
                      {shapeType} ({geofenceList.length})
                    </h3>
                  </div>
                  <div className="space-y-1">
                    {geofenceList.map((geofence) => (
                      <div
                        key={geofence.id}
                        onClick={() => setSelectedGeofence(geofence)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedGeofence?.id === geofence.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full border-2"
                              style={{ backgroundColor: geofence.color, borderColor: geofence.color }}
                            ></div>
                            <div>
                              <h4 className="font-medium text-gray-900">{geofence.name}</h4>
                              <p className="text-sm text-gray-500">{geofence.phoneNumber}</p>
                              <p className="text-xs text-gray-400">{geofence.createdAt}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <FiEdit3 className="w-3 h-3 text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <FiTrash2 className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                        
                        {selectedGeofence?.id === geofence.id && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex justify-between">
                                <span>Perimeter:</span>
                                <span>{(geofence.perimeter / 1000).toFixed(2)} km</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Area:</span>
                                <span>{(geofence.area / 1000000).toFixed(3)} km²</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Vertices:</span>
                                <span>{geofence.coordinates.length}</span>
                              </div>
                            </div>
                            
                            {/* Coordinates Display */}
                            <div className="mt-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Detail coordinates</h5>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {geofence.coordinates.map((coord, index) => (
                                  <div key={index} className="flex items-center space-x-2 text-xs">
                                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                                      <span className="text-gray-600">{index + 1}</span>
                                    </div>
                                    <input
                                      type="text"
                                      value={coord.lat.toFixed(6)}
                                      readOnly
                                      className="flex-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                                    />
                                    <input
                                      type="text"
                                      value={coord.lng.toFixed(6)}
                                      readOnly
                                      className="flex-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {filteredGeofences.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <FiMapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No geofences found</p>
                  <p className="text-sm mt-1">Create your first geofence to get started</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Geofence Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {showShapeTypeSelector ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Create Geofence</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => handleShapeTypeSelect('circle')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <FiCircle className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Circle</h4>
                        <p className="text-sm text-gray-500">Create a circular geofence</p>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleShapeTypeSelect('polygon')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <FiEdit3 className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Polygon</h4>
                        <p className="text-sm text-gray-500">Create a custom polygon geofence</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Create {selectedShapeType === 'circle' ? 'Circle' : 'Polygon'} Geofence
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowShapeTypeSelector(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                    >
                      <FiRotateCw className="w-4 h-4" />
                      <span>Change type</span>
                    </button>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                    <input
                      type="text"
                      value={newGeofence.name || ''}
                      onChange={(e) => setNewGeofence(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Geofence Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                    <input
                      type="text"
                      value={newGeofence.phoneNumber || ''}
                      onChange={(e) => setNewGeofence(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Phone Number"
                    />
                  </div>
                  
                  {/* Visibility Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visibility Settings*</label>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => setNewGeofence(prev => ({ ...prev, visibility: 'public' }))}
                        className={`px-4 py-2 rounded-lg border ${
                          newGeofence.visibility === 'public'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        Public
                      </button>
                      <button
                        onClick={() => setNewGeofence(prev => ({ ...prev, visibility: 'private' }))}
                        className={`px-4 py-2 rounded-lg border ${
                          newGeofence.visibility === 'private'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        Private
                      </button>
                    </div>
                  </div>
                  
                  {/* Circle-specific fields */}
                  {selectedShapeType === 'circle' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Radius*</label>
                        <input
                          type="number"
                          value={newGeofence.radius || ''}
                          onChange={(e) => setNewGeofence(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="100"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude*</label>
                          <input
                            type="number"
                            step="any"
                            value={newGeofence.coordinates?.[0]?.lat || ''}
                            onChange={(e) => setNewGeofence(prev => ({
                              ...prev,
                              coordinates: [{ 
                                lat: parseFloat(e.target.value) || 0, 
                                lng: prev.coordinates?.[0]?.lng || 0 
                              }]
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="28.7041"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude*</label>
                          <input
                            type="number"
                            step="any"
                            value={newGeofence.coordinates?.[0]?.lng || ''}
                            onChange={(e) => setNewGeofence(prev => ({
                              ...prev,
                              coordinates: [{ 
                                lat: prev.coordinates?.[0]?.lat || 0,
                                lng: parseFloat(e.target.value) || 0
                              }]
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="77.1025"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Polygon-specific fields */}
                  {selectedShapeType === 'polygon' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Coordinates</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {newGeofence.coordinates?.map((coord, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-600">{index + 1}</span>
                            </div>
                            <input
                              type="number"
                              step="any"
                              value={coord.lat}
                              onChange={(e) => handleCoordinateChange(index, 'lat', e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                              placeholder="Latitude"
                            />
                            <input
                              type="number"
                              step="any"
                              value={coord.lng}
                              onChange={(e) => handleCoordinateChange(index, 'lng', e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                              placeholder="Longitude"
                            />
                          </div>
                        )) || []}
                      </div>
                    </div>
                  )}
                  
                  {/* Color picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Set Color (Optional)</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={newGeofence.color || '#2563EB'}
                        onChange={(e) => setNewGeofence(prev => ({ ...prev, color: e.target.value }))}
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newGeofence.color || '#2563EB'}
                        onChange={(e) => setNewGeofence(prev => ({ ...prev, color: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#2563EB"
                      />
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleSaveGeofence}
                      disabled={!newGeofence.name || !newGeofence.phoneNumber}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeofencePage;