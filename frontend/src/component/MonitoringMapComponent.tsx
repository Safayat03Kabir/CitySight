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
 * Fetch highways from OpenStreetMap using Overpass API
 */
const fetchHighwaysInBbox = async (bbox: BoundingBox): Promise<HighwayElement[]> => {
  const { south, west, north, east } = bbox;
  
  // Validate bbox size to prevent overly large queries
  const area = (north - south) * (east - west);
  if (area > 0.5) { // Smaller limit for highways due to data density
    console.warn('⚠️ Bounding box area is large for highway query, query might be slow');
  }

  const overpassQuery = OSM_SPEC.highways.overpass.bboxQuery
    .replace(/S/g, south.toString())
    .replace(/W/g, west.toString())
    .replace(/N/g, north.toString())
    .replace(/E/g, east.toString());

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.elements) {
      console.warn('⚠️ No highway elements returned from Overpass API');
      return [];
    }

    console.log(`✅ Fetched ${data.elements.length} highways from Overpass API`);
    return data.elements;

  } catch (error) {
    console.error('❌ Error fetching highways:', error);
    throw new Error(`Failed to fetch highways: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Fetch healthcare facilities (hospitals and clinics) from OpenStreetMap using Overpass API
 */
const fetchHealthcareInBbox = async (bbox: BoundingBox): Promise<OSMElement[]> => {
  const { south, west, north, east } = bbox;
  
  // Validate bbox size to prevent overly large queries
  const area = (north - south) * (east - west);
  if (area > 1) { // Roughly 111km x 111km at equator
    console.warn('⚠️ Bounding box area is very large, query might be slow');
  }

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"~"^(hospital|clinic|doctors)$"](${south},${west},${north},${east});
      way["amenity"~"^(hospital|clinic|doctors)$"](${south},${west},${north},${east});
      relation["amenity"~"^(hospital|clinic|doctors)$"](${south},${west},${north},${east});
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.elements) {
      console.warn('⚠️ No healthcare elements returned from Overpass API');
      return [];
    }

    console.log(`✅ Fetched ${data.elements.length} healthcare facilities from Overpass API`);
    return data.elements;

  } catch (error) {
    console.error('❌ Error fetching healthcare facilities:', error);
    throw new Error(`Failed to fetch healthcare facilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Fetch parks from OpenStreetMap using Overpass API
 */
const fetchParksInBbox = async (bbox: BoundingBox): Promise<OSMElement[]> => {
  return fetchLeisureInBbox(bbox, 'park');
};

/**
 * Generic function to fetch leisure amenities from OpenStreetMap using Overpass API
 */
const fetchLeisureInBbox = async (bbox: BoundingBox, leisureType: string): Promise<OSMElement[]> => {
  const { south, west, north, east } = bbox;
  
  // Validate bbox size to prevent overly large queries
  const area = (north - south) * (east - west);
  if (area > 1) { // Roughly 111km x 111km at equator
    console.warn('⚠️ Bounding box area is very large, query might be slow');
  }

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["leisure"="${leisureType}"](${south},${west},${north},${east});
      way["leisure"="${leisureType}"](${south},${west},${north},${east});
      relation["leisure"="${leisureType}"](${south},${west},${north},${east});
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.elements) {
      console.warn(`⚠️ No ${leisureType} elements returned from Overpass API`);
      return [];
    }

    console.log(`✅ Fetched ${data.elements.length} ${leisureType}s from Overpass API`);
    return data.elements;

  } catch (error) {
    console.error(`❌ Error fetching ${leisureType}s:`, error);
    throw new Error(`Failed to fetch ${leisureType}s: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Fetch fire stations from OpenStreetMap using Overpass API
 */
const fetchFireStationsInBbox = async (bbox: BoundingBox): Promise<OSMElement[]> => {
  return fetchAmenityInBbox(bbox, 'fire_station');
};

/**
 * Fetch police stations from OpenStreetMap using Overpass API
 */
const fetchPoliceStationsInBbox = async (bbox: BoundingBox): Promise<OSMElement[]> => {
  return fetchAmenityInBbox(bbox, 'police');
};

/**
 * Generic function to fetch amenities from OpenStreetMap using Overpass API
 */
const fetchAmenityInBbox = async (bbox: BoundingBox, amenityType: string): Promise<OSMElement[]> => {
  const { south, west, north, east } = bbox;
  
  // Validate bbox size to prevent overly large queries
  const area = (north - south) * (east - west);
  if (area > 1) { // Roughly 111km x 111km at equator
    console.warn('⚠️ Bounding box area is very large, query might be slow');
  }

  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="${amenityType}"](${south},${west},${north},${east});
      way["amenity"="${amenityType}"](${south},${west},${north},${east});
      relation["amenity"="${amenityType}"](${south},${west},${north},${east});
    );
    out center;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.elements) {
      console.warn(`⚠️ No ${amenityType} elements returned from Overpass API`);
      return [];
    }

    console.log(`✅ Fetched ${data.elements.length} ${amenityType}s from Overpass API`);
    return data.elements;

  } catch (error) {
    console.error(`❌ Error fetching ${amenityType}s:`, error);
    throw new Error(`Failed to fetch ${amenityType}s: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

        // Initialize map centered on New York City
        const mapInstance = L.map('monitoring-map').setView([40.7128, -74.0060], 11);

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

  return (
    <div className="w-full">
      {/* Custom CSS for markers */}
      <style jsx global>{`
        .custom-station-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .leaflet-popup-content {
          margin: 0;
          font-family: inherit;
        }
        
        .hospital-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .healthcare-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .park-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .fire_station-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .police-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      {/* Control Panel */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Monitoring Stations Map</h3>
          <div className="text-sm text-gray-600 px-3 py-2">
            {stations.length} stations
          </div>
        </div>

        {/* Amenity Toggle Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <button
            onClick={toggleHighways}
            disabled={!map || highwaysLoading}
            className={`px-3 py-2 rounded-md transition-colors text-sm ${
              showHighways 
                ? 'bg-gray-800 text-white hover:bg-gray-900' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {highwaysLoading ? '⏳' : showHighways ? '🛣️ Hide Roads' : '🛣️ Show Roads'}
          </button>
          
          <button
            onClick={toggleHealthcare}
            disabled={!map || healthcareLoading}
            className={`px-3 py-2 rounded-md transition-colors text-sm ${
              showHealthcare 
                ? 'bg-red-700 text-white hover:bg-red-800' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {healthcareLoading ? '⏳' : showHealthcare ? '🏥 Hide Healthcare' : '🏥 Show Healthcare'}
          </button>
          
          <button
            onClick={toggleParks}
            disabled={!map || parksLoading}
            className={`px-3 py-2 rounded-md transition-colors text-sm ${
              showParks 
                ? 'bg-green-700 text-white hover:bg-green-800' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {parksLoading ? '⏳' : showParks ? '🌳 Hide Parks' : '🌳 Show Parks'}
          </button>
          
          <button
            onClick={toggleFireStations}
            disabled={!map || fireStationsLoading}
            className={`px-3 py-2 rounded-md transition-colors text-sm ${
              showFireStations 
                ? 'bg-orange-700 text-white hover:bg-orange-800' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {fireStationsLoading ? '⏳' : showFireStations ? '🚒 Hide Fire Stations' : '🚒 Show Fire Stations'}
          </button>
          
          <button
            onClick={togglePoliceStations}
            disabled={!map || policeStationsLoading}
            className={`px-3 py-2 rounded-md transition-colors text-sm ${
              showPoliceStations 
                ? 'bg-blue-700 text-white hover:bg-blue-800' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {policeStationsLoading ? '⏳' : showPoliceStations ? '👮 Hide Police Stations' : '👮 Show Police Stations'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <div className="flex items-start">
              <span className="text-red-500 mr-2">❌</span>
              <div>
                <div className="font-medium">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="mb-4">
        <div 
          id="monitoring-map" 
          key="monitoring-map-container"
          className="w-full h-[600px] rounded-lg border border-gray-300 shadow-lg"
        />
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Map Legend</h4>
        
        {/* Station Status Legend */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Monitoring Stations</h5>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-700">Warning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-700">Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span className="text-sm text-gray-700">Unknown</span>
            </div>
          </div>
        </div>

        {/* Amenity Legends */}
        {(showHealthcare || showParks || showFireStations || showPoliceStations) && (
          <div className="mb-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Public Services & Facilities</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {showHealthcare && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs mr-1" style={{backgroundColor: '#C62828'}}>🏥</div>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs" style={{backgroundColor: '#AD1457'}}>🩺</div>
                  </div>
                  <span className="text-sm text-gray-700">Healthcare (Hospitals & Clinics)</span>
                </div>
              )}
              {showParks && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs" style={{backgroundColor: '#2E7D32'}}>🌳</div>
                  <span className="text-sm text-gray-700">Parks (800m)</span>
                </div>
              )}
              {showFireStations && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs" style={{backgroundColor: '#E65100'}}>🚒</div>
                  <span className="text-sm text-gray-700">Fire Stations (3km)</span>
                </div>
              )}
              {showPoliceStations && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs" style={{backgroundColor: '#1565C0'}}>👮</div>
                  <span className="text-sm text-gray-700">Police Stations (5km)</span>
                </div>
              )}
            </div>
            {(showHealthcare || showParks || showFireStations || showPoliceStations) && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 rounded-full border border-gray-400" style={{borderStyle: 'dashed'}}></div>
                <span className="text-sm text-gray-700">Service Radius</span>
              </div>
            )}
          </div>
        )}

        {/* Highway Legends */}
        {showHighways && (
          <div className="mb-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Road Network</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {OSM_SPEC.highways.legend.map(([color, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded" style={{backgroundColor: color}}></div>
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Click on any station marker, facility marker, or road segment to view detailed information and current readings.
        </div>
      </div>
    </div>
  );
};

export default MonitoringMapComponent;