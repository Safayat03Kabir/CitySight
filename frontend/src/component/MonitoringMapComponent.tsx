'use client';
import { useEffect, useState } from 'react';

// Population service import
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Risk assessment thresholds per 10,000 people (based on real-world urban planning data)
const AMENITY_RISK_THRESHOLDS = {
  healthcare: {
    optimal: 12.0,   // Excellent: ~1 hospital per 50k + 1 clinic per 1k = 0.2 + 10 = 12 per 10k
    warning: 7.0,    // Adequate: ~1 hospital per 100k + 1 clinic per 2k = 0.1 + 5 = 7 per 10k
    critical: 3.0    // Minimal: ~1 hospital per 100k + 1 clinic per 5k = 0.1 + 2 = 3 per 10k
  },
  police: {
    optimal: 0.8,    // 1 per 12,500 people (excellent urban coverage)
    warning: 0.4,    // 1 per 25,000 people (standard coverage)
    critical: 0.2    // 1 per 50,000 people (minimal coverage)
  },
  fire_station: {
    optimal: 1.4,    // 1 per 7,000 people (excellent 4-6 min response time)
    warning: 1.0,    // 1 per 10,000 people (adequate response time)
    critical: 0.7    // 1 per 14,000 people (acceptable response time)
  },
  park: {
    optimal: 3.3,    // 1 per 3,000 people (excellent access to green space)
    warning: 2.0,    // 1 per 5,000 people (good access)
    critical: 1.7    // 1 per 6,000 people (minimal access)
  }
};

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

interface PopulationData {
  population_density_max: number;
  population_density_mean: number;
  population_density_min: number;
  population_sum: number;
  totalArea: number;
  imageUrl: string;
}

interface AmenityCount {
  healthcare: number;
  police: number;
  fire_station: number;
  park: number;
}

interface RiskAssessment {
  amenityType: string;
  count: number;
  ratio: number; // per 10,000 people
  riskLevel: 'optimal' | 'warning' | 'critical';
  message: string;
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
        if (response.status === 429) {
          console.warn(`⚠️ Rate limit hit (429) for ${amenityType}s on attempt ${attempt}`);
          if (attempt === maxRetries) {
            throw new Error(`Rate limit exceeded for ${amenityType}s. Please wait a moment and try again.`);
          }
          // Progressive delay for rate limits: 3s, 6s, 12s
          const delayTime = attempt * 3000;
          console.log(`⏳ Waiting ${delayTime/1000}s before retry due to rate limit...`);
          await new Promise(resolve => setTimeout(resolve, delayTime));
          continue;
        }
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
 * Fetch basic population data from the backend API (lightweight for risk assessment)
 */
const fetchPopulationData = async (bbox: BoundingBox): Promise<PopulationData> => {
  const { south, west, north, east } = bbox;
  
  const boundsString = `${west},${south},${east},${north}`;
  const url = `${API_BASE_URL}/api/population/basic?bounds=${boundsString}&year=2020`;
  
  console.log('👥 Fetching basic population data from:', url);
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || data.message || 'Failed to fetch population data');
  }
  
  if (!data.success || !data.data) {
    throw new Error('Invalid response format from population service');
  }
  
  return data.data;
};

/**
 * Count amenities by type
 */
const countAmenitiesByType = (amenities: OSMElement[]): AmenityCount => {
  const counts: AmenityCount = {
    healthcare: 0,
    police: 0,
    fire_station: 0,
    park: 0
  };

  amenities.forEach(amenity => {
    const amenityType = amenity.tags?.amenity;
    const leisureType = amenity.tags?.leisure;
    
    if (amenityType === 'hospital' || amenityType === 'clinic' || amenityType === 'doctors') {
      counts.healthcare++;
    } else if (amenityType === 'police') {
      counts.police++;
    } else if (amenityType === 'fire_station') {
      counts.fire_station++;
    } else if (leisureType === 'park') {
      counts.park++;
    }
  });

  return counts;
};

/**
 * Calculate risk assessment based on population and amenity counts
 * Improved with better edge case handling and realistic messaging
 */
