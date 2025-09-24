'use client';
import React, { useEffect, useState } from 'react';
import { HeatService } from '../services/heatService';
import { AirQualityService } from '../services/airQualityService';
import { PopulationService } from '../services/populationService';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

// Type definitions for the heat data response
interface HeatYearPoint {
  year: number;
  meanC: number | null;
  sampleCount: number;
  hasData: boolean;
}

// Type definitions for air quality time series
interface AirQualityYearPoint {
  year: number;
  meanNO2: number | null;
  sampleCount: number;
  hasData: boolean;
}

// Type definitions for population time series
interface PopulationYearPoint {
  year: number;
  meanDensity: number | null;
  totalPopulation: number | null;
  hasData: boolean;
}

interface HeatStatistics {
  urbanMeanC: number;
  ruralMeanC: number;
  heatIslandIntensity: number;
  minTempC: number;
  maxTempC: number;
  imageCount: number;
  qualityScore: string;
}

// Type definitions for air quality data response
interface AirQualityStatistics {
  urbanMeanNO2: number;
  ruralMeanNO2: number;
  airQualityDifference: number;
  no2ImageCount: number;
  coImageCount: number;
  so2ImageCount: number;
  pollutionStats: any;
  concentrationRange: { min: number; max: number };
}

// Type definitions for population data response
interface PopulationStatistics {
  urbanMeanDensity: number;
  ruralMeanDensity: number;
  totalAreaKm2: number;
  estimatedTotalPopulation: number;
  populationStats: any;
  densityRange: { min: number; max: number };
}

interface VisualizationParams {
  min: number;
  max: number;
  palette: string[];
}

interface OverlayBounds {
  northeast: { lat: number; lng: number };
  southwest: { lat: number; lng: number };
}

interface DateRange {
  start: string;
  end: string;
  actualStart: string;
  actualEnd: string;
}

interface HeatDataResponse {
  imageUrl: string;
  bounds: { west: number; south: number; east: number; north: number };
  statistics: HeatStatistics;
  visualizationParams: VisualizationParams;
  overlayBounds: OverlayBounds;
  dateRange: DateRange;
  timeSeries?: HeatYearPoint[];
}

interface AirQualityDataResponse {
  imageUrl: string;
  bounds: { west: number; south: number; east: number; north: number };
  statistics: AirQualityStatistics;
  visualizationParams: VisualizationParams;
  overlayBounds: OverlayBounds;
  dateRange: DateRange;
  timeSeries?: AirQualityYearPoint[];
}

interface PopulationDataResponse {
  imageUrl: string;
  bounds: { west: number; south: number; east: number; north: number };
  statistics: PopulationStatistics;
  visualizationParams: VisualizationParams;
  overlayBounds: OverlayBounds;
  year: number;
  timeSeries?: PopulationYearPoint[];
}

interface HeatMetadata {
  requestId: string;
  timestamp: string;
  processingTime: string;
  dataSource: string;
  resolution: string;
  cloudCoverThreshold: string;
}

interface HeatApiResponse {
  success: boolean;
  data: HeatDataResponse;
  metadata: HeatMetadata;
}

interface AirQualityApiResponse {
  success: boolean;
  data: AirQualityDataResponse;
  metadata: HeatMetadata; // Same metadata structure
}

interface PopulationApiResponse {
  success: boolean;
  data: PopulationDataResponse;
  metadata: HeatMetadata; // Same metadata structure
}

interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

