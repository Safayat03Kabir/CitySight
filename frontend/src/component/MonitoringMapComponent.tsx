'use client';
import { useEffect, useState } from 'react';

// OSM Classification & Styling Spec
// ---------------------------------
export const OSM_SPEC = {
  highways: {
    groups: [
      {
        name: "motorway",
        filter: { highway: ["motorway", "motorway_link"] },
        style: { color: "#D32F2F", weight: 5, opacity: 1.0 }
      },
      {
        name: "trunk",
        filter: { highway: ["trunk", "trunk_link"] },
        style: { color: "#F57C00", weight: 4, opacity: 1.0 }
      },
      {
        name: "primary",
        filter: { highway: ["primary", "primary_link"] },
        style: { color: "#FBC02D", weight: 3, opacity: 1.0 }
      },
      {
        name: "secondary",
        filter: { highway: ["secondary", "secondary_link"] },
        style: { color: "#43A047", weight: 2.5, opacity: 0.95 }
      },
      {
        name: "tertiary",
        filter: { highway: ["tertiary", "tertiary_link"] },
        style: { color: "#00897B", weight: 2, opacity: 0.9 }
      },
      {
        name: "residential_service",
        filter: { highway: ["residential", "living_street", "service", "unclassified"] },
        style: { color: "#757575", weight: 1.5, opacity: 0.9 }
      },
      {
        name: "non_motorized",
        filter: { highway: ["cycleway", "footway", "path", "pedestrian", "track", "bridleway", "steps"] },
        style: { color: "#1E88E5", weight: 1.5, opacity: 0.9, dashArray: "4 4" }
      }
    ],
    overpass: {
      bboxQuery: `[out:json][timeout:25];
        way["highway"](S,W,N,E);
        out geom;`
    },
    legend: [
      ["#D32F2F","Motorway"],
      ["#F57C00","Trunk"],
      ["#FBC02D","Primary"],
      ["#43A047","Secondary"],
      ["#00897B","Tertiary"],
      ["#757575","Residential/Service"],
      ["#1E88E5","Cycle/Foot/Path"]
    ],
    zIndex: 500
  },

  facilities: {
    common: {
      circle: { weight: 1, fillOpacity: 0.10, opacity: 0.9 },
      marker: { icon: "default" }
    },
    classes: [
      {
        name: "hospital",
        filter: { amenity: ["hospital"] },
        buffer_radius_m: 5000,
        style: { color: "#C62828", fillColor: "#C62828" },
        legendLabel: "Hospital (5 km)"
      },
      {
        name: "clinic",
        filter: { amenity: ["clinic", "doctors"] },
        buffer_radius_m: 2000,
        style: { color: "#AD1457", fillColor: "#AD1457" },
        legendLabel: "Clinic/Doctors (2 km)"
      },
      {
        name: "police",
        filter: { amenity: ["police"] },
        buffer_radius_m: 5000,
        style: { color: "#1565C0", fillColor: "#1565C0" },
        legendLabel: "Police (5 km)"
      },
      {
        name: "fire_station",
        filter: { amenity: ["fire_station"] },
        buffer_radius_m: 3000,
        style: { color: "#E65100", fillColor: "#E65100" },
        legendLabel: "Fire Station (3 km)"
      },
      {
        name: "park",
        filter: { leisure: ["park"] },
        buffer_radius_m: 800,
        style: { color: "#2E7D32", fillColor: "#2E7D32" },
        legendLabel: "Park (800 m)"
      }
    ],
    overpass: {
      bboxQuery: `[out:json][timeout:25];
        (
          node["amenity"~"^(hospital|clinic|doctors|police|fire_station)$"](S,W,N,E);
          way["amenity"~"^(hospital|clinic|doctors|police|fire_station)$"](S,W,N,E);
          relation["amenity"~"^(hospital|clinic|doctors|police|fire_station)$"](S,W,N,E);
          way["leisure"="park"](S,W,N,E);
          relation["leisure"="park"](S,W,N,E);
        );
        out center;`
    },
    legend: [
      ["#C62828","Hospital (5 km)"],
      ["#AD1457","Clinic/Doctors (2 km)"],
      ["#1565C0","Police (5 km)"],
      ["#E65100","Fire Station (3 km)"],
      ["#2E7D32","Park (800 m)"]
    ],
    zIndex: 600
  }
};

interface MonitoringStation {
  id: number;
  name: string;
  type: string;
  status: string;
  lastUpdate: string;
  coordinates: string;
  readings: { [key: string]: number | undefined };
}

interface MonitoringMapComponentProps {
  stations?: MonitoringStation[];
  onStationClick?: (station: MonitoringStation) => void;
  selectedStation?: MonitoringStation | null;
}