const calculateRiskAssessment = (population: number, amenityCounts: AmenityCount): RiskAssessment[] => {
  const assessments: RiskAssessment[] = [];
  
  // Handle edge cases
  if (population <= 0) {
    console.warn('⚠️ Population is zero or negative, cannot calculate risk assessment');
    return [];
  }
  
  // Minimum population threshold for meaningful analysis
  if (population < 1000) {
    console.warn('⚠️ Population is very small (<1000), risk assessment may not be meaningful');
  }
  
  // Convert population to per 10,000 for calculations
  const populationPer10K = population / 10000;
  
  Object.entries(amenityCounts).forEach(([amenityType, count]) => {
    const thresholds = AMENITY_RISK_THRESHOLDS[amenityType as keyof typeof AMENITY_RISK_THRESHOLDS];
    if (!thresholds) {
      console.warn(`⚠️ No thresholds defined for amenity type: ${amenityType}`);
      return;
    }
    
    const ratio = count / populationPer10K;
    
    let riskLevel: 'optimal' | 'warning' | 'critical';
    let message: string;
    let actionableAdvice: string;
    
    // Calculate people per facility for context
    const peoplePerFacility = count > 0 ? Math.round(population / count) : population;
    
    if (count === 0) {
      riskLevel = 'critical';
      message = `No ${amenityType.replace('_', ' ')} facilities found in this area`;
      actionableAdvice = `Immediate need for ${amenityType.replace('_', ' ')} infrastructure`;
    } else if (ratio >= thresholds.optimal) {
      riskLevel = 'optimal';
      message = `Excellent: ${ratio.toFixed(1)} ${amenityType.replace('_', ' ')} facilities per 10,000 people (1 per ${peoplePerFacility.toLocaleString()} residents)`;
      actionableAdvice = 'Maintain current service levels, focus on quality improvements';
    } else if (ratio >= thresholds.warning) {
      riskLevel = 'warning';
      message = `Adequate: ${ratio.toFixed(1)} ${amenityType.replace('_', ' ')} facilities per 10,000 people (1 per ${peoplePerFacility.toLocaleString()} residents)`;
      actionableAdvice = 'Consider expansion planning to reach optimal levels';
    } else {
      riskLevel = 'critical';
      message = `Insufficient: ${ratio.toFixed(1)} ${amenityType.replace('_', ' ')} facilities per 10,000 people (1 per ${peoplePerFacility.toLocaleString()} residents)`;
      actionableAdvice = 'Priority area for infrastructure investment';
    }
    
    assessments.push({
      amenityType: amenityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      ratio,
      riskLevel,
      message: message + (actionableAdvice ? ` - ${actionableAdvice}` : '')
    });
  });
  
  return assessments.sort((a, b) => {
    const riskOrder = { critical: 3, warning: 2, optimal: 1 };
    return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
  });
};

/**
 * Add delay between API requests to avoid rate limiting
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch all amenities in bbox using a single unified query to avoid rate limits
 */
const fetchAllAmenitiesInBbox = async (bbox: BoundingBox): Promise<OSMElement[]> => {
  console.log('🔍 Fetching all amenities for risk assessment with unified query...');
  
  const { south, west, north, east } = bbox;
  
  // Validate bbox size to prevent overly large queries
  const area = (north - south) * (east - west);
  if (area > 0.05) {
    console.warn('⚠️ Bounding box area is large for unified amenity query');
    throw new Error('Area too large for amenity query. Please zoom in to a smaller area.');
  }

  // Unified Overpass query for all amenities at once
  const overpassQuery = `
    [out:json][timeout:30];
    (
      node["amenity"~"^(hospital|clinic|doctors|police|fire_station)$"](${south},${west},${north},${east});
      way["amenity"~"^(hospital|clinic|doctors|police|fire_station)$"](${south},${west},${north},${east});
      relation["amenity"~"^(hospital|clinic|doctors|police|fire_station)$"](${south},${west},${north},${east});
      way["leisure"="park"](${south},${west},${north},${east});
      relation["leisure"="park"](${south},${west},${north},${east});
    );
    out center;
  `;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Unified amenity query attempt ${attempt}/${maxRetries}`);
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.warn(`⚠️ Rate limit hit (429) on attempt ${attempt}. Waiting before retry...`);
          if (attempt === maxRetries) {
            throw new Error(`Rate limit exceeded. Please wait a moment and try again. The Overpass API is currently busy.`);
          }
          // Progressive delay: 2s, 5s, 10s
          const delayTime = attempt * 2500;
          await delay(delayTime);
          continue;
        }
        if (response.status === 504 || response.status === 503) {
          console.warn(`⚠️ Overpass API timeout/unavailable (${response.status}) on attempt ${attempt}`);
          if (attempt === maxRetries) {
            throw new Error(`Overpass API is currently busy. Please try zooming in to a smaller area or try again in a few moments.`);
          }
          await delay(attempt * 2000);
          continue;
        }
        throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.elements) {
        console.warn('⚠️ No amenity elements returned from unified query');
        return [];
      }

      console.log(`✅ Fetched ${data.elements.length} total amenities from unified query on attempt ${attempt}`);
      return data.elements;

    } catch (error) {
      console.error(`❌ Error in unified amenity query on attempt ${attempt}:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retrying
      await delay(attempt * 2000);
    }
  }
  return [];
};

/**
 * Fetch all amenities in bbox using sequential requests (fallback method)
 */
