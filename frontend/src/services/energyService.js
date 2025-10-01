// Frontend service for interacting with energy access API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export class EnergyService {
  /**
   * Get energy access data for custom bounds
   * @param {Object} bounds - { west, south, east, north }
   * @param {number} year - Year for analysis (default: 2023)
   * @returns {Promise<Object>} Energy access data response
   */
  static async getEnergyData(bounds, year = 2024) {
    try {
      console.log('🔋 Fetching energy access data for bounds:', bounds, 'Year:', year);
      
      // Format exactly as specified in requirements
      const boundsString = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
      const url = `${API_BASE_URL}/api/energy?bounds=${boundsString}&year=${year}`;
      
      console.log('📡 Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Response received:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch energy access data');
      }
      
      // Validate response structure - match existing overlay contract
      if (!data.success || !data.imageUrl) {
        throw new Error('Invalid response format from server');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching energy access data:', error);
      throw error;
    }
  }

  /**
   * Get energy access data for a predefined city
   * @param {string} cityName - Name of the city
   * @param {number} year - Year for analysis (default: 2023)
   * @returns {Promise<Object>} Energy access data response
   */
  static async getCityEnergyData(cityName, year = 2024) {
    try {
      console.log(`🏙️ Fetching energy access data for city: ${cityName}, Year: ${year}`);
      
      const url = `${API_BASE_URL}/api/energy/city/${encodeURIComponent(cityName)}?year=${year}`;
      console.log('📡 City Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 City Response received:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || `Failed to fetch energy access data for ${cityName}`);
      }
      
      // Validate response structure
      if (!data.success || !data.imageUrl) {
        throw new Error('Invalid response format from server');
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Error fetching city energy access data for ${cityName}:`, error);
      throw error;
    }
  }

  /**
   * Get available cities for energy access analysis
   * @returns {Promise<Array>} List of supported cities
   */
  static async getSupportedCities() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/energy/cities`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to fetch supported cities');
      }
      
      return data.cities || [];
    } catch (error) {
      console.error('❌ Error fetching supported cities:', error);
      // Return default cities if API fails
      return ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
    }
  }

  /**
   * Validate bounds object
   * @param {Object} bounds - Bounds to validate
   * @returns {boolean} Whether bounds are valid
   */
  static validateBounds(bounds) {
    if (!bounds || typeof bounds !== 'object') {
      return false;
    }
    
    const { west, south, east, north } = bounds;
    
    // Check all values are numbers
    if (typeof west !== 'number' || typeof south !== 'number' || 
        typeof east !== 'number' || typeof north !== 'number') {
      return false;
    }
    
    // Check bounds make sense
    if (west >= east || south >= north) {
      return false;
    }
    
    // Check reasonable lat/lng ranges
    if (west < -180 || west > 180 || east < -180 || east > 180 ||
        south < -90 || south > 90 || north < -90 || north > 90) {
      return false;
    }
    
    return true;
  }

  /**
   * Calculate area of bounds in square degrees
   * @param {Object} bounds - { west, south, east, north }
   * @returns {number} Area in square degrees
   */
  static calculateBoundsArea(bounds) {
    if (!this.validateBounds(bounds)) {
      return 0;
    }
    
    return (bounds.east - bounds.west) * (bounds.north - bounds.south);
  }
}