const EnhancedMapComponent = () => {
  const [map, setMap] = useState<any>(null);
  const [heatOverlay, setHeatOverlay] = useState<any>(null);
  const [airQualityOverlay, setAirQualityOverlay] = useState<any>(null);
  const [populationOverlay, setPopulationOverlay] = useState<any>(null);
  const [heatData, setHeatData] = useState<HeatApiResponse | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityApiResponse | null>(null);
  const [populationData, setPopulationData] = useState<PopulationApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestBounds, setLastRequestBounds] = useState<MapBounds | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedPopulationYear, setSelectedPopulationYear] = useState<number>(2020);
  const [dataType, setDataType] = useState<'heat' | 'airquality' | 'population'>('heat');

  // Time series state for progressive loading
  const [timeSeriesLoading, setTimeSeriesLoading] = useState<boolean>(false);
  const [heatTimeSeries, setHeatTimeSeries] = useState<HeatYearPoint[]>([]);
  const [airQualityTimeSeries, setAirQualityTimeSeries] = useState<AirQualityYearPoint[]>([]);
  const [populationTimeSeries, setPopulationTimeSeries] = useState<PopulationYearPoint[]>([]);

  // Search functionality state
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  
  // Selected city state
  const [selectedCity, setSelectedCity] = useState<string>('New York');

  // City coordinates mapping for manual navigation
  const cityCoordinates: { [key: string]: { lat: number; lng: number; zoom: number; icon: string; name: string } } = {
    'New York': { lat: 40.7128, lng: -74.0060, zoom: 10, icon: '🏙️', name: 'New York' },
    'Los Angeles': { lat: 34.0522, lng: -118.2437, zoom: 10, icon: '🌴', name: 'Los Angeles' },
    'Chicago': { lat: 41.8781, lng: -87.6298, zoom: 10, icon: '🌬️', name: 'Chicago' },
    'London': { lat: 51.5074, lng: -0.1278, zoom: 10, icon: '🇬🇧', name: 'London' },
    'Dhaka': { lat: 23.8103, lng: 90.4125, zoom: 11, icon: '🏛️', name: 'Dhaka' },
    'Chittagong': { lat: 22.3569, lng: 91.7832, zoom: 11, icon: '🏢', name: 'Chittagong' }
  };

  // City boundaries for manual API calls (for cities not supported by name)
  const cityBounds: { [key: string]: MapBounds } = {
    'Dhaka': {
      west: 90.3200,   // Western boundary
      south: 23.7200,  // Southern boundary  
      east: 90.5000,   // Eastern boundary
      north: 23.9000   // Northern boundary
    },
    'Chittagong': {
      west: 91.7000,   // Western boundary
      south: 22.2500,  // Southern boundary
      east: 91.8500,   // Eastern boundary  
      north: 22.4500   // Northern boundary
    }
  };

  /**
   * Navigate to city coordinates
   */
  const navigateToCity = (cityName: string) => {
    if (!map) return;
    
    const coords = cityCoordinates[cityName];
    if (coords) {
      // Use smooth flyTo animation like MonitoringMapComponent
      map.flyTo([coords.lat, coords.lng], coords.zoom, {
        animate: true,
        duration: 2 // 2 second animation
      });
      setSelectedCity(cityName);
      console.log(`🗺️ Navigated to ${cityName} at ${coords.lat}, ${coords.lng}`);
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
      let zoomLevel = 10; // Default city zoom for environmental analysis
      if (location.type === 'administrative') {
        zoomLevel = location.class === 'boundary' ? 8 : 10;
      } else if (location.type === 'city' || location.type === 'town') {
        zoomLevel = 9;
      } else if (location.type === 'village') {
        zoomLevel = 11;
      } else if (location.type === 'neighbourhood') {
        zoomLevel = 12;
      }

      // Animate to the found location with smooth transition
      map.flyTo([lat, lng], zoomLevel, {
        animate: true,
        duration: 2 // 2 second animation
      });

      setSelectedCity(''); // Clear selected city for custom searches
      console.log(`🗺️ Navigated to search result: ${displayName}`);

    } catch (error) {
      console.error(`❌ Error searching for location:`, error);
      setError(`Failed to search for "${searchQuery}". Please try again.`);
    } finally {
      setSearchLoading(false);
    }
  };

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
        const container = document.getElementById('heat-map');
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

        // Initialize map centered on New York
        const mapInstance = L.map('heat-map').setView([40.7128, -74.0060], 10);

        // Add base tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          
        }).addTo(mapInstance);

        // Only set map if component is still mounted
        if (mounted) {
          setMap(mapInstance);

          // Add event listener for map bounds change
          mapInstance.on('moveend', () => {
            const bounds = mapInstance.getBounds();
            const mapBounds: MapBounds = {
              west: bounds.getWest(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              north: bounds.getNorth()
            };
            console.log('🗺️ Map bounds changed:', mapBounds);
          });

          console.log('✅ Map initialized successfully');
        }
      } catch (error) {
        console.error('❌ Error initializing map:', error);
        // More specific error handling for map initialization
        if (mounted) {
          if (error instanceof Error && error.message.includes('Map container is already initialized')) {
            console.log('🔄 Map container conflict detected');
            setError('Map initialization conflict - please refresh the page');
          } else {
            setError('Failed to initialize map');
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
          console.log('🧹 Map cleaned up');
        } catch (cleanupError) {
          console.warn('⚠️ Error during map cleanup:', cleanupError);
        }
      }
    };
  }, []); // Empty dependency array to run only once

  /**
   * Get start and end dates based on selected year
   */
  const getDateRange = () => {
    const startDate = `${selectedYear}-01-01`;
    const endDate = `${selectedYear}-08-01`;
    return { startDate, endDate };
  };

  /**
   * Handle year slider change
   */
  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(event.target.value);
    setSelectedYear(year);
    console.log(`📅 Year changed to: ${year}`);
  };

  /**
   * Handle population year change
   */
  const handlePopulationYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value);
    setSelectedPopulationYear(year);
    console.log(`👥 Population year changed to: ${year}`);
  };

  /**
   * Fetch heat data for current map bounds
   */
  const fetchHeatDataForCurrentBounds = async () => {
    if (!map) {
      setError('Map not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bounds = map.getBounds();
      const mapBounds: MapBounds = {
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth()
      };

      console.log('🌡️ Fetching heat data for current bounds:', mapBounds);
      setLastRequestBounds(mapBounds);

      // Use selected year for date range
      const { startDate, endDate } = getDateRange();

      const response = await HeatService.getHeatData(mapBounds, startDate, endDate) as HeatApiResponse;

      console.log('📥 Heat data received:', response);

      if (response.success && response.data) {
        setHeatData(response);
        await addHeatOverlayToMap(response.data);
        
        // Start fetching time series data in background
        fetchTimeSeriesData(mapBounds, 'heat');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      console.error('❌ Error fetching heat data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch air quality data for current map bounds
   */
  const fetchAirQualityDataForCurrentBounds = async () => {
    if (!map) {
      setError('Map not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bounds = map.getBounds();
      const mapBounds: MapBounds = {
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth()
      };

      console.log('🌬️ Fetching air quality data for current bounds:', mapBounds);
      setLastRequestBounds(mapBounds);

      // Use exact format as specified
      const startDate = "2024-01-01";
      const endDate = "2024-08-01";

      const response = await AirQualityService.getAirQualityData(mapBounds, startDate, endDate) as AirQualityApiResponse;

      console.log('📥 Air quality data received:', response);

      if (response.success && response.data) {
        setAirQualityData(response);
        await addAirQualityOverlayToMap(response.data);
        
        // Start fetching time series data in background
        fetchTimeSeriesData(mapBounds, 'airquality');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      console.error('❌ Error fetching air quality data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch heat data for a specific city
   */
  const fetchCityHeatData = async (cityName: string) => {
    setLoading(true);
    setError(null);

    // Always navigate to the city first
    navigateToCity(cityName);

    try {
      console.log('🏙️ Fetching heat data for city:', cityName);

      // Use selected year for date range
      const { startDate, endDate } = getDateRange();

      let response: HeatApiResponse;

      // For Dhaka and Chittagong, use bounds-based API call
      if (cityBounds[cityName]) {
        console.log(`🌐 Using bounds-based API call for ${cityName}`);
        const bounds = cityBounds[cityName];
        response = await HeatService.getHeatData(bounds, startDate, endDate) as HeatApiResponse;
      } else {
        // For other cities, use city name API call
        response = await HeatService.getCityHeatData(cityName, startDate, endDate) as HeatApiResponse;
      }

      console.log('📥 City heat data received:', response);

      if (response.success && response.data) {
        setHeatData(response);
        await addHeatOverlayToMap(response.data);
        
        // Zoom to city bounds if overlayBounds are provided with smooth animation
        if (map && response.data.overlayBounds) {
          const bounds = [
            [response.data.overlayBounds.southwest.lat, response.data.overlayBounds.southwest.lng],
            [response.data.overlayBounds.northeast.lat, response.data.overlayBounds.northeast.lng]
          ];
          map.fitBounds(bounds, {
            animate: true,
            duration: 2 // 2 second animation
          });
          console.log('🔍 Zoomed to city bounds with smooth transition');
        }

        // Start fetching time series data in background using city bounds or request bounds
        const boundsForTimeSeries = cityBounds[cityName] || {
          west: response.data.bounds.west,
          south: response.data.bounds.south,
          east: response.data.bounds.east,
          north: response.data.bounds.north
        };
        fetchTimeSeriesData(boundsForTimeSeries, 'heat');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      console.error('❌ Error fetching city heat data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch air quality data for a specific city
   */
  const fetchCityAirQualityData = async (cityName: string) => {
    setLoading(true);
    setError(null);

    // Always navigate to the city first
    navigateToCity(cityName);

    try {
      console.log('🏙️ Fetching air quality data for city:', cityName);

      // Use exact format as specified
      const startDate = "2024-01-01";
      const endDate = "2024-08-01";

      let response: AirQualityApiResponse;

      // For Dhaka and Chittagong, use bounds-based API call
      if (cityBounds[cityName]) {
        console.log(`🌐 Using bounds-based API call for ${cityName}`);
        const bounds = cityBounds[cityName];
        response = await AirQualityService.getAirQualityData(bounds, startDate, endDate) as AirQualityApiResponse;
      } else {
        // For other cities, use city name API call
        response = await AirQualityService.getCityAirQualityData(cityName, startDate, endDate) as AirQualityApiResponse;
      }

      console.log('📥 City air quality data received:', response);

      if (response.success && response.data) {
        setAirQualityData(response);
        await addAirQualityOverlayToMap(response.data);
        
        // Zoom to city bounds if overlayBounds are provided with smooth animation
        if (map && response.data.overlayBounds) {
          const bounds = [
            [response.data.overlayBounds.southwest.lat, response.data.overlayBounds.southwest.lng],
            [response.data.overlayBounds.northeast.lat, response.data.overlayBounds.northeast.lng]
          ];
          map.fitBounds(bounds, {
            animate: true,
            duration: 2 // 2 second animation
          });
          console.log('🔍 Zoomed to city bounds with smooth transition');
        }

        // Start fetching time series data in background using city bounds or request bounds
        const boundsForTimeSeries = cityBounds[cityName] || {
          west: response.data.bounds.west,
          south: response.data.bounds.south,
          east: response.data.bounds.east,
          north: response.data.bounds.north
        };
        fetchTimeSeriesData(boundsForTimeSeries, 'airquality');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      console.error('❌ Error fetching city air quality data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch population data for current map bounds
   */
  const fetchPopulationDataForCurrentBounds = async () => {
    if (!map) {
      setError('Map not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bounds = map.getBounds();
      const mapBounds: MapBounds = {
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth()
      };

      console.log('👥 Fetching population data for current bounds:', mapBounds);
      setLastRequestBounds(mapBounds);

      const response = await PopulationService.getPopulationData(mapBounds, selectedPopulationYear) as PopulationApiResponse;

      console.log('📥 Population data received:', response);

      if (response.success && response.data) {
        setPopulationData(response);
        await addPopulationOverlayToMap(response.data);
        
        // Start fetching time series data in background
        fetchTimeSeriesData(mapBounds, 'population');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      console.error('❌ Error fetching population data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch population data for a specific city
   */
  const fetchCityPopulationData = async (cityName: string) => {
    setLoading(true);
    setError(null);

    // Always navigate to the city first
    navigateToCity(cityName);

    try {
      console.log('🏙️ Fetching population data for city:', cityName);

      let response: PopulationApiResponse;

      // For Dhaka and Chittagong, use bounds-based API call
      if (cityBounds[cityName]) {
        console.log(`🌐 Using bounds-based API call for ${cityName}`);
        const bounds = cityBounds[cityName];
        response = await PopulationService.getPopulationData(bounds, selectedPopulationYear) as PopulationApiResponse;
      } else {
        // For other cities, use city name API call
        response = await PopulationService.getCityPopulationData(cityName, selectedPopulationYear) as PopulationApiResponse;
      }

      console.log('📥 City population data received:', response);

      if (response.success && response.data) {
        setPopulationData(response);
        await addPopulationOverlayToMap(response.data);
        
        // Zoom to city bounds if overlayBounds are provided with smooth animation
        if (map && response.data.overlayBounds) {
          const bounds = [
            [response.data.overlayBounds.southwest.lat, response.data.overlayBounds.southwest.lng],
            [response.data.overlayBounds.northeast.lat, response.data.overlayBounds.northeast.lng]
          ];
          map.fitBounds(bounds, {
            animate: true,
            duration: 2 // 2 second animation
          });
          console.log('🔍 Zoomed to city bounds with smooth transition');
        }

        // Start fetching time series data in background using city bounds or request bounds
        const boundsForTimeSeries = cityBounds[cityName] || {
          west: response.data.bounds.west,
          south: response.data.bounds.south,
          east: response.data.bounds.east,
          north: response.data.bounds.north
        };
        fetchTimeSeriesData(boundsForTimeSeries, 'population');
      } else {
        throw new Error('Invalid response format');
      }

    } catch (err) {
      console.error('❌ Error fetching city population data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add heat overlay to the map using the exact response format
   */
  const addHeatOverlayToMap = async (data: HeatDataResponse) => {
    if (!map) {
      console.error('❌ Map not available for overlay');
      return;
    }

    try {
      const L = (await import('leaflet')).default;

      // Remove existing overlays
      if (heatOverlay) {
        map.removeLayer(heatOverlay);
        console.log('🗑️ Removed previous heat overlay');
      }
      if (airQualityOverlay) {
        map.removeLayer(airQualityOverlay);
        setAirQualityOverlay(null);
        console.log('🗑️ Removed air quality overlay');
      }

      // Validate required data
      if (!data.imageUrl || !data.overlayBounds) {
        throw new Error('Missing imageUrl or overlayBounds in response');
      }

      // Add new heat overlay using exact response format
      const overlay = L.imageOverlay(
        data.imageUrl,
        [
          [data.overlayBounds.southwest.lat, data.overlayBounds.southwest.lng],
          [data.overlayBounds.northeast.lat, data.overlayBounds.northeast.lng]
        ],
        {
          opacity: 0.7,
          alt: 'Urban Heat Island Map'
        }
      ).addTo(map);

      setHeatOverlay(overlay);
      setDataType('heat');

      console.log('✅ Heat overlay added to map');
      console.log('🌡️ Heat Island Intensity:', data.statistics?.heatIslandIntensity + '°C');
      
    } catch (error) {
      console.error('❌ Error adding heat overlay:', error);
      setError('Failed to add heat overlay to map');
    }
  };

  /**
   * Add air quality overlay to the map using the exact response format
   */
  const addAirQualityOverlayToMap = async (data: AirQualityDataResponse) => {
    if (!map) {
      console.error('❌ Map not available for overlay');
      return;
    }

    try {
      const L = (await import('leaflet')).default;

      // Remove existing overlays
      if (airQualityOverlay) {
        map.removeLayer(airQualityOverlay);
        console.log('🗑️ Removed previous air quality overlay');
      }
      if (heatOverlay) {
        map.removeLayer(heatOverlay);
        setHeatOverlay(null);
        console.log('🗑️ Removed heat overlay');
      }

      // Validate required data
      if (!data.imageUrl || !data.overlayBounds) {
        throw new Error('Missing imageUrl or overlayBounds in response');
      }

      // Add new air quality overlay using exact response format
      const overlay = L.imageOverlay(
        data.imageUrl,
        [
          [data.overlayBounds.southwest.lat, data.overlayBounds.southwest.lng],
          [data.overlayBounds.northeast.lat, data.overlayBounds.northeast.lng]
        ],
        {
          opacity: 0.7,
          alt: 'Air Quality Map'
        }
      ).addTo(map);

      setAirQualityOverlay(overlay);
      setDataType('airquality');

      console.log('✅ Air quality overlay added to map');
      console.log('🌬️ Air Quality Difference:', data.statistics?.airQualityDifference + '%');
      
    } catch (error) {
      console.error('❌ Error adding air quality overlay:', error);
      setError('Failed to add air quality overlay to map');
    }
  };

  /**
   * Add population overlay to the map using the exact response format
   */
  const addPopulationOverlayToMap = async (data: PopulationDataResponse) => {
    if (!map) {
      console.error('❌ Map not available for overlay');
      return;
    }

    try {
      const L = (await import('leaflet')).default;

      // Remove existing overlays
      if (populationOverlay) {
        map.removeLayer(populationOverlay);
        console.log('🗑️ Removed previous population overlay');
      }
      if (heatOverlay) {
        map.removeLayer(heatOverlay);
        setHeatOverlay(null);
        console.log('🗑️ Removed heat overlay');
      }
      if (airQualityOverlay) {
        map.removeLayer(airQualityOverlay);
        setAirQualityOverlay(null);
        console.log('🗑️ Removed air quality overlay');
      }

      // Validate required data
      if (!data.imageUrl || !data.overlayBounds) {
        throw new Error('Missing imageUrl or overlayBounds in response');
      }

      // Add new population overlay using exact response format
      const overlay = L.imageOverlay(
        data.imageUrl,
        [
          [data.overlayBounds.southwest.lat, data.overlayBounds.southwest.lng],
          [data.overlayBounds.northeast.lat, data.overlayBounds.northeast.lng]
        ],
        {
          opacity: 0.7,
          alt: 'Population Density Map'
        }
      ).addTo(map);

      setPopulationOverlay(overlay);
      setDataType('population');

      console.log('✅ Population overlay added to map');
      console.log('👥 Total Population Estimate:', data.statistics?.estimatedTotalPopulation?.toLocaleString());
      
    } catch (error) {
      console.error('❌ Error adding population overlay:', error);
      setError('Failed to add population overlay to map');
    }
  };

  /**
   * Remove heat overlay from map
   */
  const removeHeatOverlay = () => {
    if (heatOverlay && map) {
      map.removeLayer(heatOverlay);
      setHeatOverlay(null);
      setHeatData(null);
      console.log('🗑️ Heat overlay removed');
    }
  };

  /**
   * Remove air quality overlay from map
   */
  const removeAirQualityOverlay = () => {
    if (airQualityOverlay && map) {
      map.removeLayer(airQualityOverlay);
      setAirQualityOverlay(null);
      setAirQualityData(null);
      console.log('🗑️ Air quality overlay removed');
    }
  };

  /**
   * Remove population overlay from map
   */
  const removePopulationOverlay = () => {
    if (populationOverlay && map) {
      map.removeLayer(populationOverlay);
      setPopulationOverlay(null);
      setPopulationData(null);
      console.log('🗑️ Population overlay removed');
    }
  };

  /**
   * Remove all overlays from map
   */
  const removeAllOverlays = () => {
    removeHeatOverlay();
    removeAirQualityOverlay();
    removePopulationOverlay();
    setDataType('heat'); // Reset to default
  };

  /**
   * Fetch data for current bounds based on selected data type
   */
  const fetchDataForCurrentBounds = async () => {
    if (!map) {
      setError('Map not initialized');
      return;
    }

    switch (dataType) {
      case 'heat':
        await fetchHeatDataForCurrentBounds();
        break;
      case 'airquality':
        await fetchAirQualityDataForCurrentBounds();
        break;
      case 'population':
        await fetchPopulationDataForCurrentBounds();
        break;
      default:
        setError('Invalid data type selected');
    }
  };

  /**
   * Fetch city data based on selected data type
   */
  const fetchCityData = async (cityName: string) => {
    if (!map) {
      setError('Map not initialized');
      return;
    }

    switch (dataType) {
      case 'heat':
        await fetchCityHeatData(cityName);
        break;
      case 'airquality':
        await fetchCityAirQualityData(cityName);
        break;
      case 'population':
        await fetchCityPopulationData(cityName);
        break;
      default:
        setError('Invalid data type selected');
    }
  };

  /**
   * Fetch time series data progressively starting from selected year
   */
  const fetchTimeSeriesData = async (bounds: MapBounds, currentDataType: 'heat' | 'airquality' | 'population') => {
    if (timeSeriesLoading) return;

    setTimeSeriesLoading(true);
    
    try {
      const startYear = currentDataType === 'population' ? selectedPopulationYear : selectedYear;
      const endYear = 2024;
      const baseYear = currentDataType === 'population' ? 2000 : 2000; // Population data starts from 2000
      
      // Clear existing time series for the current data type
      switch (currentDataType) {
        case 'heat':
          setHeatTimeSeries([]);
          break;
        case 'airquality':
          setAirQualityTimeSeries([]);
          break;
        case 'population':
          setPopulationTimeSeries([]);
          break;
      }

      // Create arrays to fetch years in order of priority (selected year first)
      const yearsToFetch: number[] = [];
      
      // Add selected year first
      yearsToFetch.push(startYear);
      
      // Add years around the selected year in expanding pattern
      for (let offset = 1; offset <= Math.max(startYear - baseYear, endYear - startYear); offset++) {
        if (startYear - offset >= baseYear) {
          yearsToFetch.push(startYear - offset);
        }
        if (startYear + offset <= endYear) {
          yearsToFetch.push(startYear + offset);
        }
      }

      // Remove duplicates and sort
      const uniqueYears = [...new Set(yearsToFetch)].sort((a, b) => {
        // Prioritize selected year and nearby years
        const distA = Math.abs(a - startYear);
        const distB = Math.abs(b - startYear);
        return distA - distB;
      });

      // Fetch data for each year progressively
      for (const year of uniqueYears) {
        try {
          let yearData: HeatYearPoint | AirQualityYearPoint | PopulationYearPoint | null = null;

          switch (currentDataType) {
            case 'heat': {
              const startDate = `${year}-01-01`;
              const endDate = `${year}-08-01`;
              const response = await HeatService.getHeatData(bounds, startDate, endDate) as HeatApiResponse;
              
              if (response.success && response.data.statistics) {
                yearData = {
                  year,
                  meanC: response.data.statistics.urbanMeanC,
                  sampleCount: response.data.statistics.imageCount,
                  hasData: response.data.statistics.imageCount > 0
                } as HeatYearPoint;
              }
              break;
            }
            case 'airquality': {
              const startDate = `${year}-01-01`;
              const endDate = `${year}-08-01`;
              const response = await AirQualityService.getAirQualityData(bounds, startDate, endDate) as AirQualityApiResponse;
              
              if (response.success && response.data.statistics) {
                yearData = {
                  year,
                  meanNO2: response.data.statistics.urbanMeanNO2,
                  sampleCount: response.data.statistics.no2ImageCount,
                  hasData: response.data.statistics.no2ImageCount > 0
                } as AirQualityYearPoint;
              }
              break;
            }
            case 'population': {
              const response = await PopulationService.getPopulationData(bounds, year) as PopulationApiResponse;
              
              if (response.success && response.data.statistics) {
                yearData = {
                  year,
                  meanDensity: response.data.statistics.urbanMeanDensity,
                  totalPopulation: response.data.statistics.estimatedTotalPopulation,
                  hasData: response.data.statistics.estimatedTotalPopulation > 0
                } as PopulationYearPoint;
              }
              break;
            }
          }

          // Add data point to the appropriate time series
          if (yearData) {
            switch (currentDataType) {
              case 'heat':
                setHeatTimeSeries(prev => {
                  const updated = [...prev, yearData as HeatYearPoint].sort((a, b) => a.year - b.year);
                  return updated;
                });
                break;
              case 'airquality':
                setAirQualityTimeSeries(prev => {
                  const updated = [...prev, yearData as AirQualityYearPoint].sort((a, b) => a.year - b.year);
                  return updated;
                });
                break;
              case 'population':
                setPopulationTimeSeries(prev => {
                  const updated = [...prev, yearData as PopulationYearPoint].sort((a, b) => a.year - b.year);
                  return updated;
                });
                break;
            }
          }

          // Add a small delay to allow UI to update and show progressive loading
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (yearError) {
          console.warn(`⚠️ Error fetching ${currentDataType} data for year ${year}:`, yearError);
          // Continue with next year instead of stopping
        }
      }

    } catch (error) {
      console.error(`❌ Error in time series fetch for ${currentDataType}:`, error);
    } finally {
      setTimeSeriesLoading(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Format processing time for display
   */
  const formatProcessingTime = (timeString: string) => {
    return timeString || 'N/A';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Enhanced CSS */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #4f46e5, #3b82f6);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
          transition: all 0.3s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.6);
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #4f46e5, #3b82f6);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
          transition: all 0.3s ease;
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.3);
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
          }
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      
      {/* Top Row: Map and Control Panel */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Map Container - Left side */}
        <div className="flex-1 lg:w-3/4">
          <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">🗺️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Environment Analysis
                  </h3>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Search Box */}
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
                
                {(heatData || airQualityData || populationData) && (
                  <div className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                    Data Loaded ✓
                  </div>
                )}
              </div>
            </div>
            <div 
              id="heat-map" 
              key="heat-map-container"
              className="w-full h-[600px] rounded-xl border-2 border-gray-300 shadow-inner bg-gray-100"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>

        {/* Control Panel - Rightside */}
        <div className="lg:w-1/5 lg:h-[705px]">
          <div className="p-2 bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl border border-blue-100 h-full flex flex-col">
            <div className="flex items-center mb-1">
              <div className="flex items-center space-x-1">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-lg">⚙️</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Controls
                  </h2>
                  <p className="text-base text-gray-600">Data analysis</p>
                </div>
              </div>
            </div>
            
            {/* Data Type Selector */}
            <div className="mb-2 p-1.5 bg-gradient-to-r from-slate-50 via-gray-50 to-zinc-50 rounded-lg border border-gray-200 shadow-lg">
              <div className="flex items-center mb-1">
                <div className="flex items-center space-x-1">
                  <div className="w-7 h-7 bg-gradient-to-r from-gray-500 to-slate-600 rounded flex items-center justify-center shadow">
                    <span className="text-white text-base">📊</span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-800">Data Type</h4>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => setDataType('heat')}
                  className={`px-4 py-2.5 rounded-md transition-colors text-base ${
                    dataType === 'heat' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  🌡️ Heat Data
                </button>
                
                <button
                  onClick={() => setDataType('airquality')}
                  className={`px-4 py-2.5 rounded-md transition-colors text-base ${
                    dataType === 'airquality' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
                  }`}
                >
                  🌬️ Air Quality
                </button>
                
                <button
                  onClick={() => setDataType('population')}
                  className={`px-4 py-2.5 rounded-md transition-colors text-base ${
                    dataType === 'population' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                  }`}
                >
                  👥 Population
                </button>
              </div>
            </div>

            {/* Year Slider */}
            <div className="mb-2 p-1.5 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-lg border border-indigo-200 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-blue-500 rounded flex items-center justify-center shadow">
                    <span className="text-white text-base">📅</span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-800">Year</h4>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    {selectedYear}
                  </div>
                </div>
              </div>
              
              <div className="relative mb-1">
                <input
                  id="year-slider"
                  type="range"
                  min="2000"
                  max="2024"
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="w-full h-1.5 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full appearance-none cursor-pointer slider shadow-inner"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #3b82f6 ${((selectedYear - 2000) / 24) * 100}%, #e0e7ff ${((selectedYear - 2000) / 24) * 100}%, #dbeafe 100%)`
                  }}
                />
                
                <div className="flex justify-between text-sm font-medium text-gray-500 mt-0.5">
                  <span className="bg-white px-1 py-0.5 rounded shadow-sm text-sm">2000</span>
                  <span className="bg-white px-1 py-0.5 rounded shadow-sm text-sm">2024</span>
                </div>
              </div>
              
              {/* Date range display */}
              <div className="p-1 bg-white/70 backdrop-blur-sm rounded-md border border-white/20 shadow-sm">
                <div className="text-base">
                  <div className="flex items-center space-x-1">
                    <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                    <span className="font-medium text-gray-700">Period:</span>
                  </div>
                  <span className="font-semibold text-indigo-600 text-base">
                    {getDateRange().startDate} to {getDateRange().endDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Population Year Selector - Only show when population is selected */}
            {dataType === 'population' && (
              <div className="mb-2 p-1.5 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-lg border border-green-200 shadow-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1">
                    <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 rounded flex items-center justify-center shadow">
                      <span className="text-white text-base">📅</span>
                    </div>
                    <div>
                      <label htmlFor="population-year" className="text-base font-semibold text-gray-800">
                        Pop Year
                      </label>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {selectedPopulationYear}
                    </div>
                  </div>
                </div>
                
                <select
                  id="population-year"
                  value={selectedPopulationYear}
                  onChange={handlePopulationYearChange}
                  className="w-full p-2.5 bg-white border border-green-300 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-base"
                >
                  <option value={2000}>2000</option>
                  <option value={2005}>2005</option>
                  <option value={2010}>2010</option>
                  <option value={2015}>2015</option>
                  <option value={2020}>2020</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-1 flex-1 flex flex-col justify-end">
              <button
                onClick={fetchDataForCurrentBounds}
                disabled={loading || !map}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow text-base"
              >
                {loading ? '⏳ Loading...' : '🔍 Analyze Current View'}
              </button>
              
              <button
                onClick={removeAllOverlays}
                disabled={!heatOverlay && !airQualityOverlay && !populationOverlay}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-md hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow text-base"
              >
                🧹 Clear All Layers
              </button>

              {/* Error Display */}
              {error && (
                <div className="mt-1 p-2.5 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-md">
                  <div className="text-base font-medium">⚠️ {error}</div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="mt-1 p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 rounded-md">
                  <div className="flex items-center space-x-1 mb-0.5">
                    <div className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="text-base font-medium">Processing...</div>
                  </div>
                  <div className="text-base font-medium leading-tight">This may take 10-30 secs depending on the selected area and the data of that area</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Compact City Controls */}
      <div className="mb-8">
        <div className="p-4 bg-gradient-to-r from-white via-gray-50 to-slate-100 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow">
                <span className="text-lg">🏙️</span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Quick City Access
                </h3>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {cityCoordinates[selectedCity]?.icon} {cityCoordinates[selectedCity]?.name}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(cityCoordinates).map(([cityKey, cityData]) => (
              <button
                key={cityKey}
                onClick={() => navigateToCity(cityKey)}
                disabled={!map}
                className={`px-3 py-2 rounded-md transition-colors text-sm ${
                  selectedCity === cityKey
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {cityData.icon} {cityData.name}
              </button>
            ))}
            
            {/* Data fetch and clear buttons */}
            <button
              onClick={() => {
                if (selectedCity && cityCoordinates[selectedCity]) {
                  fetchCityData(selectedCity);
                }
              }}
              disabled={!map || loading || !selectedCity}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              📊 Load Data
            </button>
            
            <button
              onClick={() => {
                if (dataType === 'heat') removeHeatOverlay();
                else if (dataType === 'airquality') removeAirQualityOverlay();
                else if (dataType === 'population') removePopulationOverlay();
              }}
              disabled={!heatOverlay && !airQualityOverlay && !populationOverlay}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Analysis Data Statistics */}
      {/* Heat Data Statistics - Enhanced Display */}
      {heatData && heatData.success && heatData.data && (
        <div className="mb-8 bg-gradient-to-br from-white via-orange-50 to-red-50 rounded-2xl shadow-2xl p-8 border border-orange-200">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🌡️</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Heat Island Analysis Results
              </h4>
              <p className="text-gray-600 mt-1">Comprehensive urban temperature analysis</p>
            </div>
          </div>
          
          {/* Temperature Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-50 to-pink-100 p-6 rounded-2xl border-2 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🔥</span>
                </div>
                <div className="text-xs font-medium text-red-500 bg-red-100 px-2 py-1 rounded-full">CRITICAL</div>
              </div>
              <div className="text-sm font-medium text-red-700 mb-2">Heat Island Intensity</div>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {heatData.data.statistics.heatIslandIntensity?.toFixed(1)}°C
              </div>
              <div className="text-xs text-red-500">Temperature difference</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-2xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🏙️</span>
                </div>
                <div className="text-xs font-medium text-orange-500 bg-orange-100 px-2 py-1 rounded-full">URBAN</div>
              </div>
              <div className="text-sm font-medium text-orange-700 mb-2">Urban Temperature</div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {heatData.data.statistics.urbanMeanC?.toFixed(1)}°C
              </div>
              <div className="text-xs text-orange-500">Average city temperature</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🌳</span>
                </div>
                <div className="text-xs font-medium text-green-500 bg-green-100 px-2 py-1 rounded-full">RURAL</div>
              </div>
              <div className="text-sm font-medium text-green-700 mb-2">Rural Temperature</div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {heatData.data.statistics.ruralMeanC?.toFixed(1)}°C
              </div>
              <div className="text-xs text-green-500">Countryside baseline</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">⭐</span>
                </div>
                <div className="text-xs font-medium text-blue-500 bg-blue-100 px-2 py-1 rounded-full">QUALITY</div>
              </div>
              <div className="text-sm font-medium text-blue-700 mb-2">Data Quality</div>
              <div className="text-3xl font-bold text-blue-600 mb-1 capitalize">
                {heatData.data.statistics.qualityScore || 'Good'}
              </div>
              <div className="text-xs text-blue-500">Analysis reliability</div>
            </div>
          </div>

          {/* Additional Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Temperature Range</div>
              <div className="text-lg font-semibold text-gray-800">
                {heatData.data.statistics.minTempC?.toFixed(1)}°C - {heatData.data.statistics.maxTempC?.toFixed(1)}°C
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Image Count</div>
              <div className="text-lg font-semibold text-gray-800">
                {heatData.data.statistics.imageCount} images
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Processing Time</div>
              <div className="text-lg font-semibold text-gray-800">
                {formatProcessingTime(heatData.metadata?.processingTime)}
              </div>
            </div>
          </div>

          {/* Yearly Temperature Time Series */}
          {(heatData?.data?.timeSeries && heatData.data.timeSeries.length > 0) || (heatTimeSeries && heatTimeSeries.length > 0) ? (
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">Yearly Mean Temperature</div>
                <div className="text-xs text-gray-500">Hot-season AOI mean (°C)</div>
                {timeSeriesLoading && (
                  <div className="text-xs text-blue-500 animate-pulse">Loading data...</div>
                )}
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={heatTimeSeries.length > 0 ? heatTimeSeries : heatData?.data?.timeSeries || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickMargin={8} />
                    <YAxis
                      tickMargin={8}
                      label={{ value: '°C', angle: -90, position: 'insideLeft' }}
                      allowDecimals
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload as HeatYearPoint;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-medium text-gray-900">{`Year: ${label}`}</p>
                              {data.hasData ? (
                                <>
                                  <p className="text-orange-600">{`Mean Temp: ${data.meanC?.toFixed(2)} °C`}</p>
                                  <p className="text-gray-600 text-sm">{`Samples: ${data.sampleCount} images`}</p>
                                </>
                              ) : (
                                <p className="text-gray-500">No data available</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {/* Don't connect gaps */}
                    <Line
                      type="linear"
                      dataKey="meanC"
                      connectNulls={false}
                      dot={{ r: 3, fill: '#f59e0b' }}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      isAnimationActive={true}
                    />
                    {/* Optional: highlight selected year */}
                    <ReferenceLine 
                      x={selectedYear} 
                      strokeDasharray="4 4" 
                      stroke="#ef4444"
                      strokeWidth={1}
                      label={{ value: `${selectedYear}`, position: 'top' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Gaps indicate years with no valid observations (clouds/QA mask). Red line shows selected year. 
                {timeSeriesLoading && " Data is loading progressively..."}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg mb-8">
              {timeSeriesLoading ? "Loading time series data..." : "No time series available for this area/date range."}
            </div>
          )}

          {/* Date Range Information */}
          {heatData.data.dateRange && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="text-sm font-medium text-blue-700 mb-2">Analysis Period</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Requested Start</div>
                  <div className="font-medium">{formatDate(heatData.data.dateRange.start)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Requested End</div>
                  <div className="font-medium">{formatDate(heatData.data.dateRange.end)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Actual Start</div>
                  <div className="font-medium">{formatDate(heatData.data.dateRange.actualStart)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Actual End</div>
                  <div className="font-medium">{formatDate(heatData.data.dateRange.actualEnd)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {heatData.metadata && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-3">Analysis Metadata</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Data Source</div>
                  <div className="font-medium">{heatData.metadata.dataSource}</div>
                </div>
                <div>
                  <div className="text-gray-600">Resolution</div>
                  <div className="font-medium">{heatData.metadata.resolution}</div>
                </div>
                <div>
                  <div className="text-gray-600">Cloud Cover Threshold</div>
                  <div className="font-medium">{heatData.metadata.cloudCoverThreshold}</div>
                </div>
                <div>
                  <div className="text-gray-600">Request ID</div>
                  <div className="font-medium font-mono text-xs">{heatData.metadata.requestId}</div>
                </div>
                <div>
                  <div className="text-gray-600">Timestamp</div>
                  <div className="font-medium">{formatDate(heatData.metadata.timestamp)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Color Scale Legend */}
          {heatData.data.visualizationParams && (
            <div className="mt-6 bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-3">Temperature Color Scale</div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{heatData.data.visualizationParams.min}°C</span>
                <div className="flex-1 h-4 rounded" style={{
                  background: `linear-gradient(to right, ${heatData.data.visualizationParams.palette.join(', ')})`
                }}></div>
                <span className="text-sm text-gray-600">{heatData.data.visualizationParams.max}°C</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Air Quality Data Statistics - Enhanced Display */}
      {airQualityData && airQualityData.success && airQualityData.data && (
        <div className="mb-8 bg-gradient-to-br from-white via-purple-50 to-indigo-50 rounded-2xl shadow-2xl p-8 border border-purple-200">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🌬️</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Air Quality Analysis Results
              </h4>
              <p className="text-gray-600 mt-1">Satellite-based pollution monitoring analysis</p>
            </div>
          </div>
          
          {/* Air Quality Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
                <div className="text-xs font-medium text-purple-500 bg-purple-100 px-2 py-1 rounded-full">DIFFERENCE</div>
              </div>
              <div className="text-sm font-medium text-purple-700 mb-2">Air Quality Difference</div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {airQualityData.data.statistics.airQualityDifference?.toFixed(1)}%
              </div>
              <div className="text-xs text-purple-500">Urban vs Rural variance</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-2xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🏙️</span>
                </div>
                <div className="text-xs font-medium text-orange-500 bg-orange-100 px-2 py-1 rounded-full">URBAN</div>
              </div>
              <div className="text-sm font-medium text-orange-700 mb-2">Urban NO₂</div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {airQualityData.data.statistics.urbanMeanNO2?.toFixed(3)}
              </div>
              <div className="text-xs text-orange-500">×10⁻⁶ mol/m²</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🌳</span>
                </div>
                <div className="text-xs font-medium text-green-500 bg-green-100 px-2 py-1 rounded-full">RURAL</div>
              </div>
              <div className="text-sm font-medium text-green-700 mb-2">Rural NO₂</div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {airQualityData.data.statistics.ruralMeanNO2?.toFixed(3)}
              </div>
              <div className="text-xs text-green-500">×10⁻⁶ mol/m²</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">⭐</span>
                </div>
                <div className="text-xs font-medium text-blue-500 bg-blue-100 px-2 py-1 rounded-full">QUALITY</div>
              </div>
              <div className="text-sm font-medium text-blue-700 mb-2">Data Quality</div>
              <div className="text-3xl font-bold text-blue-600 mb-1 capitalize">
                {airQualityData.data.statistics.no2ImageCount > 5 ? 'Excellent' : 
                 airQualityData.data.statistics.no2ImageCount > 2 ? 'Good' : 'Fair'}
              </div>
              <div className="text-xs text-blue-500">Analysis reliability</div>
            </div>
          </div>

          {/* Additional Air Quality Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">NO₂ Images</div>
              <div className="text-lg font-semibold text-gray-800">
                {airQualityData.data.statistics.no2ImageCount}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">CO Images</div>
              <div className="text-lg font-semibold text-gray-800">
                {airQualityData.data.statistics.coImageCount}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">SO₂ Images</div>
              <div className="text-lg font-semibold text-gray-800">
                {airQualityData.data.statistics.so2ImageCount}
              </div>
            </div>
          </div>

          {/* Date Range Info */}
          {airQualityData.data.dateRange && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-2">Analysis Period</div>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <span className="font-medium">Start Date:</span> {formatDate(airQualityData.data.dateRange.start)}
                </div>
                <div>
                  <span className="font-medium">End Date:</span> {formatDate(airQualityData.data.dateRange.end)}
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {airQualityData.metadata && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-3">Processing Information</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <div className="text-gray-600">Data Source</div>
                  <div className="font-medium">Sentinel-5P TROPOMI</div>
                </div>
                <div>
                  <div className="text-gray-600">Resolution</div>
                  <div className="font-medium">1113.2m</div>
                </div>
                <div>
                  <div className="text-gray-600">Processing Time</div>
                  <div className="font-medium">{formatProcessingTime(airQualityData.metadata.processingTime)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Request ID</div>
                  <div className="font-medium font-mono text-xs">{airQualityData.metadata.requestId}</div>
                </div>
              </div>
            </div>
          )}

          {/* Yearly Air Quality Time Series */}
          {airQualityTimeSeries && airQualityTimeSeries.length > 0 ? (
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">Yearly Mean NO₂ Concentration</div>
                <div className="text-xs text-gray-500">Annual AOI mean (×10⁻⁶ mol/m²)</div>
                {timeSeriesLoading && (
                  <div className="text-xs text-blue-500 animate-pulse">Loading data...</div>
                )}
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={airQualityTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickMargin={8} />
                    <YAxis
                      tickMargin={8}
                      label={{ value: 'NO₂ (×10⁻⁶ mol/m²)', angle: -90, position: 'insideLeft' }}
                      allowDecimals
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload as AirQualityYearPoint;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-medium text-gray-900">{`Year: ${label}`}</p>
                              {data.hasData ? (
                                <>
                                  <p className="text-purple-600">{`Mean NO₂: ${data.meanNO2?.toFixed(3)} ×10⁻⁶ mol/m²`}</p>
                                  <p className="text-gray-600 text-sm">{`Samples: ${data.sampleCount} images`}</p>
                                </>
                              ) : (
                                <p className="text-gray-500">No data available</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="linear"
                      dataKey="meanNO2"
                      connectNulls={false}
                      dot={{ r: 3, fill: '#8b5cf6' }}
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      isAnimationActive={true}
                    />
                    <ReferenceLine 
                      x={selectedYear} 
                      strokeDasharray="4 4" 
                      stroke="#ef4444"
                      strokeWidth={1}
                      label={{ value: `${selectedYear}`, position: 'top' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                NO₂ concentration trends over time. Red line shows selected year. 
                {timeSeriesLoading && " Data is loading progressively..."}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg mb-8">
              {timeSeriesLoading ? "Loading air quality time series data..." : "No air quality time series available for this area/date range."}
            </div>
          )}

          {/* Color Scale Legend */}
          {airQualityData.data.visualizationParams && (
            <div className="mt-6 bg-white border border-gray-200 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-3">NO₂ Concentration Color Scale</div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Low</span>
                <div className="flex-1 h-4 rounded" style={{
                  background: `linear-gradient(to right, ${airQualityData.data.visualizationParams.palette.join(', ')})`
                }}></div>
                <span className="text-sm text-gray-600">High</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Population Data Statistics - Enhanced Display */}
      {populationData && (
        <div className="mb-8 p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-2xl border border-green-200">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Population Density Analysis
              </h3>
              <p className="text-sm text-gray-600 mt-1">NASA SEDAC Gridded Population of the World (GPW)</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Population */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <div className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded-full">TOTAL</div>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {populationData.data.statistics?.estimatedTotalPopulation 
                  ? PopulationService.formatNumber(populationData.data.statistics.estimatedTotalPopulation)
                  : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Estimated Population</div>
            </div>

            {/* Urban Density */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🏙️</span>
                </div>
                <div className="text-xs text-gray-500 bg-emerald-100 px-2 py-1 rounded-full">URBAN</div>
              </div>
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {populationData.data.statistics?.urbanMeanDensity 
                  ? Math.round(populationData.data.statistics.urbanMeanDensity)
                  : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">People/km² (Urban)</div>
            </div>

            {/* Rural Density */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-teal-100 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🌾</span>
                </div>
                <div className="text-xs text-gray-500 bg-teal-100 px-2 py-1 rounded-full">RURAL</div>
              </div>
              <div className="text-3xl font-bold text-teal-600 mb-1">
                {populationData.data.statistics?.ruralMeanDensity 
                  ? Math.round(populationData.data.statistics.ruralMeanDensity)
                  : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">People/km² (Rural)</div>
            </div>

            {/* Area */}
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-green-100 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📐</span>
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">AREA</div>
              </div>
              <div className="text-3xl font-bold text-gray-600 mb-1">
                {populationData.data.statistics?.totalAreaKm2 
                  ? Math.round(populationData.data.statistics.totalAreaKm2)
                  : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Square Kilometers</div>
            </div>
          </div>

          {/* Analysis Year and Data Source */}
          {populationData.data.year && (
            <div className="mb-6 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-green-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Analysis Year:</span> {populationData.data.year}
                </div>
                <div>
                  <span className="font-medium">Data Resolution:</span> ~1km spatial resolution
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {populationData.metadata && (
            <div className="mb-6 bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-3">Processing Information</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <div className="text-gray-600">Data Source</div>
                  <div className="font-medium">NASA SEDAC GPW</div>
                </div>
                <div>
                  <div className="text-gray-600">Resolution</div>
                  <div className="font-medium">30 arc-seconds</div>
                </div>
                <div>
                  <div className="text-gray-600">Projection</div>
                  <div className="font-medium">WGS84</div>
                </div>
                <div>
                  <div className="text-gray-600">Algorithm</div>
                  <div className="font-medium">UN-adjusted estimates</div>
                </div>
              </div>
            </div>
          )}

          {/* Yearly Population Time Series */}
          {populationTimeSeries && populationTimeSeries.length > 0 ? (
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">Yearly Population Density</div>
                <div className="text-xs text-gray-500">People per km²</div>
                {timeSeriesLoading && (
                  <div className="text-xs text-blue-500 animate-pulse">Loading data...</div>
                )}
              </div>
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={populationTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickMargin={8} />
                    <YAxis
                      tickMargin={8}
                      label={{ value: 'Population Density (people/km²)', angle: -90, position: 'insideLeft' }}
                      allowDecimals
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload as PopulationYearPoint;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-medium text-gray-900">{`Year: ${label}`}</p>
                              {data.hasData ? (
                                <>
                                  <p className="text-green-600">{`Mean Density: ${data.meanDensity?.toFixed(1)} people/km²`}</p>
                                  <p className="text-emerald-600">{`Total Population: ${data.totalPopulation?.toLocaleString()}`}</p>
                                </>
                              ) : (
                                <p className="text-gray-500">No data available</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="linear"
                      dataKey="meanDensity"
                      connectNulls={false}
                      dot={{ r: 3, fill: '#10b981' }}
                      stroke="#10b981"
                      strokeWidth={2}
                      isAnimationActive={true}
                    />
                    <ReferenceLine 
                      x={selectedPopulationYear} 
                      strokeDasharray="4 4" 
                      stroke="#ef4444"
                      strokeWidth={1}
                      label={{ value: `${selectedPopulationYear}`, position: 'top' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Population density trends over time. Red line shows selected year. 
                {timeSeriesLoading && " Data is loading progressively..."}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg mb-8">
              {timeSeriesLoading ? "Loading population time series data..." : "No population time series available for this area/date range."}
            </div>
          )}

          {/* Color Scale Legend */}
          {populationData.data.visualizationParams && (
            <div className="mt-6 bg-white border border-green-200 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-3">Population Density Color Scale</div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Low Density</span>
                <div className="flex-1 h-4 rounded" style={{
                  background: `linear-gradient(to right, ${populationData.data.visualizationParams.palette.join(', ')})`
                }}></div>
                <span className="text-sm text-gray-600">High Density</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0 people/km²</span>
                <span>100</span>
                <span>1,000</span>
                <span>5,000</span>
                <span>10,000+</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedMapComponent;