// Google Earth Engine Service Module for Heat Island Analysis
// Handles all interactions with Google Earth Engine API for heat data
const ee = require('@google/earthengine');
const path = require('path');

class GEEService {
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
          throw new Error(`GEE service account file not found at: ${serviceAccountPath}`);
        }

        const serviceAccount = require(path.resolve(serviceAccountPath));
        
        ee.data.authenticateViaPrivateKey(
          serviceAccount,
          () => {
            ee.initialize(
              null,
              null,
              () => {
                console.log('✅ Google Earth Engine initialized successfully');
                this.isInitialized = true;
                resolve();
              },
              (error) => {
                console.error('❌ Failed to initialize Google Earth Engine:', error);
                reject(error);
              }
            );
          },
          (error) => {
            console.error('❌ Failed to authenticate with Google Earth Engine:', error);
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
   * Fetch Land Surface Temperature data from Landsat for heat island analysis
   * @param {Object} bounds - Bounding box coordinates {north, south, east, west}
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} - GEE image data with download URL
   */
  async getHeatIslandData(bounds, startDate = '2024-01-01', endDate = '2024-08-01') {
    await this.initialize();

    try {
      console.log('🛰️ Processing Landsat LST data with Google Earth Engine...');
      
      // --- AOI (Area of Interest) ---
      const geometry = ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]);

      // --- Helper Functions ---
      const inHotMonths = ee.Filter.calendarRange(4, 6, 'month'); // Apr–Jun for best heat data
      
      // QA_PIXEL bits (L2): 3 = cloud shadow, 4 = snow/ice, 5 = cloud, 7 = cirrus
      const maskLandsatQA = (img) => {
        const qa = img.select('QA_PIXEL');
        const cloudShadow = qa.bitwiseAnd(1 << 3).eq(0);
        const snowIce     = qa.bitwiseAnd(1 << 4).eq(0);
        const cloud       = qa.bitwiseAnd(1 << 5).eq(0);
        const cirrus      = qa.bitwiseAnd(1 << 7).eq(0);
        return img.updateMask(cloudShadow.and(snowIce).and(cloud).and(cirrus));
      };
      
      // Convert Landsat thermal band to Celsius
      const toCelsiusL8 = (img) => {
        const lstC = img.select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15).rename('LST');
        return img.addBands(lstC, null, true).copyProperties(img, ['system:time_start']);
      };

      // --- Landsat 8/9 Collection 2 Level 2 (merge collections) ---
      const l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
          .filterBounds(geometry)
          .filterDate(startDate, endDate)
          .filter(ee.Filter.lt('CLOUD_COVER', 20))
          .select(['ST_B10','QA_PIXEL'])
          .map(maskLandsatQA)
          .map(toCelsiusL8);
          
      const l9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
          .filterBounds(geometry)
          .filterDate(startDate, endDate)
          .filter(ee.Filter.lt('CLOUD_COVER', 20))
          .select(['ST_B10','QA_PIXEL'])
          .map(maskLandsatQA)
          .map(toCelsiusL8);
          
      const landsat = l8.merge(l9);

      // Check if collection has data
      const collectionSize = await new Promise((resolve, reject) => {
        landsat.filter(inHotMonths).size().getInfo((size, error) => {
          if (error) reject(error);
          else resolve(size);
        });
      });

      if (collectionSize === 0) {
        throw new Error('No data available for the specified area and time period');
      }

      console.log(`📊 Found ${collectionSize} quality Landsat images for processing`);

      // --- Hot-season composite (Apr–Jun median) ---
      const hotComposite = landsat.filter(inHotMonths).median().clip(geometry);

      // --- Land cover classification for urban/rural analysis ---
      const lc = ee.ImageCollection('MODIS/006/MCD12Q1')
          .filterDate('2020-01-01','2020-12-31')
          .first()
          .select('LC_Type1');
      const urbanMask = lc.eq(13); // Urban and built-up lands
      const ruralMask = lc.neq(13).and(lc.neq(17)); // Exclude urban and water

      // --- Calculate Urban/Rural mean temperatures ---
      const reduceCfg = { 
        reducer: ee.Reducer.mean(), 
        geometry, 
        scale: 30, 
        maxPixels: 1e9 
      };
      
      const urbanMeanResult = await new Promise((resolve, reject) => {
        hotComposite.select('LST').updateMask(urbanMask).reduceRegion(reduceCfg).getInfo((result, error) => {
          if (error) reject(error);
          else resolve(result.LST || null);
        });
      });
      
      const ruralMeanResult = await new Promise((resolve, reject) => {
        hotComposite.select('LST').updateMask(ruralMask).reduceRegion(reduceCfg).getInfo((result, error) => {
          if (error) reject(error);
          else resolve(result.LST || null);
        });
      });

      // --- Create heat intensity zones ---
      const LST = hotComposite.select('LST');
      const heatZones = LST
        .where(LST.lt(30), 1)       // Cool zones
        .where(LST.gte(30).and(LST.lt(35)), 2)  // Moderate zones
        .where(LST.gte(35).and(LST.lt(40)), 3)  // Hot zones
        .where(LST.gte(40), 4)      // Extreme heat zones
        .rename('HeatZones');

      // --- Visualization parameters ---
      const lstVis = { 
        min: 25, 
        max: 45, 
        palette: ['blue','cyan','green','yellow','orange','red'] 
      };
      
      const zoneVis = { 
        min: 1, 
        max: 4, 
        palette: ['blue','green','yellow','red'] 
      };

      // --- Generate image thumbnail URL ---
      // Determine dimensions based on area size (larger areas get higher resolution)
      const areaDeg2 = (bounds.east - bounds.west) * (bounds.north - bounds.south);
      const dimensions = areaDeg2 > 1 ? 1024 : 512;

      const imageUrl = await new Promise((resolve, reject) => {
        LST.getThumbURL(
          { 
            ...lstVis, 
            region: geometry, 
            format: 'png', 
            dimensions 
          },
          (url, err) => {
            if (err) {
              reject(new Error(`Failed to generate image: ${err}`));
            } else {
              resolve(url);
            }
          }
        );
      });

      // --- Calculate temperature statistics ---
      const temperatureStats = await new Promise((resolve) => {
        LST.reduceRegion({
          reducer: ee.Reducer.percentile([10, 25, 50, 75, 90]).combine(
            ee.Reducer.minMax(), '', true
          ).combine(
            ee.Reducer.mean(), '', true
          ),
          geometry, 
          scale: 30, 
          maxPixels: 1e9
        }).getInfo((result) => {
          resolve(result || {});
        });
      });

      // --- Calculate heat island intensity ---
      const heatIslandIntensity = urbanMeanResult && ruralMeanResult ? 
        (urbanMeanResult - ruralMeanResult).toFixed(2) : null;

      return {
        success: true,
        imageUrl,
        bounds,
        dateRange: { start: startDate, end: endDate },
        dataSource: 'LANDSAT/LC08, LC09 Collection 2 Level 2 (ST_B10) + MODIS MCD12Q1',
        description: 'Hot-season (Apr–Jun) Land Surface Temperature median composite with urban heat island analysis',
        visualizationParams: lstVis,
        statistics: {
          imageCount: collectionSize,
          temperatureStats,
          urbanMeanC: urbanMeanResult ? parseFloat(urbanMeanResult.toFixed(2)) : null,
          ruralMeanC: ruralMeanResult ? parseFloat(ruralMeanResult.toFixed(2)) : null,
          heatIslandIntensity: heatIslandIntensity ? parseFloat(heatIslandIntensity) : null,
          temperatureRange: { min: 25, max: 45 }
        },
        processingInfo: {
          algorithm: 'Median composite of quality-filtered Landsat thermal observations',
          units: 'Degrees Celsius',
          resolution: '30m spatial resolution',
          cloudFiltering: 'QA_PIXEL quality flags applied (<20% cloud cover)',
          temporalFilter: 'Hot season months (April-June) for maximum heat signal'
        },
        heatZones: {
          description: 'Temperature-based heat intensity classification',
          zones: {
            1: 'Cool (<30°C)',
            2: 'Moderate (30-35°C)', 
            3: 'Hot (35-40°C)',
            4: 'Extreme (>40°C)'
          },
          visualizationParams: zoneVis
        }
      };

    } catch (error) {
      console.error('❌ Error fetching heat island data:', error);
      
      if (error.message.includes('User memory limit exceeded')) {
        throw new Error('Area too large for processing. Please try a smaller region.');
      } else if (error.message.includes('Computation timed out')) {
        throw new Error('Processing timed out. Please try a smaller area or different time period.');
      } else if (error.message.includes('No data available')) {
        throw new Error('No satellite data available for the specified area and time period.');
      } else {
        throw new Error(`Failed to process heat island data: ${error.message}`);
      }
    }
  }

  /**
   * Get heat island data for predefined city bounds
   * @param {string} cityName - Name of the city
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} - Heat island data for the city
   */
  async getCityHeatData(cityName, startDate, endDate) {
    const cityBounds = this.getCityBounds(cityName);
    if (!cityBounds) {
      throw new Error(`City "${cityName}" not found or not supported`);
    }

    return await this.getHeatIslandData(cityBounds, startDate, endDate);
  }

  /**
   * Get predefined bounds for major cities
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
   * Fetch Population Density data from NASA SEDAC GPW for demographic analysis
   * @param {Object} bounds - Bounding box coordinates {north, south, east, west}
   * @param {number} year - Year for population data (2000, 2005, 2010, 2015, 2020, 2025)
   * @returns {Promise<Object>} - GEE image data with download URL
   */
  async getPopulationData(bounds, year = 2020) {
    await this.initialize();

    try {
      console.log('👥 Processing population data with Google Earth Engine...');
      
      // --- AOI (Area of Interest) ---
      const geometry = ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]);

      // --- NASA SEDAC Gridded Population of World (GPW) v4.11 ---
      // Collection contains population count and density for different years
      const populationCollection = ee.ImageCollection('CIESIN/GPWv411/GPW_Population_Density');
      
      // Filter by year - GPW provides data for 2000, 2005, 2010, 2015, 2020
      const startYear = year.toString() + '-01-01';
      const endYear = year.toString() + '-12-31';
      
      const populationDensity = populationCollection
        .filterDate(startYear, endYear)
        .first()
        .select('population_density')
        .clip(geometry);

      // Check if data exists for the specified year
      const imageInfo = await new Promise((resolve, reject) => {
        populationDensity.getInfo((info, error) => {
          if (error) {
            reject(error);
          } else if (!info) {
            reject(new Error(`No population data available for year ${year}`));
          } else {
            resolve(info);
          }
        });
      });

      console.log(`📊 Processing population density data for year ${year}`);

      // --- Calculate population statistics ---
      const reduceCfg = { 
        reducer: ee.Reducer.percentile([10, 25, 50, 75, 90]).combine(
          ee.Reducer.minMax(), '', true
        ).combine(
          ee.Reducer.mean(), '', true
        ).combine(
          ee.Reducer.sum(), '', true  // Total population estimate
        ), 
        geometry, 
        scale: 1000,  // ~1km resolution for GPW
        maxPixels: 1e9 
      };
      
      const populationStats = await new Promise((resolve, reject) => {
        populationDensity.reduceRegion(reduceCfg).getInfo((result, error) => {
          if (error) {
            reject(error);
          } else {
            resolve(result || {});
          }
        });
      });

      // --- Create population density zones ---
      const popDensity = populationDensity.select('population_density');
      const densityZones = popDensity
        .where(popDensity.lt(10), 1)        // Sparse (< 10 people/km²)
        .where(popDensity.gte(10).and(popDensity.lt(100)), 2)   // Rural (10-100)
        .where(popDensity.gte(100).and(popDensity.lt(1000)), 3) // Suburban (100-1000)
        .where(popDensity.gte(1000).and(popDensity.lt(5000)), 4) // Urban (1000-5000)
        .where(popDensity.gte(5000), 5)     // Dense Urban (> 5000)
        .rename('PopulationZones');

      // --- Land cover integration for urban analysis ---
      const lc = ee.ImageCollection('MODIS/006/MCD12Q1')
          .filterDate('2020-01-01','2020-12-31')
          .first()
          .select('LC_Type1');
      const urbanMask = lc.eq(13); // Urban and built-up lands

      // Calculate urban vs rural population densities
      const urbanPopResult = await new Promise((resolve, reject) => {
        popDensity.updateMask(urbanMask).reduceRegion({
          reducer: ee.Reducer.mean(),
          geometry,
          scale: 1000,
          maxPixels: 1e9
        }).getInfo((result, error) => {
          if (error) reject(error);
          else resolve(result.population_density || null);
        });
      });

      const ruralPopResult = await new Promise((resolve, reject) => {
        popDensity.updateMask(urbanMask.not()).reduceRegion({
          reducer: ee.Reducer.mean(),
          geometry,
          scale: 1000,
          maxPixels: 1e9
        }).getInfo((result, error) => {
          if (error) reject(error);
          else resolve(result.population_density || null);
        });
      });

      // --- Visualization parameters ---
      const popVis = { 
        min: 0, 
        max: 1000, 
        palette: ['lightblue', 'yellow', 'orange', 'red', 'darkred'] 
      };
      
      const zoneVis = { 
        min: 1, 
        max: 5, 
        palette: ['lightblue', 'lightgreen', 'yellow', 'orange', 'red'] 
      };

      // --- Generate image thumbnail URL ---
      const areaDeg2 = (bounds.east - bounds.west) * (bounds.north - bounds.south);
      const dimensions = areaDeg2 > 1 ? 1024 : 512;

      const imageUrl = await new Promise((resolve, reject) => {
        popDensity.getThumbURL(
          { 
            ...popVis, 
            region: geometry, 
            format: 'png', 
            dimensions 
          },
          (url, err) => {
            if (err) {
              reject(new Error(`Failed to generate population image: ${err}`));
            } else {
              resolve(url);
            }
          }
        );
      });

      // --- Calculate area and total population estimate ---
      const areaKm2 = await new Promise((resolve, reject) => {
        geometry.area().divide(1e6).getInfo((area, error) => {
          if (error) reject(error);
          else resolve(area);
        });
      });

      const totalPopulationEstimate = populationStats.population_density_sum 
        ? Math.round(populationStats.population_density_sum)
        : null;

      return {
        success: true,
        imageUrl,
        bounds,
        year,
        dataSource: 'NASA SEDAC Gridded Population of the World (GPW) v4.11',
        description: `Population density estimates for ${year} with demographic analysis`,
        visualizationParams: popVis,
        statistics: {
          populationStats,
          urbanMeanDensity: urbanPopResult ? parseFloat(urbanPopResult.toFixed(2)) : null,
          ruralMeanDensity: ruralPopResult ? parseFloat(ruralPopResult.toFixed(2)) : null,
          totalAreaKm2: parseFloat(areaKm2.toFixed(2)),
          estimatedTotalPopulation: totalPopulationEstimate,
          densityRange: { min: 0, max: 1000 }
        },
        processingInfo: {
          algorithm: 'UN-adjusted population estimates from national census data',
          units: 'People per square kilometer',
          resolution: '30 arc-seconds (~1km at equator)',
          dataYear: year,
          source: 'Center for International Earth Science Information Network (CIESIN)'
        },
        populationZones: {
          description: 'Population density classification zones',
          zones: {
            1: 'Sparse (<10 people/km²)',
            2: 'Rural (10-100 people/km²)', 
            3: 'Suburban (100-1,000 people/km²)',
            4: 'Urban (1,000-5,000 people/km²)',
            5: 'Dense Urban (>5,000 people/km²)'
          },
          visualizationParams: zoneVis
        }
      };

    } catch (error) {
      console.error('❌ Error fetching population data:', error);
      
      if (error.message.includes('User memory limit exceeded')) {
        throw new Error('Area too large for processing. Please try a smaller region.');
      } else if (error.message.includes('Computation timed out')) {
        throw new Error('Processing timed out. Please try a smaller area.');
      } else if (error.message.includes('No population data available')) {
        throw new Error(`No population data available for year ${year}. Available years: 2000, 2005, 2010, 2015, 2020.`);
      } else {
        throw new Error(`Failed to process population data: ${error.message}`);
      }
    }
  }

  /**
   * Get population data for predefined city bounds
   * @param {string} cityName - Name of the city
   * @param {number} year - Year for population data
   * @returns {Promise<Object>} - Population data for the city
   */
  async getCityPopulationData(cityName, year = 2020) {
    const cityBounds = this.getCityBounds(cityName);
    if (!cityBounds) {
      throw new Error(`City "${cityName}" not found or not supported`);
    }

    return await this.getPopulationData(cityBounds, year);
  }

  /**
   * Get supported cities list
   * @returns {Array} - List of supported city names
   */
  getSupportedCities() {
    return ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia'];
  }
}

module.exports = new GEEService();