'use client';
import React, { useEffect, useState } from 'react';
import { HeatService } from '../services/heatService';
import { AirQualityService } from '../services/airQualityService';
import { PopulationService } from '../services/populationService';

// Type definitions for the heat data response
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
}

interface AirQualityDataResponse {
  imageUrl: string;
  bounds: { west: number; south: number; east: number; north: number };
  statistics: AirQualityStatistics;
  visualizationParams: VisualizationParams;
  overlayBounds: OverlayBounds;
  dateRange: DateRange;
}

interface PopulationDataResponse {
  imageUrl: string;
  bounds: { west: number; south: number; east: number; north: number };
  statistics: PopulationStatistics;
  visualizationParams: VisualizationParams;
  overlayBounds: OverlayBounds;
  year: number;
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
          attribution: '© OpenStreetMap contributors'
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

    try {
      console.log('🏙️ Fetching heat data for city:', cityName);

      // Use selected year for date range
      const { startDate, endDate } = getDateRange();

      const response = await HeatService.getCityHeatData(cityName, startDate, endDate) as HeatApiResponse;

      console.log('📥 City heat data received:', response);

      if (response.success && response.data) {
        setHeatData(response);
        await addHeatOverlayToMap(response.data);
        
        // Zoom to city bounds if overlayBounds are provided
        if (map && response.data.overlayBounds) {
          const bounds = [
            [response.data.overlayBounds.southwest.lat, response.data.overlayBounds.southwest.lng],
            [response.data.overlayBounds.northeast.lat, response.data.overlayBounds.northeast.lng]
          ];
          map.fitBounds(bounds);
          console.log('🔍 Zoomed to city bounds');
        }
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

    try {
      console.log('🏙️ Fetching air quality data for city:', cityName);

      // Use exact format as specified
      const startDate = "2024-01-01";
      const endDate = "2024-08-01";

      const response = await AirQualityService.getCityAirQualityData(cityName, startDate, endDate) as AirQualityApiResponse;

      console.log('📥 City air quality data received:', response);

      if (response.success && response.data) {
        setAirQualityData(response);
        await addAirQualityOverlayToMap(response.data);
        
        // Zoom to city bounds if overlayBounds are provided
        if (map && response.data.overlayBounds) {
          const bounds = [
            [response.data.overlayBounds.southwest.lat, response.data.overlayBounds.southwest.lng],
            [response.data.overlayBounds.northeast.lat, response.data.overlayBounds.northeast.lng]
          ];
          map.fitBounds(bounds);
          console.log('🔍 Zoomed to city bounds');
        }
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

    try {
      console.log('🏙️ Fetching population data for city:', cityName);

      const response = await PopulationService.getCityPopulationData(cityName, selectedPopulationYear) as PopulationApiResponse;

      console.log('📥 City population data received:', response);

      if (response.success && response.data) {
        setPopulationData(response);
        await addPopulationOverlayToMap(response.data);
        
        // Zoom to city bounds if overlayBounds are provided
        if (map && response.data.overlayBounds) {
          const bounds = [
            [response.data.overlayBounds.southwest.lat, response.data.overlayBounds.southwest.lng],
            [response.data.overlayBounds.northeast.lat, response.data.overlayBounds.northeast.lng]
          ];
          map.fitBounds(bounds);
          console.log('🔍 Zoomed to city bounds');
        }
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
      
      {/* Control Panel */}
      <div className="mb-8 p-8 bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl border border-blue-100 backdrop-blur-sm">
        <div className="flex items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🌍</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Environmental Data Analysis
              </h3>
              <p className="text-sm text-gray-600 mt-1">Explore urban heat islands and air quality patterns</p>
            </div>
          </div>
        </div>
        
        {/* Year Slider */}
        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl border border-indigo-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <label htmlFor="year-slider" className="text-lg font-semibold text-gray-800">
                  Select Analysis Year
                </label>
                <p className="text-sm text-gray-600">Choose the year for environmental data analysis</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                {selectedYear}
              </div>
              <div className="text-sm text-gray-500">Selected Year</div>
            </div>
          </div>
          
          <div className="relative">
            <input
              id="year-slider"
              type="range"
              min="2000"
              max="2024"
              value={selectedYear}
              onChange={handleYearChange}
              className="w-full h-3 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full appearance-none cursor-pointer slider shadow-inner"
              style={{
                background: `linear-gradient(to right, #4f46e5 0%, #3b82f6 ${((selectedYear - 2000) / 24) * 100}%, #e0e7ff ${((selectedYear - 2000) / 24) * 100}%, #dbeafe 100%)`
              }}
            />
            
            {/* Year markers */}
            <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
              <span className="bg-white px-2 py-1 rounded-full shadow-sm">2000</span>
              <span className="bg-white px-2 py-1 rounded-full shadow-sm">2005</span>
              <span className="bg-white px-2 py-1 rounded-full shadow-sm">2010</span>
              <span className="bg-white px-2 py-1 rounded-full shadow-sm">2015</span>
              <span className="bg-white px-2 py-1 rounded-full shadow-sm">2020</span>
              <span className="bg-white px-2 py-1 rounded-full shadow-sm">2024</span>
            </div>
          </div>
          
          {/* Date range display */}
          <div className="mt-4 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="font-medium text-gray-700">Analysis Period:</span>
              </div>
              <span className="font-semibold text-indigo-600">
                {getDateRange().startDate} to {getDateRange().endDate}
              </span>
            </div>
          </div>
        </div>
        
        {/* Data Type Selector */}
        <div className="mb-6 p-6 bg-gradient-to-r from-slate-50 via-gray-50 to-zinc-50 rounded-2xl border border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-gray-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Select Data Type</h4>
                <p className="text-sm text-gray-600">Choose between heat island, air quality, or population analysis</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setDataType('heat')}
              className={`px-4 py-2 rounded-md transition-colors ${
                dataType === 'heat' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
              }`}
            >
              �️ Heat Island Data
            </button>
            
            <button
              onClick={() => setDataType('airquality')}
              className={`px-4 py-2 rounded-md transition-colors ${
                dataType === 'airquality' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'
              }`}
            >
              🌬️ Air Quality Data
            </button>
            
            <button
              onClick={() => setDataType('population')}
              className={`px-4 py-2 rounded-md transition-colors ${
                dataType === 'population' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
              }`}
            >
              👥 Population Data
            </button>
          </div>
        </div>

        {/* Heat Data Controls */}
        {dataType === 'heat' && (
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={fetchHeatDataForCurrentBounds}
              disabled={loading || !map}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              {loading ? '🔄 Loading...' : `🔍 Show Heat Data (${selectedYear})`}
            </button>
            
            <button
              onClick={() => fetchCityHeatData('New York')}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              🏙️ New York ({selectedYear})
            </button>
            
            <button
              onClick={() => fetchCityHeatData('Los Angeles')}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              🌴 Los Angeles ({selectedYear})
            </button>
            
            <button
              onClick={() => fetchCityHeatData('Chicago')}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              🌬️ Chicago ({selectedYear})
            </button>
            
            <button
              onClick={removeHeatOverlay}
              disabled={!heatOverlay}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25"
            >
              🗑️ Clear Heat Layer
            </button>
          </div>
        )}

        {/* Air Quality Data Controls */}
        {dataType === 'airquality' && (
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={fetchAirQualityDataForCurrentBounds}
              disabled={loading || !map}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25"
            >
              {loading ? '🔄 Loading...' : '🔍 Show Air Quality (2024)'}
            </button>
            
            <button
              onClick={() => fetchCityAirQualityData('New York')}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              🏙️ New York (2024)
            </button>
            
            <button
              onClick={() => fetchCityAirQualityData('Los Angeles')}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              🌴 Los Angeles (2024)
            </button>
            
            <button
              onClick={() => fetchCityAirQualityData('Chicago')}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              🌬️ Chicago (2024)
            </button>
            
            <button
              onClick={removeAirQualityOverlay}
              disabled={!airQualityOverlay}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25"
            >
              🗑️ Clear Air Quality Layer
            </button>
          </div>
        )}

        {/* Population Data Controls */}
        {dataType === 'population' && (
          <div className="space-y-6 mb-6">
            {/* Population Year Selector */}
            <div className="p-4 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-xl border border-green-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-lg">📅</span>
                  </div>
                  <div>
                    <label htmlFor="population-year" className="text-md font-semibold text-gray-800">
                      Population Data Year
                    </label>
                    <p className="text-sm text-gray-600">NASA SEDAC GPW available years</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {selectedPopulationYear}
                  </div>
                </div>
              </div>
              
              <select
                id="population-year"
                value={selectedPopulationYear}
                onChange={handlePopulationYearChange}
                className="w-full p-3 bg-white border border-green-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value={2000}>2000</option>
                <option value={2005}>2005</option>
                <option value={2010}>2010</option>
                <option value={2015}>2015</option>
                <option value={2020}>2020</option>
                <option value={2025}>2025</option>
              </select>
            </div>
            
            {/* Population Control Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={fetchPopulationDataForCurrentBounds}
                disabled={loading || !map}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
              >
                {loading ? '🔄 Loading...' : `🔍 Show Population (${selectedPopulationYear})`}
              </button>
              
              <button
                onClick={() => fetchCityPopulationData('New York')}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25"
              >
                🏙️ New York ({selectedPopulationYear})
              </button>
              
              <button
                onClick={() => fetchCityPopulationData('Los Angeles')}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25"
              >
                🌴 Los Angeles ({selectedPopulationYear})
              </button>
              
              <button
                onClick={() => fetchCityPopulationData('Chicago')}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25"
              >
                🌬️ Chicago ({selectedPopulationYear})
              </button>
              
              <button
                onClick={removePopulationOverlay}
                disabled={!populationOverlay}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25"
              >
                🗑️ Clear Population Layer
              </button>
            </div>
          </div>
        )}

        <button
          onClick={removeAllOverlays}
          disabled={!heatOverlay && !airQualityOverlay && !populationOverlay}
          className="mb-6 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-500/25"
        >
          🧹 Clear All Layers
        </button>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 rounded-2xl shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">❌</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg text-red-800 mb-2">Something went wrong</div>
                <div className="text-red-600 bg-white/50 p-3 rounded-lg border border-red-100">
                  {error}
                </div>
                <div className="mt-3 text-sm text-red-600">
                  💡 <span className="font-medium">Tip:</span> Try refreshing the page or checking your internet connection
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-700 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <div className="animate-spin text-white text-xl">🔄</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg text-blue-800 mb-2">
                  Processing Environmental Data
                </div>
                <div className="text-blue-600 bg-white/50 p-3 rounded-lg border border-blue-100">
                  Fetching {dataType === 'heat' ? 'heat island' : dataType === 'airquality' ? 'air quality' : 'population'} data from satellite imagery...
                </div>
                <div className="mt-3 text-sm text-blue-600">
                  ⏱️ This usually takes 10-30 seconds depending on the data complexity
                </div>
              </div>
            </div>
            
            {/* Loading Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="mb-8">
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xl">🗺️</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800">Interactive Environmental Map</h4>
                <p className="text-sm text-gray-600">Satellite-based analysis visualization</p>
              </div>
            </div>
            {(heatData || airQualityData) && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-green-700 font-medium">Data Loaded</span>
              </div>
            )}
          </div>
          <div 
            id="heat-map" 
            key="heat-map-container"
            className="w-full h-[800px] rounded-xl border-2 border-gray-300 shadow-inner bg-gray-100"
            style={{ minHeight: '800px' }}
          />
        </div>
      </div>

      {/* Heat Data Statistics - Enhanced Display */}
      {heatData && heatData.success && heatData.data && (
        <div className="bg-gradient-to-br from-white via-orange-50 to-red-50 rounded-2xl shadow-2xl p-8 border border-orange-200">
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
        <div className="bg-gradient-to-br from-white via-purple-50 to-indigo-50 rounded-2xl shadow-2xl p-8 border border-purple-200">
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