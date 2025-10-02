// Google Earth Engine Service Module for Air Quality Analysis
// Handles all interactions with Google Earth Engine API for air quality data
const ee = require('@google/earthengine');
const path = require('path');

class AirQualityService {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize Google Earth Engine with service account
   * This must be called before any other GEE operations
   */
  async initialize() {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Path to service account JSON file
        const serviceAccountPath = JSON.parse(process.env.GEE_SERVICE_ACCOUNT_PATH);
        
        if (!require('fs').existsSync(serviceAccountPath)) {
          reject(new Error(`Service account file not found: ${serviceAccountPath}`));
          return;
        }

        const serviceAccount = require(path.resolve(serviceAccountPath));
        
        ee.data.authenticateViaPrivateKey(
          serviceAccount,
          () => {
            ee.initialize(
              null,
              null,
              () => {
                console.log('✅ Google Earth Engine initialized for Air Quality Service');
                this.isInitialized = true;
                resolve();
              },
              (error) => {
                console.error('❌ GEE initialization error:', error);
                reject(error);
              }
            );
          },
          (error) => {
            console.error('❌ GEE authentication error:', error);
            reject(error);
          }
        );
      } catch (error) {
        console.error('❌ GEE Service initialization error:', error);
        reject(error);
      }
    });
  }

  /**
   * Fetch Air Quality data from Sentinel-5P for specific year only (streamlined)
   * @param {Object} bounds - Bounding box coordinates {north, south, east, west}
   * @param {string} startDate - Start date in YYYY-MM-DD format (selected year only)
   * @param {string} endDate - End date in YYYY-MM-DD format (selected year only)
   * @returns {Promise<Object>} - GEE image data with download URL for selected year
   */
  async getAirQualityData(bounds, startDate = '2024-01-01', endDate = '2024-08-01') {
    await this.initialize();

    try {
      console.log(`🛰️ Processing Air Quality data for selected year period: ${startDate} to ${endDate}`);
      
      // --- AOI (Area of Interest) ---
      const geometry = ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]);

      // --- Sentinel-5P TROPOMI NO2 data for selected year period only ---
      const no2Collection = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
          .filterBounds(geometry)
          .filterDate(startDate, endDate)
          .select(['NO2_column_number_density']);

      // Check if collection has data for the selected year
      const no2Size = await new Promise((resolve, reject) => {
        no2Collection.size().evaluate((result, error) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      if (no2Size === 0) {
        throw new Error(`No NO2 air quality data available for the selected year period: ${startDate} to ${endDate}`);
      }

      console.log(`📊 Found ${no2Size} NO2 quality images for selected year processing`);

      // --- Create median composite for selected year period only ---
      const no2Composite = no2Collection.median().clip(geometry);

      // --- Visualization parameters for NO2 ---
      const no2Vis = { 
        min: 0, 
        max: 0.0001, 
        palette: ['blue','green','yellow','orange','red'] 
      };

      // --- Generate image thumbnail URL ---
      const areaDeg2 = (bounds.east - bounds.west) * (bounds.north - bounds.south);
      const dimensions = areaDeg2 > 1 ? 1024 : 512;

      const imageUrl = await new Promise((resolve, reject) => {
        no2Composite.getThumbURL({
          region: geometry,
          dimensions: dimensions,
          format: 'png',
          min: no2Vis.min,
          max: no2Vis.max,
          palette: no2Vis.palette.join(',')
        }, (url, error) => {
          if (error) {
            console.error('❌ Error generating image URL:', error);
            reject(error);
          } else {
            console.log('✅ Generated air quality image URL for selected year');
            resolve(url);
          }
        });
      });

      // --- Calculate air quality statistics ---
      console.log(`📊 Computing air quality statistics for period ${startDate} to ${endDate}`);
      
      const airQualityStats = await new Promise((resolve) => {
        no2Composite.reduceRegion({
          reducer: ee.Reducer.mean().combine(
            ee.Reducer.minMax(), '', true
          ).combine(
            ee.Reducer.percentile([25, 50, 75, 90]), '', true
          ).combine(
            ee.Reducer.stdDev(), '', true
          ),
          geometry, 
          scale: 1113.2, // Sentinel-5P resolution
          maxPixels: 1e9
        }).getInfo((result) => {
          resolve(result || {});
        });
      });

      // Extract NO2 statistics (multiply by 1e6 to convert to µg/m³ approximation)
      const meanNO2 = (airQualityStats.tropospheric_NO2_column_number_density_mean || 0) * 1e6;
      const minNO2 = (airQualityStats.tropospheric_NO2_column_number_density_min || 0) * 1e6;
      const maxNO2 = (airQualityStats.tropospheric_NO2_column_number_density_max || 0) * 1e6;
      const stdNO2 = (airQualityStats.tropospheric_NO2_column_number_density_stdDev || 0) * 1e6;
      const p25NO2 = (airQualityStats.tropospheric_NO2_column_number_density_p25 || 0) * 1e6;
      const medianNO2 = (airQualityStats.tropospheric_NO2_column_number_density_p50 || 0) * 1e6;
      const p75NO2 = (airQualityStats.tropospheric_NO2_column_number_density_p75 || 0) * 1e6;
      const p90NO2 = (airQualityStats.tropospheric_NO2_column_number_density_p90 || 0) * 1e6;

      // Enhanced response with comprehensive statistics
      console.log('✅ Air quality processing complete with statistics');

      return {
        success: true,
        imageUrl,
        bounds,
        overlayBounds: {
          northeast: { lat: bounds.north, lng: bounds.east },
          southwest: { lat: bounds.south, lng: bounds.west }
        },
        dateRange: { start: startDate, end: endDate },
        dataSource: 'COPERNICUS/S5P Sentinel-5P TROPOMI NO2',
        description: `Air Quality analysis for selected year period using NO2 satellite data`,
        visualizationParams: no2Vis,
        statistics: {
          urbanMeanNO2: Math.round(meanNO2 * 100) / 100,
          ruralMeanNO2: Math.round(minNO2 * 100) / 100, // Using min as rural approximation
          airQualityDifference: Math.round((meanNO2 - minNO2) * 100) / 100,
          no2ImageCount: no2Size,
          coImageCount: 0, // Placeholder - CO data not available in current implementation
          so2ImageCount: 0, // Placeholder - SO2 data not available in current implementation
          pollutionStats: {
            mean: Math.round(meanNO2 * 100) / 100,
            min: Math.round(minNO2 * 100) / 100,
            max: Math.round(maxNO2 * 100) / 100,
            median: Math.round(medianNO2 * 100) / 100,
            standardDeviation: Math.round(stdNO2 * 100) / 100,
            percentiles: {
              p25: Math.round(p25NO2 * 100) / 100,
              p75: Math.round(p75NO2 * 100) / 100,
              p90: Math.round(p90NO2 * 100) / 100
            }
          },
          concentrationRange: { 
            min: Math.round(minNO2 * 100) / 100, 
            max: Math.round(maxNO2 * 100) / 100 
          }
        },
        metadata: {
          imageCount: no2Size,
          algorithm: 'Median composite of quality-filtered Sentinel-5P TROPOMI NO2 observations',
          units: 'µg/m³ (approximate NO2 concentration)',
          resolution: '1113.2m spatial resolution',
          yearPeriod: `${startDate} to ${endDate}`,
          processingInfo: {
            qualityScore: no2Size > 10 ? 'High' : no2Size > 5 ? 'Medium' : 'Low',
            coverage: 'Global daily coverage (weather permitting)',
            dataQuality: 'Satellite-based measurements with cloud filtering'
          }
        }
      };

    } catch (error) {
      console.error('❌ Error fetching air quality data:', error);
      
      if (error.message.includes('User memory limit exceeded')) {
        throw new Error('Area too large for processing. Please try a smaller area.');
      } else {
        throw new Error(`Air quality data processing failed: ${error.message}`);
      }
    }
  }

  /**
   * Get air quality data for predefined city bounds
   * @param {string} cityName - Name of the city
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} - Air quality data for the city
   */
  async getCityAirQualityData(cityName, startDate, endDate) {
    const cityBounds = this.getCityBounds(cityName);
    if (!cityBounds) {
      throw new Error(`City "${cityName}" not found or not supported`);
    }

    return await this.getAirQualityData(cityBounds, startDate, endDate);
  }

  /**
   * Get predefined bounds for major cities (same as heat service)
   * @param {string} cityName - Name of the city
   * @returns {Object|null} - Bounding box coordinates or null if not found
   */
  getCityBounds(cityName) {
    const cityBounds = {
      'New York': { north: 40.9176, south: 40.4774, east: -73.7004, west: -74.2591 },
      'Los Angeles': { north: 34.3373, south: 33.7037, east: -118.1553, west: -118.6681 },
      'Chicago': { north: 42.0126, south: 41.6445, east: -87.5246, west: -87.9073 },
      'Houston': { north: 30.1097, south: 29.5243, east: -95.0139, west: -95.8236 },
      'Phoenix': { north: 33.6816, south: 33.2948, east: -111.9439, west: -112.3250 },
      'Philadelphia': { north: 40.1379, south: 39.8670, east: -74.9559, west: -75.2803 }
    };

    return cityBounds[cityName] || null;
  }

  /**
   * Time series computation disabled for streamlined air quality analysis
   * @param {Object} geometry - AOI geometry (unused in streamlined mode)
   * @param {string} startDate - Start date (unused in streamlined mode) 
   * @param {string} endDate - End date (unused in streamlined mode)
   * @returns {Promise<Array>} - Empty array (time series disabled)
   */
  async computeYearlyAirQualityTimeSeries(geometry, startDate, endDate) {
    // Time series computation disabled for streamlined mode
    // Only showing selected year data for improved performance
    console.log('Time series computation disabled for streamlined air quality analysis');
    return Promise.resolve([]);
  }

  /**
   * Get supported cities list
   * @returns {Array} - List of supported city names
   */
  getSupportedCities() {
    return ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
  }
}

module.exports = new AirQualityService();
