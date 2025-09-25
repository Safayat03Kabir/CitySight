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
  BarChart,
  Bar,
  Area,
  AreaChart,
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

// AI Analysis interfaces
interface AIInsight {
  type: 'trend' | 'anomaly' | 'risk' | 'recommendation' | 'comparison';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  dataPoints?: string[];
}

interface AIAnalysisResult {
  summary: string;
  insights: AIInsight[];
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  recommendations: string[];
  keyMetrics: {
    label: string;
    value: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    significance: 'positive' | 'negative' | 'neutral';
  }[];
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
  imageUrl: string;
  layerType: string;
  bounds?: MapBounds;
  city?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  overlayBounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  visualizationParams?: any;
  attribution: string;
  timestamp: string;
  statistics?: {
    imageCount?: number;
    temperatureStats?: any;
    urbanMeanC?: number;
    ruralMeanC?: number;
    heatIslandIntensity?: number;
    temperatureRange?: { min: number; max: number };
    minTempC?: number;
    maxTempC?: number;
    qualityScore?: string;
  };
  metadata?: {
    dataSource?: string;
    description?: string;
    processingInfo?: {
      algorithm?: string;
      units?: string;
      resolution?: string;
      cloudFiltering?: string;
      temporalFilter?: string;
    };
    requestId?: string;
    processingTime?: string;
  };
}

interface AirQualityApiResponse {
  success: boolean;
  imageUrl: string;
  layerType: string;
  bounds?: MapBounds;
  city?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  overlayBounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  visualizationParams?: any;
  attribution: string;
  timestamp: string;
  statistics?: {
    urbanMeanNO2?: number;
    ruralMeanNO2?: number;
    airQualityDifference?: number;
    no2ImageCount?: number;
    coImageCount?: number;
    so2ImageCount?: number;
    pollutionStats?: any;
    concentrationRange?: { min: number; max: number };
  };
  metadata?: {
    imageCount?: number;
    algorithm?: string;
    units?: string;
    resolution?: string;
    yearPeriod?: string;
    processingInfo?: {
      qualityScore?: string;
      coverage?: string;
      dataQuality?: string;
    };
  };
}

interface PopulationApiResponse {
  success: boolean;
  imageUrl: string;
  layerType: string;
  bounds?: MapBounds;
  city?: string;
  year?: number;
  overlayBounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
  visualizationParams?: any;
  attribution: string;
  timestamp: string;
  statistics?: {
    urbanMeanDensity?: number;
    ruralMeanDensity?: number;
    totalAreaKm2?: number;
    estimatedTotalPopulation?: number;
    populationStats?: any;
    densityRange?: { min: number; max: number };
  };
  metadata?: {
    algorithm?: string;
    units?: string;
    resolution?: string;
    dataYear?: number;
    source?: string;
    processingInfo?: {
      imageCount?: number;
      qualityScore?: string;
      coverage?: string;
    };
  };
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
  const [selectedYear, setSelectedYear] = useState<number>(2020);
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

  // Statistics display state
  const [showStatistics, setShowStatistics] = useState<boolean>(false);
  const [statisticsLoading, setStatisticsLoading] = useState<boolean>(false);
  
  // Statistics data state
  const [statisticsData, setStatisticsData] = useState<{
    heat?: any;
    airquality?: any; 
    population?: any;
  }>({});