// City coordinates mapping for navigation
const cityCoordinates: { [key: string]: { lat: number; lng: number; zoom: number; icon: string; name: string } } = {
  'New York': { lat: 40.7128, lng: -74.0060, zoom: 11, icon: '🏙️', name: 'New York' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, zoom: 11, icon: '🌴', name: 'Los Angeles' },
  'Chicago': { lat: 41.8781, lng: -87.6298, zoom: 11, icon: '🌬️', name: 'Chicago' },
  'Miami': { lat: 25.7617, lng: -80.1918, zoom: 11, icon: '🏖️', name: 'Miami' },
  'London': { lat: 51.5074, lng: -0.1278, zoom: 11, icon: '🇬🇧', name: 'London' },
  'Tokyo': { lat: 35.6762, lng: 139.6503, zoom: 11, icon: '🗾', name: 'Tokyo' },
  'Paris': { lat: 48.8566, lng: 2.3522, zoom: 11, icon: '🇫🇷', name: 'Paris' },
  'Singapore': { lat: 1.3521, lng: 103.8198, zoom: 12, icon: '🇸🇬', name: 'Singapore' },
  'Sydney': { lat: -33.8688, lng: 151.2093, zoom: 11, icon: '🇦🇺', name: 'Sydney' },
  'Toronto': { lat: 43.6532, lng: -79.3832, zoom: 11, icon: '🇨🇦', name: 'Toronto' }
};

// Hospital-related interfaces
interface OSMElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    'name:en'?: string;
    operator?: string;
    amenity?: string;
    [key: string]: any;
  };
}

interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

interface HospitalRenderOptions {
  radiusMeters?: number;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
}

interface HighwayElement {
  type: string;
  id: number;
  geometry?: Array<{lat: number, lon: number}>;
  tags?: {
    highway?: string;
    name?: string;
    ref?: string;
    [key: string]: any;
  };
}

/**
 * Fetch highways from OpenStreetMap using Overpass API with retry logic
 */
const fetchHighwaysInBbox = async (bbox: BoundingBox): Promise<HighwayElement[]> => {
  const { south, west, north, east } = bbox;
  
  // Validate bbox size to prevent overly large queries
  const area = (north - south) * (east - west);
  if (area > 0.05) { // Even smaller limit for highways due to data density
    console.warn('⚠️ Bounding box area is large for highway query');
    throw new Error('Area too large for highway query. Please zoom in to a smaller area.');
  }

  const overpassQuery = OSM_SPEC.highways.overpass.bboxQuery
    .replace(/S/g, south.toString())
    .replace(/W/g, west.toString())
    .replace(/N/g, north.toString())
    .replace(/E/g, east.toString())
    .replace('timeout:25', 'timeout:15'); // Reduce timeout

  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for highways`);
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      if (!response.ok) {
        if (response.status === 504 || response.status === 503) {
          console.warn(`⚠️ Overpass API timeout/unavailable (${response.status}) on attempt ${attempt}`);
          if (attempt === maxRetries) {
            throw new Error(`Highway data service is currently busy. Please try zooming in to a smaller area or try again in a few moments.`);
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.elements) {
        console.warn('⚠️ No highway elements returned from Overpass API');
        return [];
      }

      console.log(`✅ Fetched ${data.elements.length} highways from Overpass API on attempt ${attempt}`);
      return data.elements;

    } catch (error) {
      console.error(`❌ Error fetching highways on attempt ${attempt}:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  return [];
};

/**
 * Generic function to fetch amenities from OpenStreetMap using Overpass API with retry logic
 */
const fetchAmenityInBboxWithRetry = async (bbox: BoundingBox, amenityType: string, maxRetries: number = 2): Promise<OSMElement[]> => {
  const { south, west, north, east } = bbox;
  
  // Validate bbox size to prevent overly large queries
  const area = (north - south) * (east - west);
  if (area > 0.1) { // Much smaller limit to prevent timeouts
    console.warn('⚠️ Bounding box area is very large, reducing query size to prevent timeout');
    // If area is too large, return empty array to avoid timeout
    return [];
  }

  const overpassQuery = `
    [out:json][timeout:15];
    (
      node["amenity"="${amenityType}"](${south},${west},${north},${east});
      way["amenity"="${amenityType}"](${south},${west},${north},${east});
      relation["amenity"="${amenityType}"](${south},${west},${north},${east});
    );
    out center;
  `;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${amenityType}s`);
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      if (!response.ok) {
        if (response.status === 504 || response.status === 503) {
          console.warn(`⚠️ Overpass API timeout/unavailable (${response.status}) on attempt ${attempt}`);
          if (attempt === maxRetries) {
            throw new Error(`Overpass API timeout after ${maxRetries} attempts. The area might be too large or the service is busy. Please try zooming in or try again later.`);
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.elements) {
        console.warn(`⚠️ No ${amenityType} elements returned from Overpass API`);
        return [];
      }

      console.log(`✅ Fetched ${data.elements.length} ${amenityType}s from Overpass API on attempt ${attempt}`);
      return data.elements;

    } catch (error) {
      console.error(`❌ Error fetching ${amenityType}s on attempt ${attempt}:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  return [];
};

/**
 * Fetch healthcare facilities (hospitals and clinics) from OpenStreetMap using Overpass API with retry
 */
