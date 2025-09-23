// Frontend service for interacting with air quality API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class AirQualityService {
  /**
   * Get air quality data for custom bounds
   * @param {Object} bounds - { west, south, east, north }
   * @param {string} startDate - YYYY-MM-DD format
   * @param {string} endDate - YYYY-MM-DD format
   * @returns {Promise<Object>} Air quality data response
   */
  static async getAirQualityData(bounds, startDate = '2024-01-01', endDate = '2024-08-01') {
    try {
      console.log('🌬️ Fetching air quality data for bounds:', bounds);
      
      // Format exactly as specified in requirements
      const boundsString = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
      const url = `${API_BASE_URL}/api/airquality?bounds=${boundsString}&startDate=${startDate}&endDate=${endDate}`;
      
      console.log('📡 Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Response received:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch air quality data');
      }
      
      // Validate response structure
      if (!data.success || !data.data) {
        throw new Error('Invalid response format from server');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching air quality data:', error);
      throw error;
    }
  }

  /**
   * Get air quality data for a predefined city
   * @param {string} cityName - Name of the city
   * @param {string} startDate - YYYY-MM-DD format
   * @param {string} endDate - YYYY-MM-DD format
   * @returns {Promise<Object>} Air quality data response
   */
  static async getCityAirQualityData(cityName, startDate = '2024-01-01', endDate = '2024-08-01') {
    try {
      console.log('🏙️ Fetching air quality data for city:', cityName);
      
      // Format exactly as specified in requirements
      const url = `${API_BASE_URL}/api/airquality/city/${encodeURIComponent(cityName)}?startDate=${startDate}&endDate=${endDate}`;
      
      console.log('📡 Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Response received:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch city air quality data');
      }
      
      // Validate response structure
      if (!data.success || !data.data) {
        throw new Error('Invalid response format from server');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching city air quality data:', error);
      throw error;
    }
  }

  /**
   * Alternative POST method for complex requests
   * @param {Object} requestData - Complete request payload
   * @returns {Promise<Object>} Air quality data response
   */
  static async analyzeAirQualityData(requestData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/airquality/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to analyze air quality data');
      }
      
      return data;
    } catch (error) {
      console.error('Error analyzing air quality data:', error);
      throw error;
    }
  }

  /**
   * Get list of supported cities
   * @returns {Promise<Object>} List of cities
   */
  static async getSupportedCities() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/airquality/cities`);
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

  /**
   * Get air quality API information
   * @returns {Promise<Object>} API information
   */
  static async getAirQualityInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/airquality/info`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch air quality info');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching air quality info:', error);
      throw error;
    }
  }
}

// Example usage in a React component:
/*
import { AirQualityService } from '../services/airQualityService';

const MapComponent = () => {
  const [airQualityData, setAirQualityData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAirQualityData = async (bounds) => {
    setLoading(true);
    try {
      // Method 1: Using bounds
      const data = await AirQualityService.getAirQualityData(bounds);
      
      // Method 2: Using city name
      // const data = await AirQualityService.getCityAirQualityData('New York');
      
      // Method 3: Using POST with complex data
      // const requestData = {
      //   bounds: bounds,
      //   startDate: "2024-01-01",
      //   endDate: "2024-08-01",
      //   options: { pollutants: ["NO2", "CO", "SO2"] }
      // };
      // const data = await AirQualityService.analyzeAirQualityData(requestData);
      
      setAirQualityData(data);
      
      // Add air quality overlay to map
      if (data.success && data.data.imageUrl) {
        addAirQualityOverlayToMap(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch air quality data:', error);
      // Handle error (show toast, etc.)
    } finally {
      setLoading(false);
    }
  };

  const addAirQualityOverlayToMap = (airQualityData) => {
    // Example for Leaflet
    const imageOverlay = L.imageOverlay(
      airQualityData.imageUrl,
      [
        [airQualityData.overlayBounds.southwest.lat, airQualityData.overlayBounds.southwest.lng],
        [airQualityData.overlayBounds.northeast.lat, airQualityData.overlayBounds.northeast.lng]
      ],
      { 
        opacity: 0.7,
        alt: 'Air Quality Map'
      }
    ).addTo(map);
    
    // Show statistics
    console.log('Air Quality Difference:', airQualityData.statistics.airQualityDifference + '%');
  };

  return (
    // Your map component JSX
  );
};
*/