const fetchAllAmenitiesInBboxSequential = async (bbox: BoundingBox): Promise<OSMElement[]> => {
  console.log('🔍 Fetching all amenities for risk assessment with sequential requests...');
  
  try {
    const allAmenities: OSMElement[] = [];
    
    // Sequential requests with delays to avoid rate limiting
    console.log('📡 Fetching healthcare facilities...');
    const healthcare = await fetchHealthcareInBbox(bbox);
    allAmenities.push(...healthcare);
    await delay(1500); // 1.5 second delay
    
    console.log('📡 Fetching parks...');
    const parks = await fetchParksInBbox(bbox);
    allAmenities.push(...parks);
    await delay(1500); // 1.5 second delay
    
    console.log('📡 Fetching fire stations...');
    const fireStations = await fetchFireStationsInBbox(bbox);
    allAmenities.push(...fireStations);
    await delay(1500); // 1.5 second delay
    
    console.log('📡 Fetching police stations...');
    const policeStations = await fetchPoliceStationsInBbox(bbox);
    allAmenities.push(...policeStations);
    
    console.log(`📊 Found ${allAmenities.length} total amenities for risk assessment`);
    return allAmenities;
  } catch (error) {
    console.error('❌ Error fetching amenities for risk assessment:', error);
    throw error;
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

  // Population and risk assessment state
  const [populationData, setPopulationData] = useState<PopulationData | null>(null);
  const [amenityCounts, setAmenityCounts] = useState<AmenityCount>({
    healthcare: 0,
    police: 0,
    fire_station: 0,
    park: 0
  });
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [showRiskPanel, setShowRiskPanel] = useState<boolean>(false);
  const [riskLoading, setRiskLoading] = useState<boolean>(false);
  
  // Search functionality state
  const [searchLoading, setSearchLoading] = useState<boolean>(false);

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
   * Perform risk assessment for the current map bounds
   */
  const performRiskAssessment = async () => {
    if (!map) {
      console.warn('⚠️ Map not available for risk assessment');
      return;
    }

    console.log('🔍 Starting risk assessment...');
    setRiskLoading(true);
    setError(null);

    try {
      // Get current map bounds
      const bounds = map.getBounds();
      const bbox: BoundingBox = {
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast()
      };

      console.log('📊 Performing risk assessment for bbox:', bbox);

      // Fetch population data first
      console.log('👥 Fetching population data...');
      const populationResponse = await fetchPopulationData(bbox);
      console.log('✅ Population data received:', populationResponse);

      // Fetch amenities with rate limit handling
      console.log('🏢 Fetching amenities data...');
      let allAmenities: OSMElement[] = [];
      
      try {
        // Try unified query first (faster, single request)
        allAmenities = await fetchAllAmenitiesInBbox(bbox);
      } catch (error) {
        console.warn('⚠️ Unified query failed, trying sequential approach:', error);
        try {
          // Fallback to sequential requests with delays
          allAmenities = await fetchAllAmenitiesInBboxSequential(bbox);
        } catch (sequentialError) {
          console.error('❌ Both unified and sequential approaches failed:', sequentialError);
          throw new Error('Unable to fetch amenity data due to API rate limits. Please try again in a few moments or zoom in to a smaller area.');
        }
      }

      console.log(`✅ Amenities data received: ${allAmenities.length} amenities`);

      // Count amenities by type
      const amenityCount = countAmenitiesByType(allAmenities);
      console.log('📈 Amenity counts:', amenityCount);

      // Calculate risk assessments
      const totalPopulation = populationResponse.population_sum || 0;
      const riskAssessment = calculateRiskAssessment(totalPopulation, amenityCount);

      // Update state
      setPopulationData(populationResponse);
      setAmenityCounts(amenityCount);
      setRiskAssessments(riskAssessment);
      setShowRiskPanel(true);

      console.log('✅ Risk assessment completed successfully');
      console.log('📊 Risk assessments:', riskAssessment);

    } catch (error) {
      console.error('❌ Error performing risk assessment:', error);
      let errorMessage = 'Failed to perform risk assessment';
      
      if (error instanceof Error) {
        if (error.message.includes('Rate limit') || error.message.includes('429')) {
          errorMessage = '🚫 Rate limit exceeded. The mapping service is busy. Please wait 30 seconds and try again, or zoom in to a smaller area.';
        } else if (error.message.includes('timeout') || error.message.includes('busy')) {
          errorMessage = '⏳ Service temporarily unavailable. Please try zooming in to a smaller area or try again in a few moments.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setRiskLoading(false);
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

  /**
   * Search for a location using Nominatim geocoding API
   */
  const searchLocation = async (searchQuery: string) => {
    if (!map || !searchQuery.trim()) {
      console.warn('⚠️ Map not initialized or empty search query');
      return;
    }

    setSearchLoading(true);
    setError(null);

    try {
      console.log(`🔍 Searching for location: ${searchQuery}`);

      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const results = await response.json();

      if (!results || results.length === 0) {
        setError(`No results found for "${searchQuery}". Try a different search term.`);
        return;
      }

      const location = results[0];
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lon);
      const displayName = location.display_name;

      console.log(`✅ Found location: ${displayName} at ${lat}, ${lng}`);

      // Determine appropriate zoom level based on location type
      let zoomLevel = 12; // Default city zoom
      if (location.type === 'administrative') {
        zoomLevel = location.class === 'boundary' ? 10 : 12;
      } else if (location.type === 'city' || location.type === 'town') {
        zoomLevel = 11;
      } else if (location.type === 'village') {
        zoomLevel = 13;
      } else if (location.type === 'neighbourhood') {
        zoomLevel = 14;
      }

      // Animate to the found location
      map.flyTo([lat, lng], zoomLevel, {
        animate: true,
        duration: 2 // 2 second animation
      });

      // Clear selected city since this might be a custom location
      setSelectedCity('');

      console.log(`🗺️ Navigated to search result: ${displayName}`);

    } catch (error) {
      console.error(`❌ Error searching for location:`, error);
      setError(`Failed to search for "${searchQuery}". Please try again.`);
    } finally {
      setSearchLoading(false);
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Infrastructure Analysis
                  </h3>
                </div>
              </div>
              
              {/* Search Box */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search city or address..."
                    disabled={searchLoading}
                    className={`px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64 ${
                      searchLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const searchValue = (e.target as HTMLInputElement).value.trim();
                        if (searchValue && !searchLoading) {
                          searchLocation(searchValue);
                        }
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {searchLoading ? (
                      <div className="animate-spin text-blue-500">⏳</div>
                    ) : (
                      <span className="text-gray-400">🔍</span>
                    )}
                  </div>
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

              {/* Risk Assessment Button */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <button
                  onClick={performRiskAssessment}
                  disabled={!map || riskLoading}
                  className={`w-full px-4 py-3 rounded-md transition-colors text-base font-semibold ${
                    showRiskPanel 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {riskLoading ? '⏳ Analyzing...' : '🔍 Risk Assessment'}
                </button>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Analyzes population vs infrastructure
                </div>
              </div>

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

      {/* Risk Assessment Panel */}
      {showRiskPanel && populationData && riskAssessments.length > 0 && (
        <div className="mt-6 p-6 bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-2xl border border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Infrastructure Risk Assessment
                </h3>
                <p className="text-sm text-gray-600">
                  Based on population density and amenity availability
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRiskPanel(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Population Summary */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-lg mb-3 text-blue-800">📊 Population Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {populationData.population_sum.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Population</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {populationData.population_density_mean.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Density/km²</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {populationData.population_density_max.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Max Density/km²</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {populationData.totalArea.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Area (km²)</div>
              </div>
            </div>
          </div>

          {/* Risk Assessments */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg mb-3 text-gray-800">🏥 Amenity Coverage Analysis</h4>
            {riskAssessments.map((assessment, index) => {
              const getRiskColor = (risk: string) => {
                switch (risk) {
                  case 'optimal': return 'from-green-50 to-emerald-50 border-green-200 text-green-800';
                  case 'warning': return 'from-yellow-50 to-orange-50 border-yellow-200 text-yellow-800';
                  case 'critical': return 'from-red-50 to-pink-50 border-red-200 text-red-800';
                  default: return 'from-gray-50 to-slate-50 border-gray-200 text-gray-800';
                }
              };

              const getRiskIcon = (risk: string) => {
                switch (risk) {
                  case 'optimal': return '✅';
                  case 'warning': return '⚠️';
                  case 'critical': return '🚨';
                  default: return '❓';
                }
              };

              return (
                <div key={index} className={`p-4 rounded-lg border bg-gradient-to-r ${getRiskColor(assessment.riskLevel)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getRiskIcon(assessment.riskLevel)}</span>
                        <h5 className="font-semibold text-base">{assessment.amenityType}</h5>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-60">
                          {assessment.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{assessment.message}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span><strong>Count:</strong> {assessment.count}</span>
                        <span><strong>Ratio:</strong> {assessment.ratio.toFixed(2)}/10k people</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Overall Risk Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-lg mb-3 text-gray-800">📈 Overall Assessment</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {riskAssessments.filter(r => r.riskLevel === 'optimal').length}
                </div>
                <div className="text-sm text-green-700">Optimal</div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {riskAssessments.filter(r => r.riskLevel === 'warning').length}
                </div>
                <div className="text-sm text-yellow-700">Warning</div>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {riskAssessments.filter(r => r.riskLevel === 'critical').length}
                </div>
                <div className="text-sm text-red-700">Critical</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringMapComponent;