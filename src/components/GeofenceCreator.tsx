import React, { useState, useEffect, useRef } from 'react';
import { 
  FiCircle, 
  FiEdit3, 
  FiRotateCw, 
  FiTarget,
  FiMove,
  FiRefreshCw
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

interface GeofenceCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGeofence: (geofence: GeofenceData) => void;
  map: any; // Using any for now to avoid Google Maps type issues
  google: any; // Using any for now to avoid Google Maps type issues
  defaultLocation: Coordinate;
}

export const GeofenceCreator: React.FC<GeofenceCreatorProps> = ({
  isOpen,
  onClose,
  onCreateGeofence,
  map,
  google,
  defaultLocation
}) => {
  const [currentStep, setCurrentStep] = useState<'select' | 'create'>('select');
  const [selectedType, setSelectedType] = useState<'circle' | 'polygon'>('circle');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    visibility: 'public' as 'public' | 'private',
    color: '#2563EB'
  });

  const [circleData, setCircleData] = useState({
    center: defaultLocation,
    radius: 1000
  });

  const [polygonData, setPolygonData] = useState<Coordinate[]>([
    { lat: defaultLocation.lat + 0.001, lng: defaultLocation.lng + 0.001 },
    { lat: defaultLocation.lat + 0.001, lng: defaultLocation.lng - 0.001 },
    { lat: defaultLocation.lat - 0.001, lng: defaultLocation.lng - 0.001 },
    { lat: defaultLocation.lat - 0.001, lng: defaultLocation.lng + 0.001 }
  ]);

  // Refs for Google Maps objects
  const circleRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const drawingManagerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !map || !google) return;

    // Initialize drawing based on selected type
    if (currentStep === 'create') {
      if (selectedType === 'circle') {
        createInteractiveCircle();
      } else {
        createInteractivePolygon();
      }
    }

    return () => {
      cleanup();
    };
  }, [isOpen, map, google, currentStep, selectedType]);

  const cleanup = () => {
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null);
      drawingManagerRef.current = null;
    }
  };

  const createInteractiveCircle = () => {
    if (!map || !google) return;

    cleanup();

    try {
      const circle = new google.maps.Circle({
        strokeColor: formData.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: formData.color,
        fillOpacity: 0.2,
        map: map,
        center: circleData.center,
        radius: circleData.radius,
        editable: true,
        draggable: true
      });

      circleRef.current = circle;

      // Listen for changes
      google.maps.event.addListener(circle, 'center_changed', () => {
        const newCenter = circle.getCenter();
        if (newCenter) {
          setCircleData(prev => ({
            ...prev,
            center: { lat: newCenter.lat(), lng: newCenter.lng() }
          }));
        }
      });

      google.maps.event.addListener(circle, 'radius_changed', () => {
        setCircleData(prev => ({
          ...prev,
          radius: circle.getRadius()
        }));
      });

      // Center map on circle
      map.setCenter(circleData.center);
      map.setZoom(15);
    } catch (error) {
      console.error('Error creating circle:', error);
    }
  };

  const createInteractivePolygon = () => {
    if (!map || !google) return;

    cleanup();

    try {
      const polygon = new google.maps.Polygon({
        paths: polygonData,
        strokeColor: formData.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: formData.color,
        fillOpacity: 0.2,
        editable: true,
        draggable: true,
        map: map
      });

      polygonRef.current = polygon;

      // Listen for path changes
      const updatePolygonData = () => {
        try {
          const path = polygon.getPath();
          const coordinates: Coordinate[] = [];
          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            coordinates.push({ lat: point.lat(), lng: point.lng() });
          }
          setPolygonData(coordinates);
        } catch (error) {
          console.error('Error updating polygon data:', error);
        }
      };

      google.maps.event.addListener(polygon.getPath(), 'set_at', updatePolygonData);
      google.maps.event.addListener(polygon.getPath(), 'insert_at', updatePolygonData);
      google.maps.event.addListener(polygon.getPath(), 'remove_at', updatePolygonData);

      // Center map on polygon
      const bounds = new google.maps.LatLngBounds();
      polygonData.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds);
    } catch (error) {
      console.error('Error creating polygon:', error);
    }
  };

  const handleTypeSelect = (type: 'circle' | 'polygon') => {
    setSelectedType(type);
    setCurrentStep('create');
  };

  const handleCoordinateChange = (index: number, field: 'lat' | 'lng', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newPolygonData = [...polygonData];
    newPolygonData[index] = { ...newPolygonData[index], [field]: numValue };
    setPolygonData(newPolygonData);

    // Update polygon on map
    if (polygonRef.current && google) {
      try {
        const path = new google.maps.MVCArray(newPolygonData);
        polygonRef.current.setPath(path);
      } catch (error) {
        console.error('Error updating polygon path:', error);
      }
    }
  };

  const calculatePerimeter = () => {
    if (selectedType === 'circle') {
      return 2 * Math.PI * circleData.radius;
    } else {
      // Simplified polygon perimeter calculation without Google Maps geometry
      let perimeter = 0;
      for (let i = 0; i < polygonData.length; i++) {
        const current = polygonData[i];
        const next = polygonData[(i + 1) % polygonData.length];
        
        // Simple distance calculation using Haversine formula approximation
        const R = 6371000; // Earth's radius in meters
        const dLat = (next.lat - current.lat) * Math.PI / 180;
        const dLng = (next.lng - current.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(current.lat * Math.PI / 180) * Math.cos(next.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        perimeter += distance;
      }
      return perimeter;
    }
  };

  const calculateArea = () => {
    if (selectedType === 'circle') {
      return Math.PI * circleData.radius * circleData.radius;
    } else {
      // Simplified polygon area calculation using shoelace formula
      if (polygonData.length < 3) return 0;
      
      let area = 0;
      for (let i = 0; i < polygonData.length; i++) {
        const j = (i + 1) % polygonData.length;
        area += polygonData[i].lat * polygonData[j].lng;
        area -= polygonData[j].lat * polygonData[i].lng;
      }
      area = Math.abs(area) / 2;
      
      // Convert from degrees to square meters (approximate)
      const metersPerDegree = 111320;
      return area * metersPerDegree * metersPerDegree;
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const perimeter = calculatePerimeter();
    const area = calculateArea();

    const geofence: GeofenceData = {
      id: Date.now().toString(),
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      shapeType: selectedType,
      visibility: formData.visibility,
      coordinates: selectedType === 'circle' ? [circleData.center] : polygonData,
      radius: selectedType === 'circle' ? circleData.radius : undefined,
      color: formData.color,
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

    onCreateGeofence(geofence);
    handleClose();
  };

  const handleClose = () => {
    cleanup();
    setCurrentStep('select');
    setFormData({
      name: '',
      phoneNumber: '',
      visibility: 'public',
      color: '#2563EB'
    });
    setCircleData({
      center: defaultLocation,
      radius: 1000
    });
    setPolygonData([
      { lat: defaultLocation.lat + 0.001, lng: defaultLocation.lng + 0.001 },
      { lat: defaultLocation.lat + 0.001, lng: defaultLocation.lng - 0.001 },
      { lat: defaultLocation.lat - 0.001, lng: defaultLocation.lng - 0.001 },
      { lat: defaultLocation.lat - 0.001, lng: defaultLocation.lng + 0.001 }
    ]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
        {currentStep === 'select' ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Geofence</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => handleTypeSelect('circle')}
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
                onClick={() => handleTypeSelect('polygon')}
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
          <div className="flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create {selectedType === 'circle' ? 'Circle' : 'Polygon'} Geofence
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentStep('select')}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                  >
                    <FiRotateCw className="w-4 h-4" />
                    <span>Change type</span>
                  </button>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Geofence Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Phone Number"
                />
              </div>
              
              {/* Visibility Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility Settings*</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.visibility === 'public'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    Public
                  </button>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                    className={`px-4 py-2 rounded-lg border ${
                      formData.visibility === 'private'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300'
                    }`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {/* Shape-specific controls */}
              {selectedType === 'circle' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Radius*</label>
                    <input
                      type="number"
                      value={Math.round(circleData.radius)}
                      onChange={(e) => {
                        const radius = parseInt(e.target.value) || 0;
                        setCircleData(prev => ({ ...prev, radius }));
                        if (circleRef.current) {
                          circleRef.current.setRadius(radius);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100"
                      min="1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude*</label>
                      <input
                        type="number"
                        step="any"
                        value={circleData.center.lat.toFixed(6)}
                        onChange={(e) => {
                          const lat = parseFloat(e.target.value) || 0;
                          const newCenter = { ...circleData.center, lat };
                          setCircleData(prev => ({ ...prev, center: newCenter }));
                          if (circleRef.current) {
                            circleRef.current.setCenter(newCenter);
                            map?.setCenter(newCenter);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude*</label>
                      <input
                        type="number"
                        step="any"
                        value={circleData.center.lng.toFixed(6)}
                        onChange={(e) => {
                          const lng = parseFloat(e.target.value) || 0;
                          const newCenter = { ...circleData.center, lng };
                          setCircleData(prev => ({ ...prev, center: newCenter }));
                          if (circleRef.current) {
                            circleRef.current.setCenter(newCenter);
                            map?.setCenter(newCenter);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coordinates</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {polygonData.map((coord, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-gray-600">{index + 1}</span>
                        </div>
                        <input
                          type="number"
                          step="any"
                          value={coord.lat.toFixed(6)}
                          onChange={(e) => handleCoordinateChange(index, 'lat', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="Latitude"
                        />
                        <input
                          type="number"
                          step="any"
                          value={coord.lng.toFixed(6)}
                          onChange={(e) => handleCoordinateChange(index, 'lng', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="Longitude"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Display */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Geofence Stats</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Perimeter:</span>
                    <span>{(calculatePerimeter() / 1000).toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span>{(calculateArea() / 1000000).toFixed(3)} km²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vertices:</span>
                    <span>{selectedType === 'circle' ? 1 : polygonData.length}</span>
                  </div>
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Color (Optional)</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, color: e.target.value }));
                      // Update shape color
                      if (circleRef.current) {
                        circleRef.current.setOptions({
                          strokeColor: e.target.value,
                          fillColor: e.target.value
                        });
                      }
                      if (polygonRef.current) {
                        polygonRef.current.setOptions({
                          strokeColor: e.target.value,
                          fillColor: e.target.value
                        });
                      }
                    }}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#2563EB"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.name || !formData.phoneNumber}
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
  );
};
