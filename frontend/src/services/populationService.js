// Frontend service for interacting with population API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export class PopulationService {
  /**
   * Get population data for custom bounds
   * @param {Object} bounds - { west, south, east, north }
   * @param {number} year - Year for population data (will be mapped to nearest valid year)
   * @returns {Promise<Object>} Population data response
   */
  static async getPopulationData(bounds, year = 2020) {
    try {
      console.log('👥 Fetching population data for bounds:', bounds);
      
      // Map any year to the nearest valid population year (2025 not available, so max is 2020)
      const validYears = [2000, 2005, 2010, 2015, 2020]; // Removed 2025 as it's not available yet
      const mappedYear = this.mapToValidPopulationYear(year, validYears);
      
      console.log(`📅 Year ${year} mapped to valid population year: ${mappedYear}`);
      
      // Format exactly as specified in requirements
      const boundsString = `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`;
      const url = `${API_BASE_URL}/api/population?bounds=${boundsString}&year=${mappedYear}`;
      
      console.log('📡 Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Response received:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch population data');
      }
      
      // Validate response structure - updated for streamlined API
      if (!data.success || !data.imageUrl) {
        throw new Error('Invalid response format from server');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching population data:', error);
      throw error;
    }
  }

  /**
   * Map any year to the nearest valid population year
   * @param {number} inputYear - Input year from universal selector
   * @param {number[]} validYears - Array of valid population years
   * @returns {number} Nearest valid population year
   */
  static mapToValidPopulationYear(inputYear, validYears) {
    // Find the closest valid year
    let closest = validYears[0];
    let minDiff = Math.abs(inputYear - closest);
    
    for (const validYear of validYears) {
      const diff = Math.abs(inputYear - validYear);
      if (diff < minDiff) {
        minDiff = diff;
        closest = validYear;
      }
    }
    
    return closest;
  }

  /**
   * Get population data for a predefined city
   * @param {string} cityName - Name of the city
   * @param {number} year - Year for population data (will be mapped to nearest valid year)
   * @returns {Promise<Object>} Population data response
   */
  static async getCityPopulationData(cityName, year = 2020) {
    try {
      console.log('🏙️ Fetching population data for city:', cityName);
      
      // Map any year to the nearest valid population year (2025 not available, so max is 2020)
      const validYears = [2000, 2005, 2010, 2015, 2020]; // Removed 2025 as it's not available yet
      const mappedYear = this.mapToValidPopulationYear(year, validYears);
      
      console.log(`📅 Year ${year} mapped to valid population year: ${mappedYear}`);
      
      // Format exactly as specified in requirements
      const url = `${API_BASE_URL}/api/population/city/${encodeURIComponent(cityName)}?year=${mappedYear}`;
      
      console.log('📡 Request URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Response received:', data);
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch city population data');
      }
      
      // Validate response structure - updated for streamlined API
      if (!data.success || !data.imageUrl) {
        throw new Error('Invalid response format from server');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching city population data:', error);
      throw error;
    }
  }

  /**
   * Get population API information
   * @returns {Promise<Object>} API information
   */
  static async getPopulationInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/population/info`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch population info');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching population info:', error);
      throw error;
    }
  }

  /**
   * Get list of supported cities
   * @returns {Promise<Object>} Supported cities list
   */
  static async getSupportedCities() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/population/cities`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch supported cities');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching supported cities:', error);
      throw error;
    }
  }

  /**
   * Validate population year
   * @param {number} year - Year to validate
   * @returns {boolean} Whether the year is valid
   */
  static isValidYear(year) {
    const validYears = [2000, 2005, 2010, 2015, 2020, 2025];
    return validYears.includes(year);
  }

  /**
   * Get available years for population data
   * @returns {Array<number>} Available years
   */
  static getAvailableYears() {
    return [2000, 2005, 2010, 2015, 2020, 2025];
  }

  /**
   * Format population density for display
   * @param {number} density - Population density in people/km²
   * @returns {string} Formatted density string
   */
  static formatDensity(density) {
    if (density < 1) {
      return '<1 people/km²';
    } else if (density < 1000) {
      return `${Math.round(density)} people/km²`;
    } else if (density < 10000) {
      return `${(density / 1000).toFixed(1)}K people/km²`;
    } else {
      return `${(density / 1000).toFixed(0)}K people/km²`;
    }
  }

  /**
   * Get population density zone description
   * @param {number} density - Population density in people/km²
   * @returns {string} Zone description
   */
  static getDensityZone(density) {
    if (density < 10) return 'Sparse';
    if (density < 100) return 'Rural';
    if (density < 1000) return 'Suburban';
    if (density < 5000) return 'Urban';
    return 'Dense Urban';
  }

  /**
   * Get color for population density
   * @param {number} density - Population density in people/km²
   * @returns {string} CSS color
   */
  static getDensityColor(density) {
    if (density < 10) return '#ADD8E6';      // Light blue
    if (density < 100) return '#90EE90';     // Light green
    if (density < 1000) return '#FFFF00';    // Yellow
    if (density < 5000) return '#FFA500';    // Orange
    return '#FF0000';                        // Red
  }

  /**
   * Calculate estimated population for an area
   * @param {number} density - Population density in people/km²
   * @param {number} areaKm2 - Area in square kilometers
   * @returns {number} Estimated population
   */
  static calculatePopulation(density, areaKm2) {
    return Math.round(density * areaKm2);
  }

  /**
   * Format large numbers for display
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  static formatNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
    return `${(num / 1000000000).toFixed(1)}B`;
  }
}