// Frontend service for interacting with heat API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class HeatService {
  /**
   * Get heat data for custom bounds
   * @param {Object} bounds - { west, south, east, north }
   * @param {string} startDate - YYYY-MM-DD format
   * @param {string} endDate - YYYY-MM-DD format
   * @returns {Promise<Object>} Heat data response
   */
  static async getHeatData(bounds, startDate = '2024-01-01', endDate = '2024-08-01') {
    try {
      console.log('🌡️ Fetching heat data for bounds:', bounds);
      
      // Format exactly as specified in requirements
      const boundsString = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
      const url = `${API_BASE_URL}/api/heat?bounds=${boundsString}&startDate=${startDate}&endDate=${endDate}`;
      
      console.log('📡 Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Response received:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch heat data');
      }
      
      // Validate response structure
      if (!data.success || !data.data) {
        throw new Error('Invalid response format from server');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching heat data:', error);
      throw error;
    }
  }

  /**
   * Get heat data for a predefined city
   * @param {string} cityName - Name of the city
   * @param {string} startDate - YYYY-MM-DD format
   * @param {string} endDate - YYYY-MM-DD format
   * @returns {Promise<Object>} Heat data response
   */
  static async getCityHeatData(cityName, startDate = '2024-01-01', endDate = '2024-08-01') {
    try {
      console.log('🏙️ Fetching heat data for city:', cityName);
      
      // Format exactly as specified in requirements
      const url = `${API_BASE_URL}/api/heat/city/${encodeURIComponent(cityName)}?startDate=${startDate}&endDate=${endDate}`;
      
      console.log('📡 Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Response received:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch city heat data');
      }
      
      // Validate response structure
      if (!data.success || !data.data) {
        throw new Error('Invalid response format from server');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching city heat data:', error);
      throw error;
    }
  }

  /**
   * Alternative POST method for complex requests
   * @param {Object} requestData - Complete request payload
   * @returns {Promise<Object>} Heat data response
   */
  static async analyzeHeatData(requestData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/heat/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to analyze heat data');
      }
      
      return data;
    } catch (error) {
      console.error('Error analyzing heat data:', error);
      throw error;
    }
  }

  /**
   * Get list of supported cities
   * @returns {Promise<Object>} List of cities
   */
  static async getSupportedCities() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/heat/cities`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch cities');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  }
}

// Example usage in a React component:
/*
import { HeatService } from '../services/heatService';

const MapComponent = () => {
  const [heatData, setHeatData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHeatData = async (bounds) => {
    setLoading(true);
    try {
      // Method 1: Using bounds
      const data = await HeatService.getHeatData(bounds);
      
      // Method 2: Using city name
      // const data = await HeatService.getCityHeatData('New York');
      
      // Method 3: Using POST with complex data
      // const requestData = {
      //   bounds: bounds,
      //   startDate: "2024-01-01",
      //   endDate: "2024-08-01",
      //   options: { cloudCover: 20, season: "hot" }
      // };
      // const data = await HeatService.analyzeHeatData(requestData);
      
      setHeatData(data);
      
      // Add heat overlay to map
      if (data.success && data.data.imageUrl) {
        addHeatOverlayToMap(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch heat data:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  const addHeatOverlayToMap = (heatData) => {
    // Example for Leaflet
    const imageOverlay = L.imageOverlay(
      heatData.imageUrl,
      [
        [heatData.overlayBounds.southwest.lat, heatData.overlayBounds.southwest.lng],
        [heatData.overlayBounds.northeast.lat, heatData.overlayBounds.northeast.lng]
      ],
      { 
        opacity: 0.7,
        alt: 'Heat Island Map'
      }
    ).addTo(map);
    
    // Show statistics
    console.log('Heat Island Intensity:', heatData.statistics.heatIslandIntensity + '°C');
  };

  return (
    // Your map component JSX
  );
};
*/