const fetchHealthcareInBbox = async (bbox: BoundingBox): Promise<OSMElement[]> => {
  const { south, west, north, east } = bbox;
  
  // Validate bbox size to prevent overly large queries
  const area = (north - south) * (east - west);
  if (area > 0.1) { // Much smaller limit for healthcare
    console.warn('⚠️ Bounding box area is very large for healthcare query');
    throw new Error('Area too large for healthcare query. Please zoom in to a smaller area.');
  }

  const overpassQuery = `
    [out:json][timeout:15];
    (
      node["amenity"~"^(hospital|clinic|doctors)$"](${south},${west},${north},${east});
      way["amenity"~"^(hospital|clinic|doctors)$"](${south},${west},${north},${east});
      relation["amenity"~"^(hospital|clinic|doctors)$"](${south},${west},${north},${east});
    );
    out center;
  `;

  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for healthcare facilities`);
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      if (!response.ok) {
        if (response.status === 504 || response.status === 503) {
          console.warn(`⚠️ Overpass API timeout/unavailable (${response.status}) on attempt ${attempt}`);
          if (attempt === maxRetries) {
            throw new Error(`Healthcare data service is currently busy. Please try zooming in to a smaller area or try again in a few moments.`);
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 1500));
          continue;
        }
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.elements) {
        console.warn('⚠️ No healthcare elements returned from Overpass API');
        return [];
      }

      console.log(`✅ Fetched ${data.elements.length} healthcare facilities from Overpass API on attempt ${attempt}`);
      return data.elements;

    } catch (error) {
      console.error(`❌ Error fetching healthcare facilities on attempt ${attempt}:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, attempt * 1500));
    }
  }
  return [];
};

/**
 * Fetch parks from OpenStreetMap using Overpass API
 */
const fetchParksInBbox = async (bbox: BoundingBox): Promise<OSMElement[]> => {
  return fetchLeisureInBboxWithRetry(bbox, 'park');
};

/**
 * Generic function to fetch leisure amenities from OpenStreetMap using Overpass API with retry logic
 */
const fetchLeisureInBboxWithRetry = async (bbox: BoundingBox, leisureType: string, maxRetries: number = 2): Promise<OSMElement[]> => {
  const { south, west, north, east } = bbox;
  
  // Validate bbox size to prevent overly large queries
  const area = (north - south) * (east - west);
  if (area > 0.1) { // Smaller limit for leisure queries
    console.warn('⚠️ Bounding box area is very large for leisure query');
    throw new Error(`Area too large for ${leisureType} query. Please zoom in to a smaller area.`);
  }

  const overpassQuery = `
    [out:json][timeout:15];
    (
      node["leisure"="${leisureType}"](${south},${west},${north},${east});
      way["leisure"="${leisureType}"](${south},${west},${north},${east});
      relation["leisure"="${leisureType}"](${south},${west},${north},${east});
    );
    out center;
  `;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${leisureType}s`);
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      if (!response.ok) {
        if (response.status === 504 || response.status === 503) {
          console.warn(`⚠️ Overpass API timeout/unavailable (${response.status}) on attempt ${attempt}`);
          if (attempt === maxRetries) {
            throw new Error(`${leisureType} data service is currently busy. Please try zooming in to a smaller area or try again in a few moments.`);
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.elements) {
        console.warn(`⚠️ No ${leisureType} elements returned from Overpass API`);
        return [];
      }

      console.log(`✅ Fetched ${data.elements.length} ${leisureType}s from Overpass API on attempt ${attempt}`);
      return data.elements;

    } catch (error) {
      console.error(`❌ Error fetching ${leisureType}s on attempt ${attempt}:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  return [];
};

/**
 * Fetch fire stations from OpenStreetMap using Overpass API
 */
const fetchFireStationsInBbox = async (bbox: BoundingBox): Promise<OSMElement[]> => {
  return fetchAmenityInBboxWithRetry(bbox, 'fire_station');
};

/**
 * Fetch police stations from OpenStreetMap using Overpass API
 */
const fetchPoliceStationsInBbox = async (bbox: BoundingBox): Promise<OSMElement[]> => {
  return fetchAmenityInBboxWithRetry(bbox, 'police');
};

/**
 * Generic function to fetch amenities from OpenStreetMap using Overpass API (deprecated - use fetchAmenityInBboxWithRetry)
 */
const fetchAmenityInBbox = async (bbox: BoundingBox, amenityType: string): Promise<OSMElement[]> => {
  return fetchAmenityInBboxWithRetry(bbox, amenityType);
};

/**
 * Render highways on the map with proper styling
 */
const renderHighways = async (
  map: any,
  highways: HighwayElement[]
): Promise<any> => {
  const L = (await import('leaflet')).default;
  
  const layerGroup = L.layerGroup();

  highways.forEach((highway) => {
    if (!highway.geometry || highway.geometry.length < 2) {
      console.warn(`⚠️ Highway ${highway.id} has no valid geometry`);
      return;
    }

    const highwayType = highway.tags?.highway;
    if (!highwayType) {
      return;
    }

    // Find the appropriate highway group and styling
    let matchedGroup = null;
    for (const group of OSM_SPEC.highways.groups) {
      if (group.filter.highway.includes(highwayType)) {
        matchedGroup = group;
        break;
      }
    }

    if (!matchedGroup) {
      return; // Skip highways that don't match our classification
    }

    // Convert geometry to Leaflet LatLng format
    const coordinates = highway.geometry.map(point => [point.lat, point.lon] as [number, number]);

    // Create polyline with appropriate styling
    const polyline = L.polyline(coordinates, {
      ...matchedGroup.style,
      dashArray: matchedGroup.style.dashArray || undefined
    });

    // Create popup content
    const name = highway.tags?.name || highway.tags?.ref || `${matchedGroup.name} road`;
    const popupContent = `
      <div class="p-3 min-w-48">
        <h3 class="font-semibold text-lg mb-2" style="color: ${matchedGroup.style.color}">${name}</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Type:</span>
            <span class="font-medium">${matchedGroup.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Highway Class:</span>
            <span class="font-medium">${highwayType}</span>
          </div>
          ${highway.tags?.ref ? `
          <div class="flex justify-between">
            <span class="text-gray-600">Reference:</span>
            <span class="font-medium">${highway.tags.ref}</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    polyline.bindPopup(popupContent);
    layerGroup.addLayer(polyline);
  });

  console.log(`✅ Rendered ${highways.length} highways on map`);
  return layerGroup;
};