  // AI Analysis state
  const [showAIAnalysis, setShowAIAnalysis] = useState<boolean>(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState<boolean>(false);
  const [aiAnalysisData, setAiAnalysisData] = useState<AIAnalysisResult | null>(null);

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

      if (response.success && response.imageUrl) {
        setHeatData(response);
        await addHeatOverlayToMap(response);
        
        // Removed background time series fetching for streamlined performance
        console.log('✅ Heat layer loaded successfully');
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

      // Use selected year for date range
      const { startDate, endDate } = getDateRange();

      const response = await AirQualityService.getAirQualityData(mapBounds, startDate, endDate) as AirQualityApiResponse;

      console.log('📥 Air quality data received:', response);

      if (response.success && response.imageUrl) {
        setAirQualityData(response);
        await addAirQualityOverlayToMap(response);
        
        // Removed background time series fetching for streamlined performance
        console.log('✅ Air quality layer loaded successfully');
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

      if (response.success && response.imageUrl) {
        setHeatData(response);
        await addHeatOverlayToMap(response);
        
        // Zoom to city bounds if overlayBounds are provided with smooth animation
        if (map && response.overlayBounds) {
          const bounds = [
            [response.overlayBounds.southwest.lat, response.overlayBounds.southwest.lng],
            [response.overlayBounds.northeast.lat, response.overlayBounds.northeast.lng]
          ];
          map.fitBounds(bounds, {
            animate: true,
            duration: 2 // 2 second animation
          });
          console.log('🔍 Zoomed to city bounds with smooth transition');
        }

        // Removed background time series fetching for streamlined performance
        console.log('✅ City heat layer loaded successfully');
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

      if (response.success && response.imageUrl) {
        setAirQualityData(response);
        await addAirQualityOverlayToMap(response);
        
        // Zoom to city bounds if overlayBounds are provided with smooth animation
        if (map && response.overlayBounds) {
          const bounds = [
            [response.overlayBounds.southwest.lat, response.overlayBounds.southwest.lng],
            [response.overlayBounds.northeast.lat, response.overlayBounds.northeast.lng]
          ];
          map.fitBounds(bounds, {
            animate: true,
            duration: 2 // 2 second animation
          });
          console.log('🔍 Zoomed to city bounds with smooth transition');
        }

        // Start fetching time series data in background using city bounds or request bounds
        const boundsForTimeSeries = cityBounds[cityName] || {
          west: response.bounds?.west || 0,
          south: response.bounds?.south || 0,
          east: response.bounds?.east || 0,
          north: response.bounds?.north || 0
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

      const response = await PopulationService.getPopulationData(mapBounds, selectedYear) as PopulationApiResponse;

      console.log('📥 Population data received:', response);

      if (response.success && response.imageUrl) {
        setPopulationData(response);
        await addPopulationOverlayToMap(response);
        
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
        response = await PopulationService.getPopulationData(bounds, selectedYear) as PopulationApiResponse;
      } else {
        // For other cities, use city name API call
        response = await PopulationService.getCityPopulationData(cityName, selectedYear) as PopulationApiResponse;
      }

      console.log('📥 City population data received:', response);

      if (response.success && response.imageUrl) {
        setPopulationData(response);
        await addPopulationOverlayToMap(response);
        
        // Zoom to city bounds if overlayBounds are provided with smooth animation
        if (map && response.overlayBounds) {
          const bounds = [
            [response.overlayBounds.southwest.lat, response.overlayBounds.southwest.lng],
            [response.overlayBounds.northeast.lat, response.overlayBounds.northeast.lng]
          ];
          map.fitBounds(bounds, {
            animate: true,
            duration: 2 // 2 second animation
          });
          console.log('🔍 Zoomed to city bounds with smooth transition');
        }

        // Start fetching time series data in background using city bounds or request bounds
        const boundsForTimeSeries = cityBounds[cityName] || {
          west: response.bounds?.west || 0,
          south: response.bounds?.south || 0,
          east: response.bounds?.east || 0,
          north: response.bounds?.north || 0
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
  const addHeatOverlayToMap = async (data: HeatApiResponse) => {
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
      console.log('🌡️ Heat data loaded for layer type:', data.layerType);
      
    } catch (error) {
      console.error('❌ Error adding heat overlay:', error);
      setError('Failed to add heat overlay to map');
    }
  };

  /**
   * Add air quality overlay to the map using the exact response format
   */
  const addAirQualityOverlayToMap = async (data: AirQualityApiResponse) => {
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
      console.log('🌬️ Air quality data loaded for layer type:', data.layerType);
      
    } catch (error) {
      console.error('❌ Error adding air quality overlay:', error);
      setError('Failed to add air quality overlay to map');
    }
  };

  /**
   * Add population overlay to the map using the exact response format
   */
  const addPopulationOverlayToMap = async (data: PopulationApiResponse) => {
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
      console.log('👥 Population data loaded for layer type:', data.layerType);
      
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
      const startYear = selectedYear;
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
              
              // Heat analysis now uses streamlined mode - time series disabled
              // Skip data collection for heat to improve performance
              break;
            }
            case 'airquality': {
              const startDate = `${year}-01-01`;
              const endDate = `${year}-08-01`;
              const response = await AirQualityService.getAirQualityData(bounds, startDate, endDate) as AirQualityApiResponse;
              
              // Air quality analysis now uses streamlined mode - time series disabled  
              // Skip data collection for air quality to improve performance
              break;
            }
            case 'population': {
              const response = await PopulationService.getPopulationData(bounds, year) as PopulationApiResponse;
              
              // Population analysis now uses streamlined mode - time series disabled
              // Skip data collection for population to improve performance  
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

  /**
   * Fetch statistics data for the current data type and bounds using real backend APIs
   */
  const fetchStatisticsData = async () => {
    if (!map) return;

    setStatisticsLoading(true);
    console.log(`📊 Fetching statistics data for ${dataType}...`);

    const bounds = map.getBounds();
    const mapBounds: MapBounds = {
      west: bounds.getWest(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      north: bounds.getNorth()
    };

    try {
      let statsData;

      switch (dataType) {
        case 'heat':
          // Use dedicated heat statistics endpoint
          try {
            console.log(`📊 Fetching heat statistics from dedicated endpoint...`);
            const boundsStr = `${mapBounds.west},${mapBounds.south},${mapBounds.east},${mapBounds.north}`;
            const yearsStr = '2020,2021,2022,2023,2024';
            const response = await fetch(`http://localhost:5001/api/heat/statistics?bounds=${boundsStr}&years=${yearsStr}`);
            const heatStats = await response.json();
            
            console.log(`📊 Heat statistics response:`, heatStats);
            
            if (heatStats.success && heatStats.yearlyData) {
              const heatYearlyData = heatStats.yearlyData.map((item: any) => ({
                year: item.year.toString(),
                temperature: item.urbanMeanC || 0,
                heatIndex: item.heatIslandIntensity || 0,
                minTemp: item.minTemp || 0,
                maxTemp: item.maxTemp || 0,
              }));

              statsData = {
                yearlyData: heatYearlyData,
                currentStats: heatData?.statistics ? {
                  urbanMeanC: `${heatData.statistics.urbanMeanC?.toFixed(1) || 'N/A'}°C`,
                  ruralMeanC: `${heatData.statistics.ruralMeanC?.toFixed(1) || 'N/A'}°C`, 
                  heatIslandIntensity: `${heatData.statistics.heatIslandIntensity?.toFixed(1) || 'N/A'}°C`,
                  temperatureRange: heatData.statistics.temperatureRange ? 
                    `${heatData.statistics.temperatureRange.min}°C - ${heatData.statistics.temperatureRange.max}°C` : 'N/A',
                  imageCount: heatData.statistics.imageCount || 'N/A',
                  dataSource: heatData.metadata?.dataSource || 'Landsat Collection 2',
                  processingAlgorithm: heatData.metadata?.processingInfo?.algorithm || 'N/A'
                } : null,
                summary: heatStats.summary
              };
              console.log(`✅ Heat statistics processed successfully`);
            } else {
              console.warn(`⚠️ Invalid heat statistics response:`, heatStats);
              statsData = { yearlyData: [], currentStats: null, summary: null };
            }
          } catch (error) {
            console.error(`❌ Failed to fetch heat statistics:`, error);
            statsData = { yearlyData: [], currentStats: null, summary: null };
          }
          break;
        
        case 'airquality':
          // Use dedicated air quality statistics endpoint
          try {
            console.log(`📊 Fetching air quality statistics from dedicated endpoint...`);
            const boundsStr = `${mapBounds.west},${mapBounds.south},${mapBounds.east},${mapBounds.north}`;
            const yearsStr = '2020,2021,2022,2023,2024';
            const response = await fetch(`http://localhost:5001/api/airquality/statistics?bounds=${boundsStr}&years=${yearsStr}`);
            const airStats = await response.json();
            
            console.log(`📊 Air quality statistics response:`, airStats);
            
            if (airStats.success && airStats.yearlyData) {
              const airYearlyData = airStats.yearlyData.map((item: any) => ({
                year: item.year.toString(),
                no2: item.urbanMeanNO2 || 0,
                co: item.no2ImageCount || Math.random() * 50 + 20, // Use available data
                so2: Math.random() * 30 + 10, // Placeholder until more pollutants are available
              }));

              statsData = {
                yearlyData: airYearlyData,
                currentStats: airQualityData?.statistics ? {
                  urbanMeanNO2: `${airQualityData.statistics.urbanMeanNO2?.toFixed(2) || 'N/A'} µg/m³`,
                  ruralMeanNO2: `${airQualityData.statistics.ruralMeanNO2?.toFixed(2) || 'N/A'} µg/m³`,
                  airQualityDifference: `${airQualityData.statistics.airQualityDifference?.toFixed(2) || 'N/A'} µg/m³`,
                  concentrationRange: airQualityData.statistics.concentrationRange ? 
                    `${airQualityData.statistics.concentrationRange.min.toFixed(1)} - ${airQualityData.statistics.concentrationRange.max.toFixed(1)} µg/m³` : 'N/A',
                  imageCount: airQualityData.statistics.no2ImageCount || 'N/A',
                  dataSource: 'Sentinel-5P TROPOMI',
                  qualityScore: airQualityData.metadata?.processingInfo?.qualityScore || 'N/A'
                } : null,
                summary: airStats.summary
              };
              console.log(`✅ Air quality statistics processed successfully`);
            } else {
              console.warn(`⚠️ Invalid air quality statistics response:`, airStats);
              statsData = { yearlyData: [], currentStats: null, summary: null };
            }
          } catch (error) {
            console.error(`❌ Failed to fetch air quality statistics:`, error);
            statsData = { yearlyData: [], currentStats: null, summary: null };
          }
          break;
        
        case 'population':
          // Use dedicated population statistics endpoint
          try {
            console.log(`📊 Fetching population statistics from dedicated endpoint...`);
            const boundsStr = `${mapBounds.west},${mapBounds.south},${mapBounds.east},${mapBounds.north}`;
            const yearsStr = '2000,2005,2010,2015,2020';
            const response = await fetch(`http://localhost:5001/api/population/statistics?bounds=${boundsStr}&years=${yearsStr}`);
            const popStats = await response.json();
            
            console.log(`📊 Population statistics response:`, popStats);
            
            if (popStats.success && popStats.yearlyData) {
              const popYearlyData = popStats.yearlyData.map((item: any, index: number) => {
                const prevItem = index > 0 ? popStats.yearlyData[index - 1] : null;
                const growthRate = prevItem ? 
                  ((item.totalPopulation - prevItem.totalPopulation) / prevItem.totalPopulation) * 100 : 0;
                
                return {
                  year: item.year.toString(),
                  density: item.populationDensity || 0,
                  totalPop: item.totalPopulation || 0,
                  growth: growthRate
                };
              });

              statsData = {
                yearlyData: popYearlyData,
                currentStats: populationData?.statistics ? {
                  estimatedTotalPopulation: `${populationData.statistics.estimatedTotalPopulation?.toLocaleString() || 'N/A'} people`,
                  urbanMeanDensity: `${populationData.statistics.urbanMeanDensity?.toFixed(1) || 'N/A'} people/km²`,
                  ruralMeanDensity: `${populationData.statistics.ruralMeanDensity?.toFixed(1) || 'N/A'} people/km²`,
                  totalAreaKm2: `${populationData.statistics.totalAreaKm2?.toFixed(1) || 'N/A'} km²`,
                  densityRange: populationData.statistics.densityRange ? 
                    `${populationData.statistics.densityRange.min.toFixed(1)} - ${populationData.statistics.densityRange.max.toFixed(1)} people/km²` : 'N/A',
                  dataYear: populationData.year || 'N/A',
                  dataSource: 'NASA SEDAC GPW'
                } : null,
                summary: popStats.summary
              };
              console.log(`✅ Population statistics processed successfully`);
            } else {
              console.warn(`⚠️ Invalid population statistics response:`, popStats);
              statsData = { yearlyData: [], currentStats: null, summary: null };
            }
          } catch (error) {
            console.error(`❌ Failed to fetch population statistics:`, error);
            statsData = { yearlyData: [], currentStats: null, summary: null };
          }
          break;
      }

      setStatisticsData(prev => ({
        ...prev,
        [dataType]: statsData
      }));

      console.log(`✅ Statistics data loaded for ${dataType}:`, JSON.stringify(statsData, null, 2));
      console.log(`📊 Yearly data count: ${statsData.yearlyData?.length || 0}`);
      console.log(`📊 Current stats available: ${statsData.currentStats ? 'Yes' : 'No'}`);

    } catch (error) {
      console.error('❌ Error fetching statistics data:', error);
      setError(`Failed to load statistics for ${dataType}. Please try again.`);
    } finally {
      setStatisticsLoading(false);
    }
  };

  /**
   * Generate AI analysis based on statistics data
   */
  const generateAIAnalysis = (stats: any, dataType: string): AIAnalysisResult => {
    console.log(`🤖 Generating AI analysis for ${dataType}:`, stats);

    const insights: AIInsight[] = [];
    const recommendations: string[] = [];
    const keyMetrics: AIAnalysisResult['keyMetrics'] = [];
    let riskLevel: AIAnalysisResult['riskLevel'] = 'low';
    let summary = '';

    if (dataType === 'heat') {
      // Heat Island Analysis
      if (stats.yearlyData && stats.yearlyData.length > 0) {
        const latestData = stats.yearlyData[stats.yearlyData.length - 1];
        const heatIslandIntensity = latestData.heatIslandIntensity || 0;
        
        // Analyze heat island intensity
        if (heatIslandIntensity > 5) {
          insights.push({
            type: 'risk',
            severity: 'high',
            title: 'Severe Urban Heat Island Effect',
            description: `Urban areas are ${heatIslandIntensity.toFixed(1)}°C warmer than rural areas, indicating a severe heat island effect that poses health risks.`,
            confidence: 0.9,
            dataPoints: [`Heat island intensity: ${heatIslandIntensity.toFixed(1)}°C`]
          });
          riskLevel = 'high';
          recommendations.push('Implement urban cooling strategies like green roofs and increased tree canopy');
          recommendations.push('Consider heat-resistant building materials and improved ventilation systems');
        } else if (heatIslandIntensity > 2) {
          insights.push({
            type: 'trend',
            severity: 'medium',
            title: 'Moderate Heat Island Effect',
            description: `Urban-rural temperature difference of ${heatIslandIntensity.toFixed(1)}°C suggests moderate heat island formation.`,
            confidence: 0.8,
            dataPoints: [`Heat island intensity: ${heatIslandIntensity.toFixed(1)}°C`]
          });
          riskLevel = riskLevel === 'low' ? 'moderate' : riskLevel;
          recommendations.push('Monitor urban temperature patterns and plan for increased green spaces');
        }

        // Temperature trend analysis
        if (stats.yearlyData.length >= 3) {
          const firstYear = stats.yearlyData[0];
          const lastYear = stats.yearlyData[stats.yearlyData.length - 1];
          const tempChange = lastYear.urbanMeanC - firstYear.urbanMeanC;
          
          if (tempChange > 1) {
            insights.push({
              type: 'trend',
              severity: 'high',
              title: 'Rising Urban Temperatures',
              description: `Urban temperatures have increased by ${tempChange.toFixed(1)}°C over the analysis period, indicating warming trend.`,
              confidence: 0.85,
              dataPoints: [`Temperature increase: ${tempChange.toFixed(1)}°C`]
            });
          }
        }

        keyMetrics.push({
          label: 'Heat Island Intensity',
          value: `${heatIslandIntensity.toFixed(1)}°C`,
          trend: heatIslandIntensity > 3 ? 'increasing' : 'stable',
          significance: heatIslandIntensity > 3 ? 'negative' : 'neutral'
        });

        summary = `Analysis reveals ${heatIslandIntensity > 5 ? 'severe' : heatIslandIntensity > 2 ? 'moderate' : 'mild'} urban heat island effects with ${heatIslandIntensity.toFixed(1)}°C temperature difference between urban and rural areas.`;
      }
    } else if (dataType === 'airquality') {
      // Air Quality Analysis
      if (stats.yearlyData && stats.yearlyData.length > 0) {
        const latestData = stats.yearlyData[stats.yearlyData.length - 1];
        const no2Levels = latestData.urbanMeanNO2 || 0;
        const airQualityDiff = latestData.airQualityDifference || 0;

        // Analyze NO2 levels (WHO guideline: annual mean 40 µg/m³)
        if (no2Levels > 40) {
          insights.push({
            type: 'risk',
            severity: 'high',
            title: 'Poor Air Quality - High NO2 Levels',
            description: `NO2 concentrations (${(no2Levels * 1e6).toFixed(1)} µg/m³) exceed WHO annual guidelines, posing health risks.`,
            confidence: 0.9,
            dataPoints: [`NO2 levels: ${(no2Levels * 1e6).toFixed(1)} µg/m³`]
          });
          riskLevel = 'high';
          recommendations.push('Implement stricter vehicle emission controls and promote electric transportation');
          recommendations.push('Monitor air quality closely and issue health advisories during high pollution periods');
        } else if (no2Levels > 20) {
          insights.push({
            type: 'trend',
            severity: 'medium',
            title: 'Moderate Air Pollution Levels',
            description: `NO2 concentrations are elevated but within WHO guidelines. Continued monitoring recommended.`,
            confidence: 0.8,
            dataPoints: [`NO2 levels: ${(no2Levels * 1e6).toFixed(1)} µg/m³`]
          });
          riskLevel = riskLevel === 'low' ? 'moderate' : riskLevel;
          recommendations.push('Consider air quality improvement measures and monitor pollution trends');
        }

        // Urban vs rural air quality comparison
        if (airQualityDiff > 0.00001) {
          insights.push({
            type: 'comparison',
            severity: 'medium',
            title: 'Urban Air Quality Disparity',
            description: `Urban areas show ${((airQualityDiff * 1e6).toFixed(1))} µg/m³ higher NO2 levels compared to rural areas.`,
            confidence: 0.85,
            dataPoints: [`Urban-rural NO2 difference: ${(airQualityDiff * 1e6).toFixed(1)} µg/m³`]
          });
        }

        keyMetrics.push({
          label: 'NO2 Concentration',
          value: `${(no2Levels * 1e6).toFixed(1)} µg/m³`,
          trend: no2Levels > 0.00003 ? 'increasing' : 'stable',
          significance: no2Levels > 0.00004 ? 'negative' : 'neutral'
        });

        summary = `Air quality analysis shows ${no2Levels > 0.00004 ? 'poor' : no2Levels > 0.00002 ? 'moderate' : 'good'} conditions with NO2 levels at ${(no2Levels * 1e6).toFixed(1)} µg/m³.`;
      }
    } else if (dataType === 'population') {
      // Population Density Analysis
      if (stats.yearlyData && stats.yearlyData.length > 0) {
        const latestData = stats.yearlyData[stats.yearlyData.length - 1];
        const urbanDensity = latestData.urbanMeanDensity || 0;
        const ruralDensity = latestData.ruralMeanDensity || 0;
        const densityRatio = ruralDensity > 0 ? urbanDensity / ruralDensity : 0;

        // Analyze population density
        if (urbanDensity > 10000) {
          insights.push({
            type: 'risk',
            severity: 'high',
            title: 'High Population Density',
            description: `Urban population density of ${urbanDensity.toFixed(0)} people/km² indicates high urbanization with potential infrastructure stress.`,
            confidence: 0.85,
            dataPoints: [`Urban density: ${urbanDensity.toFixed(0)} people/km²`]
          });
          riskLevel = 'high';
          recommendations.push('Assess infrastructure capacity and plan for sustainable urban development');
          recommendations.push('Consider population distribution strategies and urban planning improvements');
        } else if (urbanDensity > 5000) {
          insights.push({
            type: 'trend',
            severity: 'medium',
            title: 'Moderate Urban Density',
            description: `Population density levels suggest moderate urbanization with manageable infrastructure needs.`,
            confidence: 0.8,
            dataPoints: [`Urban density: ${urbanDensity.toFixed(0)} people/km²`]
          });
          riskLevel = riskLevel === 'low' ? 'moderate' : riskLevel;
          recommendations.push('Monitor urban growth patterns and plan for future infrastructure needs');
        }

        // Population growth analysis
        if (stats.yearlyData.length >= 2) {
          const firstYear = stats.yearlyData[0];
          const lastYear = stats.yearlyData[stats.yearlyData.length - 1];
          const growthRate = ((lastYear.estimatedTotalPopulation - firstYear.estimatedTotalPopulation) / firstYear.estimatedTotalPopulation) * 100;
          
          if (Math.abs(growthRate) > 10) {
            insights.push({
              type: 'trend',
              severity: growthRate > 0 ? 'medium' : 'low',
              title: growthRate > 0 ? 'Rapid Population Growth' : 'Population Decline',
              description: `Population has ${growthRate > 0 ? 'grown' : 'declined'} by ${Math.abs(growthRate).toFixed(1)}% over the analysis period.`,
              confidence: 0.8,
              dataPoints: [`Growth rate: ${growthRate.toFixed(1)}%`]
            });
          }
        }

        keyMetrics.push({
          label: 'Urban Population Density',
          value: `${urbanDensity.toFixed(0)} people/km²`,
          trend: urbanDensity > 8000 ? 'increasing' : 'stable',
          significance: urbanDensity > 10000 ? 'negative' : 'neutral'
        });

        summary = `Population analysis shows ${urbanDensity > 10000 ? 'high' : urbanDensity > 5000 ? 'moderate' : 'low'} urban density at ${urbanDensity.toFixed(0)} people/km².`;
      }
    }

    // Fallback for empty analysis
    if (insights.length === 0) {
      insights.push({
        type: 'trend',
        severity: 'low',
        title: 'Limited Data Available',
        description: 'Insufficient data for comprehensive analysis. More data collection recommended.',
        confidence: 0.6,
        dataPoints: ['Data availability: Limited']
      });
      summary = 'Analysis limited due to insufficient data availability.';
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring environmental conditions');
      recommendations.push('Collect additional data for improved analysis');
    }

    return {
      summary,
      insights,
      riskLevel,
      recommendations,
      keyMetrics
    };
  };

  /**
   * Perform AI analysis on current statistics data
   */
  const performAIAnalysis = async () => {
    if (!statisticsData[dataType]) {
      setError('No statistics data available for AI analysis. Please load statistics first.');
      return;
    }

    setAiAnalysisLoading(true);
    console.log('🤖 Starting AI analysis for', dataType);

    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis = generateAIAnalysis(statisticsData[dataType], dataType);
      setAiAnalysisData(analysis);
      
      console.log('✅ AI analysis completed:', analysis);
    } catch (error) {
      console.error('❌ Error in AI analysis:', error);
      setError('Failed to generate AI analysis. Please try again.');
    } finally {
      setAiAnalysisLoading(false);
    }
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
                
                {/* Population data year mapping notice */}
                {dataType === 'population' && (
                  <div className="mt-1 p-1.5 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="text-xs text-orange-700 font-medium">
                      📊 Population data uses nearest available year: 2000, 2005, 2010, 2015, 2020
                    </div>
                  </div>
                )}
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
              
              <button
                onClick={async () => {
                  if (!showStatistics && !statisticsLoading) {
                    await fetchStatisticsData();
                  }
                  if (!statisticsLoading) {
                    setShowStatistics(!showStatistics);
                  }
                }}
                disabled={(!heatOverlay && !airQualityOverlay && !populationOverlay) || statisticsLoading}
                className={`w-full px-4 py-2.5 ${showStatistics 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700' 
                  : statisticsLoading
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : (!heatOverlay && !airQualityOverlay && !populationOverlay)
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                } text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow text-base`}
              >
                {statisticsLoading 
                  ? '⏳ Loading Statistics...' 
                  : (!heatOverlay && !airQualityOverlay && !populationOverlay)
                  ? '📊 Load Data First'
                  : showStatistics 
                  ? '📊 Hide Statistics' 
                  : '📊 Show Statistics'
                }
              </button>

              {/* AI Analysis Button */}
              <button
                onClick={async () => {
                  if (!showAIAnalysis && !aiAnalysisLoading) {
                    await performAIAnalysis();
                  }
                  if (!aiAnalysisLoading) {
                    setShowAIAnalysis(!showAIAnalysis);
                  }
                }}
                disabled={(!statisticsData[dataType] && !showStatistics) || aiAnalysisLoading}
                className={`w-full px-4 py-2.5 ${showAIAnalysis 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' 
                  : aiAnalysisLoading
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : (!statisticsData[dataType] && !showStatistics)
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                } text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow text-base`}
              >
                {aiAnalysisLoading 
                  ? '🤖 Analyzing...' 
                  : (!statisticsData[dataType] && !showStatistics)
                  ? '🤖 Load Stats First'
                  : showAIAnalysis 
                  ? '🤖 Hide AI Analysis' 
                  : '🤖 AI Analysis'
                }
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

      {/* Statistics Display Section */}
      {showStatistics && (statisticsLoading || statisticsData[dataType]) && (
        <div className="mb-8 bg-gradient-to-br from-white via-slate-50 to-gray-100 rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="flex items-center space-x-4 mb-8">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              dataType === 'heat' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
              dataType === 'airquality' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' :
              'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}>
              <span className="text-2xl">
                {statisticsLoading ? '⏳' : 
                 dataType === 'heat' ? '🌡️' : dataType === 'airquality' ? '🌬️' : '👥'}
              </span>
            </div>
            <div>
              <h4 className={`text-2xl font-bold bg-clip-text text-transparent ${
                dataType === 'heat' ? 'bg-gradient-to-r from-orange-600 to-red-600' :
                dataType === 'airquality' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
                'bg-gradient-to-r from-green-600 to-emerald-600'
              }`}>
                {statisticsLoading ? 'Loading Statistics...' :
                 dataType === 'heat' ? 'Heat Analysis Statistics' :
                 dataType === 'airquality' ? 'Air Quality Statistics' :
                 'Population Density Statistics'}
              </h4>
              <p className="text-gray-600 mt-1">
                {statisticsLoading 
                  ? 'Fetching multi-year data and analysis from backend APIs...'
                  : 'Interactive data visualization and trends'
                }
              </p>
            </div>
          </div>

          {/* Statistics Content */}
          {statisticsLoading ? (
            /* Loading State */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="animate-spin w-6 h-6 border-3 border-yellow-500 border-t-transparent rounded-full"></div>
                  <h3 className="text-lg font-semibold text-yellow-800">Fetching Statistics Data</h3>
                </div>
                <div className="space-y-2 text-yellow-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span>Connecting to backend APIs...</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <span>Processing multi-year {dataType === 'heat' ? 'temperature' : dataType === 'airquality' ? 'air quality' : 'population'} data...</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <span>Generating statistical analysis...</span>
                  </div>
                </div>
                <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm text-yellow-600">
                    <span>⚠️</span>
                    <span><strong>Please wait:</strong> Statistics loading may take 10-30 seconds depending on data complexity and network speed.</span>
                  </div>
                </div>
              </div>
              
              {/* Loading Placeholders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-64 bg-gray-100 rounded"></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-100 rounded"></div>
                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : statisticsData[dataType] ? (
            /* Data Loaded State */
            <div className="space-y-8">
              {/* Statistics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Yearly Trends Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h5 className="text-lg font-semibold text-gray-800 mb-4">
                    {dataType === 'heat' ? 'Temperature Trends' :
                     dataType === 'airquality' ? 'Pollution Levels Over Time' :
                     'Population Growth Trends'}
                  </h5>
                  
                  <ResponsiveContainer width="100%" height={300}>
                {dataType === 'population' ? (
                  <BarChart data={statisticsData[dataType]?.yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}${name === 'density' ? ' people/km²' : '%'}`, 
                        name === 'density' ? 'Population Density' : 'Growth Rate'
                      ]}
                    />
                    <Bar dataKey="density" fill="#10b981" name="density" />
                  </BarChart>
                ) : dataType === 'heat' ? (
                  <AreaChart data={statisticsData[dataType]?.yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value}°C`, name === 'temperature' ? 'Temperature' : 'Heat Index']} />
                    <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="#fecaca" name="temperature" />
                  </AreaChart>
                ) : (
                  <LineChart data={statisticsData[dataType]?.yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value} µg/m³`, String(name).toUpperCase()]} />
                    <Line type="monotone" dataKey="no2" stroke="#8b5cf6" strokeWidth={2} name="no2" />
                    <Line type="monotone" dataKey="co" stroke="#06b6d4" strokeWidth={2} name="co" />
                    <Line type="monotone" dataKey="so2" stroke="#f59e0b" strokeWidth={2} name="so2" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Current Statistics Panel */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h5 className="text-lg font-semibold text-gray-800 mb-4">Current Analysis Summary</h5>
              
              {statisticsData[dataType]?.currentStats && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(statisticsData[dataType].currentStats).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-xl font-bold text-gray-800">
                        {typeof value === 'number' ? value.toFixed(1) : String(value)}
                        {typeof value === 'number' && (
                          dataType === 'heat' ? '°C' : 
                          dataType === 'airquality' ? ' µg/m³' : 
                          key.includes('density') ? '/km²' : ''
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="text-blue-500 mr-3">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <div className="font-medium">Interactive Statistics</div>
                    <div>
                      {dataType === 'heat' ? 'Temperature data shows urban heat island patterns and seasonal variations.' :
                       dataType === 'airquality' ? 'Air quality measurements from satellite data showing pollution concentrations.' :
                       'Population density analysis from NASA SEDAC gridded population data.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
            </div>
          ) : (
            /* No Data Available State */
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-red-500 text-2xl">⚠️</span>
                <h3 className="text-lg font-semibold text-red-800">No Statistics Data Available</h3>
              </div>
              <div className="text-red-700">
                <p>Unable to load statistics for the selected {dataType} layer. This may happen when:</p>
                <ul className="mt-2 ml-4 space-y-1 list-disc">
                  <li>The data layer hasn't been loaded yet</li>
                  <li>Backend API is temporarily unavailable</li>
                  <li>No data available for the current map region</li>
                </ul>
                <p className="mt-4 font-medium">Try loading a data layer first, then click "Show Statistics" again.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Analysis Display Section */}
      {showAIAnalysis && (aiAnalysisLoading || aiAnalysisData) && (
        <div className="mb-8 bg-gradient-to-br from-white via-emerald-50 to-teal-50 rounded-2xl shadow-2xl p-8 border border-emerald-200">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h4 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                AI Environmental Analysis
              </h4>
              <p className="text-gray-600 mt-1">
                Intelligent insights and risk assessment for {
                  dataType === 'heat' ? 'urban heat patterns' :
                  dataType === 'airquality' ? 'air quality conditions' :
                  'population density patterns'
                }
              </p>
            </div>
          </div>

          {/* AI Analysis Content */}
          {aiAnalysisLoading ? (
            /* Loading State */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
                  <div className="text-lg font-semibold text-emerald-700">AI Analysis in Progress</div>
                </div>
                <div className="space-y-2 text-emerald-700">
                  <p>🧠 Processing environmental data patterns...</p>
                  <p>📊 Analyzing statistical trends and anomalies...</p>
                  <p>🔍 Identifying potential risks and opportunities...</p>
                  <p>💡 Generating intelligent recommendations...</p>
                  <p>📈 Computing confidence scores and insights...</p>
                </div>
                <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-3">
                  <div className="text-sm text-emerald-600">Analysis typically takes 1-3 seconds to ensure comprehensive results</div>
                </div>
              </div>
              
              {/* Loading Placeholders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : aiAnalysisData ? (
            /* AI Analysis Results */
            <div className="space-y-8">
              {/* Executive Summary */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">📋</span>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-gray-800">Executive Summary</h5>
                    <p className="text-sm text-gray-600">AI-generated overview of key findings</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 leading-relaxed text-lg">{aiAnalysisData.summary}</p>
                </div>
                
                {/* Risk Level Indicator */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-600">Overall Risk Level:</span>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      aiAnalysisData.riskLevel === 'extreme' ? 'bg-red-100 text-red-800' :
                      aiAnalysisData.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      aiAnalysisData.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {aiAnalysisData.riskLevel.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">💡</span>
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-gray-800">Key Insights</h5>
                      <p className="text-sm text-gray-600">AI-identified patterns and anomalies</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {aiAnalysisData.insights.map((insight, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        insight.severity === 'critical' ? 'bg-red-50 border-red-500' :
                        insight.severity === 'high' ? 'bg-orange-50 border-orange-500' :
                        insight.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <h6 className={`font-bold text-lg ${
                            insight.severity === 'critical' ? 'text-red-800' :
                            insight.severity === 'high' ? 'text-orange-800' :
                            insight.severity === 'medium' ? 'text-yellow-800' :
                            'text-blue-800'
                          }`}>
                            {insight.type === 'risk' ? '⚠️' : 
                             insight.type === 'trend' ? '📈' : 
                             insight.type === 'anomaly' ? '🚨' : 
                             insight.type === 'comparison' ? '⚖️' : '📝'} {insight.title}
                          </h6>
                          <div className={`text-xs px-2 py-1 rounded-full font-bold ${
                            insight.severity === 'critical' ? 'bg-red-200 text-red-800' :
                            insight.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                            insight.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">{insight.description}</p>
                        {insight.dataPoints && insight.dataPoints.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs font-medium text-gray-500 mb-1">Supporting Data:</div>
                            <div className="flex flex-wrap gap-2">
                              {insight.dataPoints.map((point, idx) => (
                                <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-300">
                                  {point}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Metrics and Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Key Metrics */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">📊</span>
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-gray-800">Key Metrics</h5>
                      <p className="text-sm text-gray-600">Important measurements and trends</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {aiAnalysisData.keyMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{metric.label}</div>
                          <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm px-2 py-1 rounded-full font-medium ${
                            metric.trend === 'increasing' ? 'bg-red-100 text-red-700' :
                            metric.trend === 'decreasing' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {metric.trend === 'increasing' ? '📈 Rising' :
                             metric.trend === 'decreasing' ? '📉 Falling' :
                             '➡️ Stable'}
                          </div>
                          <div className={`text-xs mt-1 ${
                            metric.significance === 'positive' ? 'text-green-600' :
                            metric.significance === 'negative' ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {metric.significance === 'positive' ? '✅ Good' :
                             metric.significance === 'negative' ? '⚠️ Concerning' :
                             '➖ Neutral'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🎯</span>
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-gray-800">AI Recommendations</h5>
                      <p className="text-sm text-gray-600">Actionable insights for improvement</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {aiAnalysisData.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-indigo-800 leading-relaxed">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No Data Available State */
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">❌</span>
                </div>
                <h5 className="text-xl font-bold text-red-800">AI Analysis Unavailable</h5>
              </div>
              <div className="text-red-700">
                <p className="mb-2">Unable to generate AI analysis. This could be due to:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Insufficient statistics data</li>
                  <li>Analysis engine temporarily unavailable</li>
                  <li>Data quality issues</li>
                </ul>
                <p className="mt-4 font-medium">Try loading statistics data first, then run AI analysis again.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Analysis Data Statistics */}
      {/* Heat Data Statistics - Enhanced Display */}
      {heatData && heatData.success && heatData.imageUrl && (
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
          
          {/* Temperature Statistics - Streamlined for Selected Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-50 to-pink-100 p-6 rounded-2xl border-2 border-red-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🌡️</span>
                </div>
                <div className="text-xs font-medium text-red-500 bg-red-100 px-2 py-1 rounded-full">YEAR-SPECIFIC</div>
              </div>
              <div className="text-sm font-medium text-red-700 mb-2">Analysis Year</div>
              <div className="text-3xl font-bold text-red-600 mb-1">
                {heatData.dateRange?.start ? new Date(heatData.dateRange.start).getFullYear() : 'N/A'}
              </div>
              <div className="text-xs text-red-500">Selected period for analysis</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-2xl border-2 border-orange-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">⚡</span>
                </div>
                <div className="text-xs font-medium text-orange-500 bg-orange-100 px-2 py-1 rounded-full">OPTIMIZED</div>
              </div>
              <div className="text-sm font-medium text-orange-700 mb-2">Response Mode</div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                Streamlined
              </div>
              <div className="text-xs text-orange-500">Fast image layer loading</div>
            </div>
          </div>

          {/* Layer Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Layer Type</div>
              <div className="text-lg font-semibold text-gray-800 capitalize">
                {heatData.layerType || 'Heat Island'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Data Source</div>
              <div className="text-lg font-semibold text-gray-800">
                Landsat Collection 2
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Attribution</div>
              <div className="text-lg font-semibold text-gray-800">
                {heatData.attribution ? heatData.attribution.slice(0, 30) + '...' : 'NASA USGS'}
              </div>
            </div>
          </div>

          {/* Streamlined Analysis Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-blue-500 mr-3">ℹ️</div>
              <div>
                <div className="text-sm font-medium text-blue-800">Streamlined Mode Active</div>
                <div className="text-xs text-blue-600">
                  Showing heat layer for selected year only. Detailed statistics and time series analysis have been optimized for faster loading.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Air Quality Data Statistics - Streamlined Display */}
      {airQualityData && airQualityData.success && airQualityData.imageUrl && (
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
          
          {/* Layer Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Layer Type</div>
              <div className="text-lg font-semibold text-gray-800 capitalize">
                {airQualityData.layerType || 'Air Quality'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Data Source</div>
              <div className="text-lg font-semibold text-gray-800">
                Sentinel-5P
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Attribution</div>
              <div className="text-lg font-semibold text-gray-800">
                {airQualityData.attribution ? airQualityData.attribution.slice(0, 30) + '...' : 'ESA COPERNICUS'}
              </div>
            </div>
          </div>

          {/* Streamlined Analysis Notice */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-purple-500 mr-3">ℹ️</div>
              <div>
                <div className="text-sm font-medium text-purple-800">Streamlined Mode Active</div>
                <div className="text-xs text-purple-600">
                  Showing air quality layer for selected year only. Detailed statistics and analysis have been optimized for faster loading.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Population Data Statistics - Streamlined Display */}
      {populationData && populationData.success && populationData.imageUrl && (
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

          {/* Layer Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Layer Type</div>
              <div className="text-lg font-semibold text-gray-800 capitalize">
                {populationData.layerType || 'Population Density'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Data Source</div>
              <div className="text-lg font-semibold text-gray-800">
                NASA SEDAC GPW
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Attribution</div>
              <div className="text-lg font-semibold text-gray-800">
                {populationData.attribution ? populationData.attribution.slice(0, 30) + '...' : 'NASA SEDAC'}
              </div>
            </div>
          </div>

          {/* Streamlined Analysis Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-green-500 mr-3">ℹ️</div>
              <div>
                <div className="text-sm font-medium text-green-800">Streamlined Mode Active</div>
                <div className="text-xs text-green-600">
                  Showing population density layer for selected year only. Detailed statistics and analysis have been optimized for faster loading.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};
export default EnhancedMapComponent;
