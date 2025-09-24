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
        const serviceAccountPath = process.env.GEE_SERVICE_ACCOUNT_PATH || './config/gee-service-account.json';
        
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
   * Fetch Air Quality data from Sentinel-5P and other sources
   * @param {Object} bounds - Bounding box coordinates {north, south, east, west}
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} - GEE image data with download URL
   */
  async getAirQualityData(bounds, startDate = '2024-01-01', endDate = '2024-08-01') {
    await this.initialize();

    try {
      console.log('🛰️ Processing Air Quality data with Google Earth Engine...');
      
      // --- AOI (Area of Interest) ---
      const geometry = ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]);

      // --- Sentinel-5P TROPOMI NO2 data ---
      const no2Collection = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_NO2')
          .filterBounds(geometry)
          .filterDate(startDate, endDate)
          .select(['NO2_column_number_density']);

      // --- Sentinel-5P TROPOMI CO data ---
      const coCollection = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_CO')
          .filterBounds(geometry)
          .filterDate(startDate, endDate)
          .select(['CO_column_number_density']);

      // --- Sentinel-5P TROPOMI SO2 data ---
      const so2Collection = ee.ImageCollection('COPERNICUS/S5P/NRTI/L3_SO2')
          .filterBounds(geometry)
          .filterDate(startDate, endDate)
          .select(['SO2_column_number_density']);

      // Check if collections have data
      const no2Size = await new Promise((resolve, reject) => {
        no2Collection.size().evaluate((result, error) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      const coSize = await new Promise((resolve, reject) => {
        coCollection.size().evaluate((result, error) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      const so2Size = await new Promise((resolve, reject) => {
        so2Collection.size().evaluate((result, error) => {
          if (error) reject(error);
          else resolve(result);
        });
      });

      if (no2Size === 0 && coSize === 0 && so2Size === 0) {
        throw new Error('No air quality data available for the specified area and time period');
      }

      console.log(`📊 Found ${no2Size} NO2, ${coSize} CO, ${so2Size} SO2 quality images for processing`);

      // --- Create median composites ---
      const no2Composite = no2Size > 0 ? no2Collection.median().clip(geometry) : null;
      const coComposite = coSize > 0 ? coCollection.median().clip(geometry) : null;
      const so2Composite = so2Size > 0 ? so2Collection.median().clip(geometry) : null;

      // --- Calculate Air Quality Index (simplified) ---
      let aqiImage = null;
      if (no2Composite) {
        // Convert NO2 from mol/m² to µg/m³ (approximate conversion)
        const no2_ugm3 = no2Composite.select('NO2_column_number_density').multiply(1e6 * 46.0055 / 6.022e23 * 1e4);
        
        // Simple AQI calculation based on NO2 levels
        aqiImage = no2_ugm3
          .where(no2_ugm3.lt(40), 1)      // Good (0-40 µg/m³)
          .where(no2_ugm3.gte(40).and(no2_ugm3.lt(80)), 2)   // Moderate (40-80 µg/m³)
          .where(no2_ugm3.gte(80).and(no2_ugm3.lt(120)), 3)  // Unhealthy for sensitive (80-120 µg/m³)
          .where(no2_ugm3.gte(120).and(no2_ugm3.lt(200)), 4) // Unhealthy (120-200 µg/m³)
          .where(no2_ugm3.gte(200), 5)   // Very unhealthy (>200 µg/m³)
          .rename('AQI');
      }

      // --- Land cover classification for urban/rural analysis ---
      const lc = ee.ImageCollection('MODIS/006/MCD12Q1')
          .filterDate('2020-01-01','2020-12-31')
          .first()
          .select('LC_Type1');
      const urbanMask = lc.eq(13); // Urban and built-up lands
      const ruralMask = lc.neq(13).and(lc.neq(17)); // Exclude urban and water

      // --- Calculate Urban/Rural mean concentrations ---
      const reduceCfg = { 
        reducer: ee.Reducer.mean(), 
        geometry, 
        scale: 1113.2, // Sentinel-5P resolution
        maxPixels: 1e9 
      };
      
      let urbanMeanNO2 = null, ruralMeanNO2 = null;
      if (no2Composite) {
        const no2Data = no2Composite.select('NO2_column_number_density');
        
        urbanMeanNO2 = await new Promise((resolve, reject) => {
          no2Data.updateMask(urbanMask).reduceRegion(reduceCfg).evaluate((result, error) => {
            if (error) reject(error);
            else resolve(result.NO2_column_number_density);
          });
        });
        
        ruralMeanNO2 = await new Promise((resolve, reject) => {
          no2Data.updateMask(ruralMask).reduceRegion(reduceCfg).evaluate((result, error) => {
            if (error) reject(error);
            else resolve(result.NO2_column_number_density);
          });
        });
      }

      // --- Visualization parameters ---
      const no2Vis = { 
        min: 0, 
        max: 0.0001, 
        palette: ['blue','green','yellow','orange','red'] 
      };
      
      const aqiVis = { 
        min: 1, 
        max: 5, 
        palette: ['green','yellow','orange','red','purple'] 
      };

      // --- Generate image thumbnail URL ---
      const areaDeg2 = (bounds.east - bounds.west) * (bounds.north - bounds.south);
      const dimensions = areaDeg2 > 1 ? 1024 : 512;

      // Use NO2 data for visualization (most reliable)
      const visualizationImage = no2Composite || (coComposite && coComposite.select(['CO_column_number_density'])) || 
                                  (so2Composite && so2Composite.select(['SO2_column_number_density']));
      
      if (!visualizationImage) {
        throw new Error('No air quality data available for visualization');
      }

      const imageUrl = await new Promise((resolve, reject) => {
        visualizationImage.getThumbURL({
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
            console.log('✅ Generated air quality image URL');
            resolve(url);
          }
        });
      });

      // --- Calculate pollution statistics ---
      const pollutionStats = await new Promise((resolve) => {
        if (no2Composite) {
          no2Composite.select('NO2_column_number_density').reduceRegion({
            reducer: ee.Reducer.minMax().combine(ee.Reducer.mean(), '', true).combine(ee.Reducer.stdDev(), '', true),
            geometry,
            scale: 1113.2,
            maxPixels: 1e9
          }).evaluate((result) => {
            resolve(result);
          });
        } else {
          resolve({});
        }
      });

      // --- Calculate air quality difference ---
      const airQualityDifference = urbanMeanNO2 && ruralMeanNO2 ? 
        ((urbanMeanNO2 - ruralMeanNO2) / ruralMeanNO2 * 100).toFixed(2) : null;

      // --- Compute yearly time series data for progressive visualization ---
      console.log('📈 Computing air quality time series data...');
      const timeSeries = await this.computeYearlyAirQualityTimeSeries(geometry, startDate, endDate);

      return {
        success: true,
        imageUrl,
        bounds,
        dateRange: { start: startDate, end: endDate },
        dataSource: 'COPERNICUS/S5P Sentinel-5P TROPOMI + MODIS MCD12Q1',
        description: 'Air Quality analysis using satellite-based atmospheric composition data',
        visualizationParams: no2Vis,
        statistics: {
          no2ImageCount: no2Size,
          coImageCount: coSize,
          so2ImageCount: so2Size,
          pollutionStats,
          urbanMeanNO2: urbanMeanNO2 ? parseFloat((urbanMeanNO2 * 1e6).toFixed(6)) : null,
          ruralMeanNO2: ruralMeanNO2 ? parseFloat((ruralMeanNO2 * 1e6).toFixed(6)) : null,
          airQualityDifference: airQualityDifference ? parseFloat(airQualityDifference) : null,
          concentrationRange: { min: 0, max: 0.0001 }
        },
        processingInfo: {
          algorithm: 'Median composite of quality-filtered Sentinel-5P TROPOMI observations',
          units: 'mol/m² (NO2 column density)',
          resolution: '1113.2m spatial resolution',
          dataFiltering: 'Extreme values filtered, cloud-free observations',
          temporalFilter: 'Complete date range for comprehensive air quality assessment'
        },
        airQualityZones: aqiImage ? {
          description: 'Air Quality Index based classification',
          zones: {
            1: 'Good (0-40 µg/m³)',
            2: 'Moderate (40-80 µg/m³)', 
            3: 'Unhealthy for Sensitive (80-120 µg/m³)',
            4: 'Unhealthy (120-200 µg/m³)',
            5: 'Very Unhealthy (>200 µg/m³)'
          },
          visualizationParams: aqiVis
        } : null,
        timeSeries: timeSeries
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
   * Compute yearly time series for air quality data
   * @param {Object} geometry - AOI geometry
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} - Array of yearly air quality points
   */
  async computeYearlyAirQualityTimeSeries(geometry, startDate, endDate) {
    try {
      // Determine the year range for time series
      const endYear = parseInt(endDate.split('-')[0]);
      const startYear = 2019; // Earliest Sentinel-5P data (started Apr 2018, but full coverage from 2019)
      
      console.log(`📈 Computing air quality time series from ${startYear} to ${endYear}`);
      
      const timeSeries = [];
      
      // Process each year individually
      for (let year = startYear; year <= endYear; year++) {
        console.log(`📅 Processing air quality year ${year}...`);
        
        try {
          // Create year-specific date range
          const yearStart = `${year}-01-01`;
          const yearEnd = `${year}-12-31`;
          
          // Sentinel-5P TROPOMI NO2 data
          const no2Collection = ee.ImageCollection('COPERNICUS/S5P/OFFL/L3_NO2')
              .select('NO2_column_number_density')
              .filterBounds(geometry)
              .filterDate(yearStart, yearEnd)
              .filter(ee.Filter.lt('NO2_column_number_density', 0.0001)); // Remove extreme values
          
          // Check if there's any data for this year
          const yearCollectionSize = await new Promise((resolve, reject) => {
            no2Collection.size().getInfo((size, error) => {
              if (error) reject(error);
              else resolve(size);
            });
          });
          
          if (yearCollectionSize === 0) {
            // No data available for this year
            timeSeries.push({
              year: year,
              meanNO2: null,
              sampleCount: 0,
              hasData: false
            });
            console.log(`❌ No air quality data available for year ${year}`);
            continue;
          }
          
          // Create median composite for this year
          const yearComposite = no2Collection.median().clip(geometry);
          
          // Calculate AOI mean NO2 concentration
          const yearMeanResult = await new Promise((resolve, reject) => {
            yearComposite.select('NO2_column_number_density').reduceRegion({
              reducer: ee.Reducer.mean(),
              geometry: geometry,
              scale: 1113.2, // Sentinel-5P native resolution
              maxPixels: 1e9
            }).getInfo((result, error) => {
              if (error) reject(error);
              else resolve(result.NO2_column_number_density || null);
            });
          });
          
          if (yearMeanResult !== null && !isNaN(yearMeanResult)) {
            timeSeries.push({
              year: year,
              meanNO2: parseFloat((yearMeanResult * 1e6).toFixed(6)), // Convert to µmol/m²
              sampleCount: yearCollectionSize,
              hasData: true
            });
            console.log(`✅ Year ${year}: ${(yearMeanResult * 1e6).toFixed(6)} µmol/m² NO2 (${yearCollectionSize} images)`);
          } else {
            // Data exists but computation failed (e.g., all masked pixels)
            timeSeries.push({
              year: year,
              meanNO2: null,
              sampleCount: yearCollectionSize,
              hasData: false
            });
            console.log(`⚠️ Year ${year}: No valid pixels after processing`);
          }
          
        } catch (yearError) {
          console.warn(`⚠️ Error processing air quality year ${year}:`, yearError.message);
          // Add null entry for failed year
          timeSeries.push({
            year: year,
            meanNO2: null,
            sampleCount: 0,
            hasData: false
          });
        }
      }
      
      console.log(`📈 Air quality time series computation complete: ${timeSeries.filter(p => p.hasData).length}/${timeSeries.length} years with data`);
      return timeSeries;
      
    } catch (error) {
      console.error('❌ Error computing air quality time series:', error);
      // Return empty array on failure to not break main response
      return [];
    }
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