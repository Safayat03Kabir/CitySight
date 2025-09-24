"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// Map click handler component
const MapClickHandler = ({ onMapClick }: { onMapClick: (event: any) => void }) => {
  if (typeof window !== 'undefined') {
    const { useMapEvents } = require('react-leaflet');
    useMapEvents({
      click: onMapClick,
    });
  }
  
  return null;
};

interface NearbyService {
  type: string;
  name: string;
  distance: number;
  icon: string;
}

interface RiskAnalysis {
  overallRisk: number;
  factors: {
    hospitalAccess: number;
    fireStationAccess: number;
    policeAccess: number;
    schoolAccess: number;
    parkAccess: number;
    roadAccess: number;
  };
  nearbyServices: NearbyService[];
}

interface BuildHomeRiskToolProps {
  onClose?: () => void;
}

export default function BuildHomeRiskTool({ onClose }: BuildHomeRiskToolProps) {
  const [selectedLocation, setSelectedLocation] = useState("New York");
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // New York coordinates
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [userMarkerPosition, setUserMarkerPosition] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<any>(null);

  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) {
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        
        // Automatically navigate to the first result
        setMapCenter([lat, lon]);
        setMarkerPosition([lat, lon]);
        
        // Pan map to new location
        if (mapRef.current) {
          mapRef.current.setView([lat, lon], 13);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };



  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearbyServices = async (lat: number, lon: number): Promise<NearbyService[]> => {
    const services = [
      { type: 'hospital', query: 'amenity=hospital', icon: '🏥' },
      { type: 'fire_station', query: 'amenity=fire_station', icon: '🚒' },
      { type: 'police', query: 'amenity=police', icon: '👮' },
      { type: 'school', query: 'amenity=school', icon: '🏫' },
      { type: 'park', query: 'leisure~"^(park|garden|recreation_ground|playground|nature_reserve|common|village_green|pitch)$"', icon: '🌳' },
      { type: 'road', query: 'highway', icon: '🛣️' }
    ];

    const nearbyServices: NearbyService[] = [];
    
    for (const service of services) {
      try {
        let query;
        if (service.type === 'road') {
          // More inclusive query for roads - accept any highway type
          query = `[out:json];(
            way[highway](around:3000,${lat},${lon});
            node[highway](around:3000,${lat},${lon});
          );out geom;`;
        } else if (service.type === 'park') {
          // More inclusive query for parks and green spaces
          query = `[out:json];(
            node[leisure~"^(park|garden|recreation_ground|playground|nature_reserve|common|village_green|pitch)$"](around:5000,${lat},${lon});
            way[leisure~"^(park|garden|recreation_ground|playground|nature_reserve|common|village_green|pitch)$"](around:5000,${lat},${lon});
            node[landuse~"^(recreation_ground|village_green|forest)$"](around:5000,${lat},${lon});
            way[landuse~"^(recreation_ground|village_green|forest)$"](around:5000,${lat},${lon});
          );out geom;`;
        } else {
          query = `[out:json];(node[${service.query}](around:5000,${lat},${lon}););out;`;
        }
        
        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        if (data.elements && data.elements.length > 0) {
          // Find the closest service
          let closestDistance = Infinity;
          let closestService = null;
          
          for (const element of data.elements) {
            let elementLat, elementLon;
            
            if (service.type === 'road' || service.type === 'park') {
              // For roads and parks (can be ways or nodes), calculate distance to the closest point
              if (element.geometry && element.geometry.length > 0) {
                // Find the closest point on the way/area
                for (const point of element.geometry) {
                  const distance = calculateDistance(lat, lon, point.lat, point.lon);
                  if (distance < closestDistance) {
                    closestDistance = distance;
                    elementLat = point.lat;
                    elementLon = point.lon;
                    closestService = element;
                  }
                }
              } else if (element.lat && element.lon) {
                // For nodes
                const distance = calculateDistance(lat, lon, element.lat, element.lon);
                if (distance < closestDistance) {
                  closestDistance = distance;
                  closestService = element;
                }
              }
            } else {
              // For point services (hospitals, schools, etc.)
              if (element.lat && element.lon) {
                const distance = calculateDistance(lat, lon, element.lat, element.lon);
                if (distance < closestDistance) {
                  closestDistance = distance;
                  closestService = element;
                }
              }
            }
          }
          
          if (closestService) {
            let serviceName = closestService.tags?.name || `Nearest ${service.type.replace('_', ' ')}`;
            
            // For roads, show the road type
            if (service.type === 'road' && closestService.tags?.highway) {
              serviceName = `${closestService.tags.highway.charAt(0).toUpperCase() + closestService.tags.highway.slice(1)} road`;
              if (closestService.tags.name) {
                serviceName += ` (${closestService.tags.name})`;
              }
            }
            
            // For parks, show the park type
            if (service.type === 'park') {
              if (closestService.tags?.leisure) {
                serviceName = `${closestService.tags.leisure.charAt(0).toUpperCase() + closestService.tags.leisure.slice(1).replace('_', ' ')}`;
              } else if (closestService.tags?.landuse) {
                serviceName = `${closestService.tags.landuse.charAt(0).toUpperCase() + closestService.tags.landuse.slice(1).replace('_', ' ')}`;
              }
              if (closestService.tags?.name) {
                serviceName += ` (${closestService.tags.name})`;
              }
            }
            
            nearbyServices.push({
              type: service.type,
              name: serviceName,
              distance: closestDistance,
              icon: service.icon
            });
          }
        } else {
          // No service found within search radius
          let searchRadius;
          let penaltyDistance;
          
          if (service.type === 'road') {
            searchRadius = 3;
            penaltyDistance = 5; // Lower penalty for roads as they're infrastructure
          } else if (service.type === 'park') {
            searchRadius = 5;
            penaltyDistance = 8; // Moderate penalty for parks
          } else {
            searchRadius = 5;
            penaltyDistance = 10; // High penalty for critical services
          }
          
          nearbyServices.push({
            type: service.type,
            name: `No ${service.type.replace('_', ' ')} found within ${searchRadius}km`,
            distance: penaltyDistance,
            icon: service.icon
          });
        }
      } catch (error) {
        console.error(`Error fetching ${service.type}:`, error);
        // Fallback for error cases - more lenient penalties
        let fallbackDistance;
        if (service.type === 'road') {
          fallbackDistance = 3; // Lower penalty for roads - they're likely nearby even if API fails
        } else if (service.type === 'park') {
          fallbackDistance = 6; // Moderate penalty for parks
        } else {
          fallbackDistance = 8; // Higher penalty for critical services
        }
        
        nearbyServices.push({
          type: service.type,
          name: `${service.type.replace('_', ' ')} data unavailable`,
          distance: fallbackDistance,
          icon: service.icon
        });
      }
    }
    
    return nearbyServices;
  };

  const calculateRiskScore = (services: NearbyService[]): RiskAnalysis => {
    const factors = {
      hospitalAccess: 0,
      fireStationAccess: 0,
      policeAccess: 0,
      schoolAccess: 0,
      parkAccess: 0,
      roadAccess: 0
    };

    // Calculate individual risk factors based on distance (0-100, where 0 is best)
    services.forEach(service => {
      let riskScore = 0;
      
      // Distance-based risk calculation with service-specific thresholds
      if (service.type === 'road') {
        // Roads are more critical for access - more lenient scoring
        if (service.distance <= 0.2) riskScore = 5;   // Very close road
        else if (service.distance <= 0.5) riskScore = 15;  // Close road
        else if (service.distance <= 1) riskScore = 30;    // Moderate distance
        else if (service.distance <= 3) riskScore = 55;    // Far but accessible
        else riskScore = 80; // Very far road access
      } else if (service.type === 'park') {
        // Parks are for quality of life - moderate scoring
        if (service.distance <= 0.3) riskScore = 10;  // Very close park
        else if (service.distance <= 1) riskScore = 25;   // Close park
        else if (service.distance <= 2) riskScore = 45;   // Moderate distance
        else if (service.distance <= 5) riskScore = 65;   // Far park
        else riskScore = 85; // Very far park
      } else {
        // Critical services (hospital, fire, police, school) - stricter scoring
        if (service.distance <= 0.5) riskScore = 10; // Very close - very low risk
        else if (service.distance <= 1) riskScore = 20; // Close - low risk
        else if (service.distance <= 2) riskScore = 40; // Moderate distance - moderate risk
        else if (service.distance <= 5) riskScore = 70; // Far - high risk
        else riskScore = 90; // Very far - very high risk
      }

      switch (service.type) {
        case 'hospital': factors.hospitalAccess = riskScore; break;
        case 'fire_station': factors.fireStationAccess = riskScore; break;
        case 'police': factors.policeAccess = riskScore; break;
        case 'school': factors.schoolAccess = riskScore; break;
        case 'park': factors.parkAccess = riskScore; break;
        case 'road': factors.roadAccess = riskScore; break;
      }
    });

    // Complex weighted formula for overall risk
    const weights = {
      hospital: 0.25,    // 25% - Critical for emergencies
      fireStation: 0.25, // 25% - Critical for safety
      police: 0.15,      // 15% - Important for security
      school: 0.15,      // 15% - Important for families
      park: 0.10,        // 10% - Quality of life
      road: 0.10         // 10% - Accessibility
    };

    const overallRisk = Math.round(
      factors.hospitalAccess * weights.hospital +
      factors.fireStationAccess * weights.fireStation +
      factors.policeAccess * weights.police +
      factors.schoolAccess * weights.school +
      factors.parkAccess * weights.park +
      factors.roadAccess * weights.road
    );

    return {
      overallRisk,
      factors,
      nearbyServices: services
    };
  };

  const handleMapClick = async (event: any) => {
    const { lat, lng } = event.latlng;
    setUserMarkerPosition([lat, lng]);
    setIsAnalyzing(true);
    
    try {
      const services = await findNearbyServices(lat, lng);
      const analysis = calculateRiskScore(services);
      setRiskAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing location:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedLocation && selectedLocation.trim() !== "" && selectedLocation !== "New York") {
        searchLocation(selectedLocation);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [selectedLocation]);

  // Fix Leaflet marker icons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      
      // Fix default marker icons
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
  }, []);

  const getRiskLevel = (score: number) => {
    if (score < 20) return { level: "Very Low", color: "text-green-600 bg-green-100" };
    if (score < 40) return { level: "Low", color: "text-green-500 bg-green-50" };
    if (score < 60) return { level: "Medium", color: "text-yellow-600 bg-yellow-100" };
    if (score < 80) return { level: "High", color: "text-orange-600 bg-orange-100" };
    return { level: "Very High", color: "text-red-600 bg-red-100" };
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🏠 Build Home Risk Assessment</h1>
            <p className="text-gray-600">
              Analyze environmental and geological risks for home construction using satellite data and predictive modeling.
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          )}
        </div>

        {/* Map and Search Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Location Selection</h2>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Location
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter city name or address..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <div className="absolute right-3 top-3">
                {isSearching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                ) : (
                  <span className="text-gray-400">🔍</span>
                )}
              </div>
            </div>
            

          </div>

          {/* Instructions */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>📍 Click anywhere on the map</strong> to analyze the risk for building a home at that location. 
              The system will automatically find nearby services and calculate risk factors.
            </p>
          </div>

          {/* Map Container */}
          <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
            {typeof window !== 'undefined' && (
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                {/* City center marker */}
                <Marker position={markerPosition}>
                  <Popup>
                    <div className="text-center">
                      <strong>City Center</strong>
                      <br />
                      {selectedLocation}
                    </div>
                  </Popup>
                </Marker>
                {/* User-placed marker for analysis */}
                {userMarkerPosition && (
                  <Marker 
                    position={userMarkerPosition}
                    eventHandlers={{
                      click: () => {}
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong>🏠 Analysis Location</strong>
                        <br />
                        Building risk analysis point
                        {isAnalyzing && (
                          <>
                            <br />
                            <em>Analyzing...</em>
                          </>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            )}
          </div>

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                <span className="text-yellow-800">Analyzing location and finding nearby services...</span>
              </div>
            </div>
          )}
        </div>

        {/* Risk Results */}
        {riskAnalysis && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Risk Assessment Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Overall Risk Score */}
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-200"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      className={riskAnalysis.overallRisk < 50 ? "text-green-500" : riskAnalysis.overallRisk < 75 ? "text-yellow-500" : "text-red-500"}
                      strokeDasharray={`${riskAnalysis.overallRisk}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{riskAnalysis.overallRisk}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskLevel(riskAnalysis.overallRisk).color}`}>
                    {getRiskLevel(riskAnalysis.overallRisk).level} Risk
                  </span>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Risk Factors by Service Access</h3>
                <div className="space-y-3">
                  {[
                    { name: "Hospital Access", value: riskAnalysis.factors.hospitalAccess, icon: "🏥" },
                    { name: "Fire Station Access", value: riskAnalysis.factors.fireStationAccess, icon: "🚒" },
                    { name: "Police Access", value: riskAnalysis.factors.policeAccess, icon: "👮" },
                    { name: "School Access", value: riskAnalysis.factors.schoolAccess, icon: "🏫" },
                    { name: "Park Access", value: riskAnalysis.factors.parkAccess, icon: "🌳" },
                    { name: "Road Access", value: riskAnalysis.factors.roadAccess, icon: "🛣️" },
                  ].map((factor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{factor.icon}</span>
                        <span className="text-sm text-gray-700">{factor.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              factor.value < 30 ? 'bg-green-500' : 
                              factor.value < 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${factor.value}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{factor.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nearby Services Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Nearby Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {riskAnalysis.nearbyServices.map((service, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{service.icon}</span>
                      <span className="font-medium text-gray-800 capitalize">
                        {service.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{service.name}</p>
                    <p className="text-sm font-medium text-gray-800">
                      {service.distance < 10 ? `${service.distance.toFixed(1)} km away` : 'Very far (10+ km)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {riskAnalysis && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recommendations Based on Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Location-Specific Recommendations</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {riskAnalysis.factors.hospitalAccess > 70 && (
                    <li>• Consider proximity to medical facilities - current access is limited</li>
                  )}
                  {riskAnalysis.factors.fireStationAccess > 70 && (
                    <li>• Install comprehensive fire safety systems due to distant fire station</li>
                  )}
                  {riskAnalysis.factors.policeAccess > 70 && (
                    <li>• Consider additional security measures due to limited police access</li>
                  )}
                  {riskAnalysis.factors.schoolAccess > 70 && (
                    <li>• Factor in transportation costs for education access</li>
                  )}
                  {riskAnalysis.factors.roadAccess > 70 && (
                    <li>• Ensure reliable private transport due to limited road access</li>
                  )}
                  {riskAnalysis.overallRisk < 30 && (
                    <li>• Excellent location with good access to essential services</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Insurance & Planning</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {riskAnalysis.overallRisk > 70 ? (
                    <>
                      <li>• Comprehensive insurance package recommended</li>
                      <li>• Consider higher deductibles due to location risks</li>
                      <li>• Plan for emergency preparedness supplies</li>
                      <li>• Budget for higher utility connection costs</li>
                    </>
                  ) : riskAnalysis.overallRisk > 40 ? (
                    <>
                      <li>• Standard insurance coverage should be sufficient</li>
                      <li>• Consider service-specific coverage gaps</li>
                      <li>• Plan for moderate infrastructure costs</li>
                    </>
                  ) : (
                    <>
                      <li>• Standard insurance rates expected</li>
                      <li>• Good infrastructure access reduces costs</li>
                      <li>• Excellent location for property value growth</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Risk Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Risk Summary</h4>
              <p className="text-sm text-gray-600">
                Based on analysis of nearby services, this location has a{' '}
                <strong className={
                  riskAnalysis.overallRisk < 30 ? 'text-green-600' :
                  riskAnalysis.overallRisk < 70 ? 'text-yellow-600' : 'text-red-600'
                }>
                  {getRiskLevel(riskAnalysis.overallRisk).level.toLowerCase()} risk
                </strong>{' '}
                rating for home construction. Key factors include access to emergency services, 
                educational facilities, and transportation infrastructure.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}