/**
 * Render healthcare facilities (hospitals and clinics) and their buffer circles on the map
 */
const renderHealthcareAndBuffers = async (
  map: any,
  healthcare: OSMElement[],
  options: HospitalRenderOptions = {}
): Promise<any> => {
  const L = (await import('leaflet')).default;
  
  const layerGroup = L.layerGroup();

  healthcare.forEach((facility) => {
    let lat: number, lon: number;

    // Get coordinates based on element type
    if (facility.type === 'node' && facility.lat && facility.lon) {
      lat = facility.lat;
      lon = facility.lon;
    } else if (facility.center) {
      lat = facility.center.lat;
      lon = facility.center.lon;
    } else {
      console.warn(`⚠️ Healthcare facility ${facility.id} has no valid coordinates`);
      return;
    }

    // Determine facility type and styling
    const amenityType = facility.tags?.amenity;
    let color, fillColor, radiusMeters, icon;
    
    if (amenityType === 'hospital') {
      const hospitalSpec = OSM_SPEC.facilities.classes.find(c => c.name === 'hospital');
      color = hospitalSpec?.style.color || '#C62828';
      fillColor = hospitalSpec?.style.fillColor || '#C62828';
      radiusMeters = hospitalSpec?.buffer_radius_m || 5000;
      icon = '🏥';
    } else { // clinic or doctors
      const clinicSpec = OSM_SPEC.facilities.classes.find(c => c.name === 'clinic');
      color = clinicSpec?.style.color || '#AD1457';
      fillColor = clinicSpec?.style.fillColor || '#AD1457';
      radiusMeters = clinicSpec?.buffer_radius_m || 2000;
      icon = '🩺';
    }

    // Apply any options overrides
    color = options.color || color;
    fillColor = options.fillColor || fillColor;
    radiusMeters = options.radiusMeters || radiusMeters;
    const fillOpacity = options.fillOpacity || 0.1;

    // Get facility name
    const name = facility.tags?.name || 
                 facility.tags?.['name:en'] || 
                 (amenityType === 'hospital' ? 'Hospital' : 'Clinic');
    
    const operator = facility.tags?.operator || 'Unknown';

    // Create facility marker
    const facilityIcon = L.divIcon({
      className: `healthcare-marker`,
      html: `
        <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs" style="background-color: ${color}">
          ${icon}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([lat, lon], { icon: facilityIcon });

    // Create popup content
    const popupContent = `
      <div class="p-3 min-w-48">
        <h3 class="font-semibold text-lg mb-2" style="color: ${color}">${icon} ${name}</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Operator:</span>
            <span class="font-medium">${operator}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Type:</span>
            <span class="font-medium">${amenityType === 'hospital' ? 'Hospital' : 'Clinic/Doctors'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Service Radius:</span>
            <span class="font-medium">${radiusMeters / 1000}km</span>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    // Create radius circle
    const circle = L.circle([lat, lon], {
      radius: radiusMeters,
      color: color,
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      weight: 1,
      opacity: 0.6
    });

    // Add both marker and circle to layer group
    layerGroup.addLayer(marker);
    layerGroup.addLayer(circle);
  });

  console.log(`✅ Rendered ${healthcare.length} healthcare facilities with radius circles`);
  return layerGroup;
};

/**
 * Render parks and their buffer circles on the map
 */
const renderParksAndBuffers = async (
  map: any,
  parks: OSMElement[],
  options: HospitalRenderOptions = {}
): Promise<any> => {
  const parkSpec = OSM_SPEC.facilities.classes.find(c => c.name === 'park');
  return renderAmenityAndBuffers(map, parks, 'park', {
    icon: '🌳',
    color: parkSpec?.style.color || '#2E7D32',
    fillColor: parkSpec?.style.fillColor || '#2E7D32',
    radiusMeters: parkSpec?.buffer_radius_m || 800,
    ...options
  });
};

/**
 * Render fire stations and their buffer circles on the map
 */
const renderFireStationsAndBuffers = async (
  map: any,
  fireStations: OSMElement[],
  options: HospitalRenderOptions = {}
): Promise<any> => {
  const fireStationSpec = OSM_SPEC.facilities.classes.find(c => c.name === 'fire_station');
  return renderAmenityAndBuffers(map, fireStations, 'fire_station', {
    icon: '🚒',
    color: fireStationSpec?.style.color || '#E65100',
    fillColor: fireStationSpec?.style.fillColor || '#E65100',
    radiusMeters: fireStationSpec?.buffer_radius_m || 3000,
    ...options
  });
};

/**
 * Render police stations and their buffer circles on the map
 */
const renderPoliceStationsAndBuffers = async (
  map: any,
  policeStations: OSMElement[],
  options: HospitalRenderOptions = {}
): Promise<any> => {
  const policeSpec = OSM_SPEC.facilities.classes.find(c => c.name === 'police');
  return renderAmenityAndBuffers(map, policeStations, 'police', {
    icon: '👮',
    color: policeSpec?.style.color || '#1565C0',
    fillColor: policeSpec?.style.fillColor || '#1565C0',
    radiusMeters: policeSpec?.buffer_radius_m || 5000,
    ...options
  });
};

/**
 * Generic function to render amenities and their buffer circles on the map
 */
const renderAmenityAndBuffers = async (
  map: any,
  amenities: OSMElement[],
  amenityType: string,
  options: HospitalRenderOptions & { icon: string } = { icon: '📍' }
): Promise<any> => {
  const L = (await import('leaflet')).default;
  
  const {
    radiusMeters = 5000,
    color = '#666',
    fillColor = '#666',
    fillOpacity = 0.1,
    icon = '📍'
  } = options;

  const layerGroup = L.layerGroup();

  amenities.forEach((amenity) => {
    let lat: number, lon: number;

    // Get coordinates based on element type
    if (amenity.type === 'node' && amenity.lat && amenity.lon) {
      lat = amenity.lat;
      lon = amenity.lon;
    } else if (amenity.center) {
      lat = amenity.center.lat;
      lon = amenity.center.lon;
    } else {
      console.warn(`⚠️ ${amenityType} ${amenity.id} has no valid coordinates`);
      return;
    }

    // Get amenity name
    const name = amenity.tags?.name || 
                 amenity.tags?.['name:en'] || 
                 amenityType.charAt(0).toUpperCase() + amenityType.slice(1).replace('_', ' ');
    
    const operator = amenity.tags?.operator || 'Unknown';

    // Create amenity marker
    const amenityIcon = L.divIcon({
      className: `${amenityType}-marker`,
      html: `
        <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs" style="background-color: ${color}">
          ${icon}
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([lat, lon], { icon: amenityIcon });

    // Create popup content
    const popupContent = `
      <div class="p-3 min-w-48">
        <h3 class="font-semibold text-lg mb-2" style="color: ${color}">${icon} ${name}</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Operator:</span>
            <span class="font-medium">${operator}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Type:</span>
            <span class="font-medium">${amenityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Service Radius:</span>
            <span class="font-medium">${radiusMeters / 1000}km</span>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}
          </div>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    // Create radius circle
    const circle = L.circle([lat, lon], {
      radius: radiusMeters,
      color: color,
      fillColor: fillColor,
      fillOpacity: fillOpacity,
      weight: 1,
      opacity: 0.6
    });

    // Add both marker and circle to layer group
    layerGroup.addLayer(marker);
    layerGroup.addLayer(circle);
  });

  console.log(`✅ Rendered ${amenities.length} ${amenityType}s with ${radiusMeters}m radius circles`);
  return layerGroup;
};

const MonitoringMapComponent = ({ 
  stations = [], 
  onStationClick,
  selectedStation 
}: MonitoringMapComponentProps) => {
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('New York');
  
  const [healthcareLayer, setHealthcareLayer] = useState<any>(null);
  const [showHealthcare, setShowHealthcare] = useState<boolean>(false);
  const [healthcareLoading, setHealthcareLoading] = useState<boolean>(false);
  
  // New amenity layers
  const [parkLayer, setParkLayer] = useState<any>(null);
  const [showParks, setShowParks] = useState<boolean>(false);
  const [parksLoading, setParksLoading] = useState<boolean>(false);
  
  const [fireStationLayer, setFireStationLayer] = useState<any>(null);
  const [showFireStations, setShowFireStations] = useState<boolean>(false);
  const [fireStationsLoading, setFireStationsLoading] = useState<boolean>(false);
  
  const [policeStationLayer, setPoliceStationLayer] = useState<any>(null);
  const [showPoliceStations, setShowPoliceStations] = useState<boolean>(false);
  const [policeStationsLoading, setPoliceStationsLoading] = useState<boolean>(false);

  // Highway layer state
  const [highwayLayer, setHighwayLayer] = useState<any>(null);
  const [showHighways, setShowHighways] = useState<boolean>(false);
  const [highwaysLoading, setHighwaysLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    
    // Dynamic import to avoid SSR issues
    const initializeMap = async () => {
      try {
        // Check if component is still mounted
        if (!mounted) {
          console.log('⏳ Component unmounted during initialization');
          return;
        }

        const L = (await import('leaflet')).default;
        
        // Check if map is already initialized
        if (map) {
          console.log('🗺️ Map already exists, skipping initialization');
          return;
        }

        // Check if the container already has a map instance
        const container = document.getElementById('monitoring-map');
        if (!container) {
          console.log('⏳ Map container not ready yet');
          return;
        }

        // Remove any existing Leaflet instance on the container
        if ((container as any)._leaflet_id) {
          console.log('🧹 Cleaning up existing map instance');
          // Clear the leaflet id to allow reinitialization
          delete (container as any)._leaflet_id;
        }
        
        // Fix for default markers
        try {
          (delete (L.Icon.Default.prototype as any)._getIconUrl);
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          });
        } catch (iconError) {
          console.warn('⚠️ Icon setup warning:', iconError);
        }

        // Initialize map centered on selected city
        const cityData = cityCoordinates[selectedCity];
        const mapInstance = L.map('monitoring-map').setView(
          [cityData.lat, cityData.lng], 
          cityData.zoom
        );

        // Add base tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);

        // Only set map if component is still mounted
        if (mounted) {
          setMap(mapInstance);
          console.log('✅ Monitoring map initialized successfully');
          console.log('🗺️ Map is ready for amenity layer interactions');
        }
      } catch (error) {
        console.error('❌ Error initializing monitoring map:', error);
        if (mounted) {
          if (error instanceof Error && error.message.includes('Map container is already initialized')) {
            console.log('🔄 Map container conflict detected');
            setError('Map initialization conflict - please refresh the page');
          } else {
            setError('Failed to initialize monitoring map');
          }
        }
      }
    };

    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeMap, 100);

    // Cleanup
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (map) {
        try {
          map.remove();
          console.log('🧹 Monitoring map cleaned up');
        } catch (cleanupError) {
          console.warn('⚠️ Error during monitoring map cleanup:', cleanupError);
        }
      }
    };
  }, []); // Empty dependency array to run only once

  // Add markers when stations change or map is ready
  useEffect(() => {
    if (!map || !stations.length) return;

    const addMarkersToMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Clear existing markers
        markers.forEach(marker => {
          map.removeLayer(marker);
        });

        const newMarkers: any[] = [];

        stations.forEach(station => {
          const [lat, lng] = station.coordinates.split(', ').map(Number);
          
          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`⚠️ Invalid coordinates for station ${station.name}: ${station.coordinates}`);
            return;
          }

          // Create custom icon based on station status
          const iconColor = getStatusIconColor(station.status);
          const stationIcon = L.divIcon({
            className: 'custom-station-marker',
            html: `
              <div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs ${iconColor}">
                ${getStationIcon(station.type)}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          // Create marker
          const marker = L.marker([lat, lng], { icon: stationIcon });

          // Create popup content
          const popupContent = `
            <div class="p-3 min-w-64">
              <h3 class="font-semibold text-lg mb-2">${station.name}</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Type:</span>
                  <span class="font-medium">${station.type}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Status:</span>
                  <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(station.status)}">${station.status}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Last Update:</span>
                  <span class="text-sm">${station.lastUpdate}</span>
                </div>
                <div class="mt-3 pt-2 border-t border-gray-200">
                  <h4 class="font-medium mb-2">Current Readings:</h4>
                  <div class="space-y-1">
                    ${Object.entries(station.readings).filter(([_, value]) => value !== undefined).map(([key, value]) => `
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600 capitalize">${key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span class="font-medium">${value} ${getUnit(key)}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);

          // Add click handler
          marker.on('click', () => {
            if (onStationClick) {
              onStationClick(station);
            }
          });

          marker.addTo(map);
          newMarkers.push(marker);
        });

        setMarkers(newMarkers);
        console.log(`✅ Added ${newMarkers.length} monitoring station markers`);

      } catch (error) {
        console.error('❌ Error adding station markers:', error);
        setError('Failed to add station markers');
      }
    };

    addMarkersToMap();
  }, [map, stations, onStationClick]);

  // Highlight selected station
  useEffect(() => {
    if (!map || !selectedStation) return;

    const highlightStation = async () => {
      try {
        const L = (await import('leaflet')).default;
        const [lat, lng] = selectedStation.coordinates.split(', ').map(Number);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          // Center map on selected station
          map.setView([lat, lng], 13);
          
          // Find and open popup for selected station
          markers.forEach(marker => {
            const markerLatLng = marker.getLatLng();
            if (Math.abs(markerLatLng.lat - lat) < 0.001 && Math.abs(markerLatLng.lng - lng) < 0.001) {
              marker.openPopup();
            }
          });
        }
      } catch (error) {
        console.error('❌ Error highlighting selected station:', error);
      }
    };

    highlightStation();
  }, [selectedStation, map, markers]);

  /**
   * Get status-based icon color
   */
  const getStatusIconColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  /**
   * Get status-based color classes
   */
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get station type icon
   */
  const getStationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'air quality': return '🌬️';
      case 'environmental': return '🌿';
      case 'emissions': return '⚡';
      case 'weather': return '🌤️';
      case 'water quality': return '💧';
      default: return '📊';
    }
  };

  /**
   * Get unit for parameter
   */
  const getUnit = (parameter: string): string => {
    const units: { [key: string]: string } = {
      pm25: "µg/m³",
      pm10: "µg/m³",
      no2: "µg/m³",
      o3: "µg/m³",
      so2: "µg/m³",
      co2: "ppm",
      ch4: "ppm",
      temperature: "°C",
      humidity: "%",
      soilMoisture: "%",
      uv: "index"
    };
    return units[parameter] || "";
  };

  /**
   * Toggle highways layer visibility
   */
  const toggleHighways = async () => {
    if (!map) {
      console.warn('⚠️ Map not available for highways');
      return;
    }

    console.log(`🔄 Toggling highways layer. Current state: ${showHighways ? 'showing' : 'hidden'}`);

    try {
      if (showHighways && highwayLayer) {
        // Hide highways layer
        map.removeLayer(highwayLayer);
        setHighwayLayer(null);
        setShowHighways(false);
        console.log(`✅ Hidden highways layer`);
      } else {
        // Show highways layer
        console.log(`🔍 Starting to show highways layer`);
        setHighwaysLoading(true);
        setError(null);

        // Get current map bounds
        const bounds = map.getBounds();
        const bbox: BoundingBox = {
          south: bounds.getSouth(),
          west: bounds.getWest(),
          north: bounds.getNorth(),
          east: bounds.getEast()
        };

        console.log('Fetching highways for bbox:', bbox);

        // Fetch highways
        const highways = await fetchHighwaysInBbox(bbox);
        
        console.log(`Received ${highways.length} highways from API`);
        
        if (highways.length === 0) {
          console.log(`ℹ️ No highways found in current view`);
          setError(`No highways found in current map view. Try zooming out or moving to a different area.`);
          return;
        }

        // Render highways
        console.log(`🎨 Rendering ${highways.length} highways on map`);
        const newLayer = await renderHighways(map, highways);

        // Add to map
        newLayer.addTo(map);
        setHighwayLayer(newLayer);
        setShowHighways(true);
        
        console.log(`✅ Successfully added ${highways.length} highways to map`);
      }
    } catch (error) {
      console.error(`❌ Error toggling highways:`, error);
      setError(error instanceof Error ? error.message : `Failed to load highways`);
    } finally {
      setHighwaysLoading(false);
    }
  };

  /**
   * Toggle healthcare facilities layer visibility
   */
  const toggleHealthcare = async () => {
    await toggleAmenityLayer(
      'healthcare',
      showHealthcare,
      healthcareLayer,
      setShowHealthcare,
      setHealthcareLayer,
      setHealthcareLoading,
      fetchHealthcareInBbox,
      renderHealthcareAndBuffers
    );
  };

  /**
   * Toggle parks layer visibility
   */
  const toggleParks = async () => {
    await toggleAmenityLayer(
      'park',
      showParks,
      parkLayer,
      setShowParks,
      setParkLayer,
      setParksLoading,
      fetchParksInBbox,
      renderParksAndBuffers
    );
  };

  /**
   * Toggle fire stations layer visibility
   */
  const toggleFireStations = async () => {
    await toggleAmenityLayer(
      'fire_station',
      showFireStations,
      fireStationLayer,
      setShowFireStations,
      setFireStationLayer,
      setFireStationsLoading,
      fetchFireStationsInBbox,
      renderFireStationsAndBuffers
    );
  };

  /**
   * Toggle police stations layer visibility
   */
  const togglePoliceStations = async () => {
    await toggleAmenityLayer(
      'police',
      showPoliceStations,
      policeStationLayer,
      setShowPoliceStations,
      setPoliceStationLayer,
      setPoliceStationsLoading,
      fetchPoliceStationsInBbox,
      renderPoliceStationsAndBuffers
    );
  };

  /**
   * Generic toggle function for amenity layers
   */
  const toggleAmenityLayer = async (
    amenityType: string,
    isShowing: boolean,
    layer: any,
    setShowing: (show: boolean) => void,
    setLayer: (layer: any) => void,
    setLoading: (loading: boolean) => void,
    fetchFunction: (bbox: BoundingBox) => Promise<OSMElement[]>,
    renderFunction: (map: any, amenities: OSMElement[], options?: any) => Promise<any>
  ) => {
    if (!map) {
      console.warn('⚠️ Map not available for', amenityType);
      return;
    }

    console.log(`🔄 Toggling ${amenityType} layer. Current state: ${isShowing ? 'showing' : 'hidden'}`);

    try {
      if (isShowing && layer) {
        // Hide amenity layer
        map.removeLayer(layer);
        setLayer(null);
        setShowing(false);
        console.log(`✅ Hidden ${amenityType} layer`);
      } else {
        // Show amenity layer
        console.log(`🔍 Starting to show ${amenityType} layer`);
        setLoading(true);
        setError(null);

        // Get current map bounds
        const bounds = map.getBounds();
        const bbox: BoundingBox = {
          south: bounds.getSouth(),
          west: bounds.getWest(),
          north: bounds.getNorth(),
          east: bounds.getEast()
        };

        console.log(`${amenityType} Fetching ${amenityType}s for bbox:`, bbox);

        // Fetch amenities
        const amenities = await fetchFunction(bbox);
        
        console.log(`${amenityType} Received ${amenities.length} ${amenityType}s from API`);
        
        if (amenities.length === 0) {
          console.log(`ℹ️ No ${amenityType}s found in current view`);
          setError(`No ${amenityType.replace('_', ' ')}s found in current map view. Try zooming out or moving to a different area.`);
          return;
        }

        // Render amenities and buffers
        console.log(`🎨 Rendering ${amenities.length} ${amenityType}s on map`);
        const newLayer = await renderFunction(map, amenities, {
          radiusMeters: 5000,
          fillOpacity: 0.1
        });

        // Add to map
        newLayer.addTo(map);
        setLayer(newLayer);
        setShowing(true);
        
        console.log(`✅ Successfully added ${amenities.length} ${amenityType}s to map`);
      }
    } catch (error) {
      console.error(`❌ Error toggling ${amenityType}s:`, error);
      setError(error instanceof Error ? error.message : `Failed to load ${amenityType.replace('_', ' ')}s`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to a specific city
   */
  const navigateToCity = async (cityName: string) => {
    if (!map) {
      console.warn('⚠️ Map not available for city navigation');
      return;
    }

    const cityData = cityCoordinates[cityName];
    if (!cityData) {
      console.warn(`⚠️ City coordinates not found for: ${cityName}`);
      setError(`City "${cityName}" not found in coordinates database`);
      return;
    }

    try {
      console.log(`🗺️ Navigating to ${cityName}...`);
      
      // Set the city as selected
      setSelectedCity(cityName);
      
      // Clear any previous errors
      setError(null);

      // Animate to the city location
      map.flyTo([cityData.lat, cityData.lng], cityData.zoom, {
        animate: true,
        duration: 2 // 2 second animation
      });

      console.log(`✅ Successfully navigated to ${cityName}`);

    } catch (error) {
      console.error(`❌ Error navigating to ${cityName}:`, error);
      setError(`Failed to navigate to ${cityName}`);
    }
  };

  return (
    <div className="w-full  bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex flex-col">
      {/* Main Content: Map and Control Panel Side by Side */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 flex-1">
        {/* Map Container - Left side */}
        <div className="flex-1 lg:w-3/4">
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center flex-colspace-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mx-2">
                    Infrastructure Monitoring Map
                  </h3>
                </div>
              </div>
            </div>
            <div 
              id="monitoring-map" 
              key="monitoring-map-container"
              className="w-full flex-1 rounded-xl border-2 border-gray-300 shadow-inner bg-gray-100"
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>

        {/* Control Panel - Right side */}
        <div className="lg:w-1/5">
          <div className="p-2 bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl border border-blue-100 h-full flex flex-col">
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg my-2">
                  <span className="text-lg">⚙️</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Controls
                  </h2>
                </div>
              </div>
            </div>
            {/* City Selector */}
            <div className="mb-6 p-1.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg border border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-500 rounded flex items-center justify-center shadow">
                    <span className="text-white text-base">🌍</span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-800">Cities</h4>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {cityCoordinates[selectedCity]?.icon} {cityCoordinates[selectedCity]?.name}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(cityCoordinates).map(([cityKey, cityData]) => (
                  <button
                    key={cityKey}
                    onClick={() => navigateToCity(cityKey)}
                    disabled={!map}
                    className={`px-2 py-1.5 rounded-md transition-colors text-sm ${
                      selectedCity === cityKey
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {cityData.icon} {cityData.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenity Toggle Buttons */}
            <div className="space-y-1 flex-1 flex flex-col">
              <button
                onClick={toggleHighways}
                disabled={!map || highwaysLoading}
                className={`px-4 py-2.5 rounded-md transition-colors text-base ${
                  showHighways 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-white text-gray-600 border border-gray-600 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {highwaysLoading ? '⏳ Loading...' : showHighways ? '🛣️ Hide Roads' : '🛣️ Show Roads'}
              </button>
              
              <button
                onClick={toggleHealthcare}
                disabled={!map || healthcareLoading}
                className={`px-4 py-2.5 rounded-md transition-colors text-base ${
                  showHealthcare 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white text-red-600 border border-red-600 hover:bg-red-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {healthcareLoading ? '⏳ Loading...' : showHealthcare ? '🏥 Hide Healthcare' : '🏥 Show Healthcare'}
              </button>
              
              <button
                onClick={toggleParks}
                disabled={!map || parksLoading}
                className={`px-4 py-2.5 rounded-md transition-colors text-base ${
                  showParks 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {parksLoading ? '⏳ Loading...' : showParks ? '🌳 Hide Parks' : '🌳 Show Parks'}
              </button>
              
              <button
                onClick={toggleFireStations}
                disabled={!map || fireStationsLoading}
                className={`px-4 py-2.5 rounded-md transition-colors text-base ${
                  showFireStations 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-white text-orange-600 border border-orange-600 hover:bg-orange-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {fireStationsLoading ? '⏳ Loading...' : showFireStations ? '🚒 Hide Fire Stations' : '🚒 Show Fire Stations'}
              </button>
              
              <button
                onClick={togglePoliceStations}
                disabled={!map || policeStationsLoading}
                className={`px-4 py-2.5 rounded-md transition-colors text-base ${
                  showPoliceStations 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {policeStationsLoading ? '⏳ Loading...' : showPoliceStations ? '👮 Hide Police Stations' : '👮 Show Police Stations'}
              </button>

              {/* Error Display */}
              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                  <div className="flex items-start">
                    <span className="text-red-500 mr-2 text-lg">❌</span>
                    <div>
                      <div className="font-bold text-base mb-1">Error</div>
                      <div className="text-sm">{error}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringMapComponent;