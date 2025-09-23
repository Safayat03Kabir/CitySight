'use client';
import React, { useEffect, useState } from 'react';
import { HeatService } from '../services/heatService';
import { AirQualityService } from '../services/airQualityService';

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
  const [heatData, setHeatData] = useState<HeatApiResponse | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestBounds, setLastRequestBounds] = useState<MapBounds | null>(null);
  const [dataType, setDataType] = useState<'heat' | 'airquality'>('heat');

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

      // Use exact format as specified
      const startDate = "2024-01-01";
      const endDate = "2024-08-01";

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

      // Use exact format as specified
      const startDate = "2024-01-01";
      const endDate = "2024-08-01";

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
   * Remove all overlays from map
   */
  const removeAllOverlays = () => {
    removeHeatOverlay();
    removeAirQualityOverlay();
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
    <div className="w-full">
      {/* Control Panel */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Environmental Data Analysis</h3>
        
        {/* Data Type Toggle */}
        <div className="mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDataType('heat')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                dataType === 'heat'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🌡️ Heat Island Data
            </button>
            <button
              onClick={() => setDataType('airquality')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                dataType === 'airquality'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🌬️ Air Quality Data
            </button>
          </div>
        </div>
        
        {/* Heat Data Controls */}
        {dataType === 'heat' && (
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={fetchHeatDataForCurrentBounds}
              disabled={loading || !map}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '🔄 Loading...' : '🔍 Show Heat Data'}
            </button>
            
            <button
              onClick={() => fetchCityHeatData('New York')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🏙️ New York
            </button>
            
            <button
              onClick={() => fetchCityHeatData('Los Angeles')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🌴 Los Angeles
            </button>
            
            <button
              onClick={() => fetchCityHeatData('Chicago')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🌬️ Chicago
            </button>
            
            <button
              onClick={removeHeatOverlay}
              disabled={!heatOverlay}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🗑️ Clear Heat Layer
            </button>
          </div>
        )}

        {/* Air Quality Data Controls */}
        {dataType === 'airquality' && (
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={fetchAirQualityDataForCurrentBounds}
              disabled={loading || !map}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '🔄 Loading...' : '🔍 Show Air Quality'}
            </button>
            
            <button
              onClick={() => fetchCityAirQualityData('New York')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🏙️ New York
            </button>
            
            <button
              onClick={() => fetchCityAirQualityData('Los Angeles')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🌴 Los Angeles
            </button>
            
            <button
              onClick={() => fetchCityAirQualityData('Chicago')}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🌬️ Chicago
            </button>
            
            <button
              onClick={removeAirQualityOverlay}
              disabled={!airQualityOverlay}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🗑️ Clear Air Quality Layer
            </button>
          </div>
        )}

        <button
          onClick={removeAllOverlays}
          disabled={!heatOverlay && !airQualityOverlay}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          🧹 Clear All Layers
        </button>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <div className="flex items-start">
              <span className="text-red-500 mr-2">❌</span>
              <div>
                <div className="font-medium">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
            <div className="flex items-center">
              <div className="animate-spin mr-2">🔄</div>
              <div>Fetching {dataType === 'heat' ? 'heat island' : 'air quality'} data...</div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="mb-6">
        <div 
          id="heat-map" 
          key="heat-map-container"
          className="w-full h-[600px] rounded-lg border border-gray-300 shadow-lg"
        />
      </div>

      {/* Heat Data Statistics - Exact Format Display */}
      {heatData && heatData.success && heatData.data && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-6">Heat Island Analysis Results</h4>
          
          {/* Temperature Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
              <div className="text-sm font-medium text-red-700 mb-1">Heat Island Intensity</div>
              <div className="text-2xl font-bold text-red-600">
                {heatData.data.statistics.heatIslandIntensity?.toFixed(1)}°C
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="text-sm font-medium text-orange-700 mb-1">Urban Temperature</div>
              <div className="text-2xl font-bold text-orange-600">
                {heatData.data.statistics.urbanMeanC?.toFixed(1)}°C
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-700 mb-1">Rural Temperature</div>
              <div className="text-2xl font-bold text-green-600">
                {heatData.data.statistics.ruralMeanC?.toFixed(1)}°C
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-700 mb-1">Data Quality</div>
              <div className="text-2xl font-bold text-blue-600 capitalize">
                {heatData.data.statistics.qualityScore || 'Good'}
              </div>
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

      {/* Air Quality Data Statistics - Exact Format Display */}
      {airQualityData && airQualityData.success && airQualityData.data && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-6">Air Quality Analysis Results</h4>
          
          {/* Air Quality Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="text-sm font-medium text-purple-700 mb-1">Air Quality Difference</div>
              <div className="text-2xl font-bold text-purple-600">
                {airQualityData.data.statistics.airQualityDifference?.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="text-sm font-medium text-orange-700 mb-1">Urban NO₂</div>
              <div className="text-2xl font-bold text-orange-600">
                {airQualityData.data.statistics.urbanMeanNO2?.toFixed(3)}
              </div>
              <div className="text-xs text-orange-600">×10⁻⁶ mol/m²</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-700 mb-1">Rural NO₂</div>
              <div className="text-2xl font-bold text-green-600">
                {airQualityData.data.statistics.ruralMeanNO2?.toFixed(3)}
              </div>
              <div className="text-xs text-green-600">×10⁻⁶ mol/m²</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-700 mb-1">Data Quality</div>
              <div className="text-2xl font-bold text-blue-600 capitalize">
                {airQualityData.data.statistics.no2ImageCount > 5 ? 'Excellent' : 
                 airQualityData.data.statistics.no2ImageCount > 2 ? 'Good' : 'Fair'}
              </div>
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
    </div>
  );
};

export default EnhancedMapComponent;