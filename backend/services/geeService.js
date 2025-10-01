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

      // Skip time series computation for streamlined response - only process selected year data
      console.log('✅ Processing complete for selected year range only');

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
   * Fetch Population Density data from NASA SEDAC GPW for demographic analysis (streamlined)
   * @param {Object} bounds - Bounding box coordinates {north, south, east, west}
   * @param {number} year - Year for population data (2000, 2005, 2010, 2015, 2020, 2025)
   * @returns {Promise<Object>} - GEE image data with download URL for selected year only
   */
  async getPopulationData(bounds, year = 2020) {
    await this.initialize();

    try {
      console.log(`👥 Processing population data for selected year ${year} with Google Earth Engine...`);
      
      // --- AOI (Area of Interest) ---
      const geometry = ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]);

      // --- NASA SEDAC Gridded Population of World (GPW) v4.11 ---
      const populationCollection = ee.ImageCollection('CIESIN/GPWv411/GPW_Population_Density');
      
      // Filter by selected year only
      const startYear = year.toString() + '-01-01';
      const endYear = year.toString() + '-12-31';
      
      const populationDensity = populationCollection
        .filterDate(startYear, endYear)
        .first()
        .select('population_density')
        .clip(geometry);

      // Check if data exists for the selected year
      const imageInfo = await new Promise((resolve, reject) => {
        populationDensity.getInfo((info, error) => {
          if (error) {
            reject(error);
          } else if (!info) {
            reject(new Error(`No population data available for selected year ${year}`));
          } else {
            resolve(info);
          }
        });
      });

      console.log(`📊 Processing population density data for selected year ${year}`);

      // --- Visualization parameters ---
      const popVis = { 
        min: 0, 
        max: 1000, 
        palette: ['lightblue', 'yellow', 'orange', 'red', 'darkred'] 
      };

      // --- Generate image thumbnail URL ---
      const areaDeg2 = (bounds.east - bounds.west) * (bounds.north - bounds.south);
      const dimensions = areaDeg2 > 1 ? 1024 : 512;

      const imageUrl = await new Promise((resolve, reject) => {
        populationDensity.getThumbURL(
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
              console.log('✅ Generated population image URL for selected year');
              resolve(url);
            }
          }
        );
      });

      // --- Calculate population statistics ---
      console.log(`📊 Computing population statistics for year ${year}`);
      
      const populationStats = await new Promise((resolve) => {
        populationDensity.reduceRegion({
          reducer: ee.Reducer.mean().combine(
            ee.Reducer.minMax(), '', true
          ).combine(
            ee.Reducer.sum(), '', true
          ).combine(
            ee.Reducer.stdDev(), '', true
          ),
          geometry, 
          scale: 1000, // 1km resolution for population data
          maxPixels: 1e9
        }).getInfo((result) => {
          resolve(result || {});
        });
      });

      // Calculate area for population estimates
      const areaKm2 = await new Promise((resolve) => {
        geometry.area().getInfo((result) => {
          resolve((result || 0) / 1e6); // Convert from m² to km²
        });
      });

      // Extract statistics
      const meanDensity = populationStats.population_density_mean || 0;
      const minDensity = populationStats.population_density_min || 0;
      const maxDensity = populationStats.population_density_max || 0;
      const totalPopulation = populationStats.population_density_sum || 0;
      const stdDensity = populationStats.population_density_stdDev || 0;

      // Enhanced response with comprehensive statistics
      console.log('✅ Population processing complete for selected year with statistics');

      return {
        success: true,
        imageUrl,
        bounds,
        year,
        dataSource: 'NASA SEDAC Gridded Population of the World (GPW) v4.11',
        description: `Population density estimates for selected year ${year}`,
        visualizationParams: popVis,
        statistics: {
          estimatedTotalPopulation: Math.round(totalPopulation),
          urbanMeanDensity: Math.round(meanDensity * 100) / 100,
          ruralMeanDensity: Math.round(minDensity * 100) / 100, // Using min as rural approximation
          populationStats: {
            mean: Math.round(meanDensity * 100) / 100,
            min: Math.round(minDensity * 100) / 100,
            max: Math.round(maxDensity * 100) / 100,
            standardDeviation: Math.round(stdDensity * 100) / 100,
            totalPopulation: Math.round(totalPopulation),
            totalAreaKm2: Math.round(areaKm2 * 100) / 100
          },
          densityRange: { min: minDensity, max: maxDensity },
          totalAreaKm2: Math.round(areaKm2 * 100) / 100
        },
        metadata: {
          algorithm: 'UN-adjusted population estimates from national census data',
          units: 'People per square kilometer',
          resolution: '30 arc-seconds (~1km at equator)',
          dataYear: year,
          source: 'Center for International Earth Science Information Network (CIESIN)',
          processingInfo: {
            imageCount: 1,
            qualityScore: 'High - Census-based estimates',
            coverage: 'Global'
          }
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
        throw new Error(`Population data processing failed: ${error.message}`);
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
   * Compute yearly time series of AOI mean Land Surface Temperature
   * @param {Object} geometry - AOI geometry
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @param {Function} maskLandsatQA - QA masking function
   * @param {Function} toCelsiusL8 - Temperature conversion function
   * @param {Object} inHotMonths - Hot season filter
   * @returns {Promise<Array>} - Array of yearly temperature points
   */
  async computeYearlyTimeSeries(geometry, startDate, endDate, maskLandsatQA, toCelsiusL8, inHotMonths) {
    try {
      // Determine the year range for time series
      const endYear = parseInt(endDate.split('-')[0]);
      const startYear = 2013; // Earliest Landsat 8 data
      
      console.log(`📈 Computing time series from ${startYear} to ${endYear}`);
      
      const timeSeries = [];
      
      // Process each year individually
      for (let year = startYear; year <= endYear; year++) {
        console.log(`📅 Processing year ${year}...`);
        
        try {
          // Create year-specific date range (hot season: April-June)
          const yearStart = `${year}-01-01`;
          const yearEnd = `${year}-12-31`;
          
          // --- Landsat 8/9 Collection 2 Level 2 (merge collections) ---
          const l8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
              .filterBounds(geometry)
              .filterDate(yearStart, yearEnd)
              .filter(ee.Filter.lt('CLOUD_COVER', 20))
              .select(['ST_B10','QA_PIXEL'])
              .map(maskLandsatQA)
              .map(toCelsiusL8);
              
          const l9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
              .filterBounds(geometry)
              .filterDate(yearStart, yearEnd)
              .filter(ee.Filter.lt('CLOUD_COVER', 20))
              .select(['ST_B10','QA_PIXEL'])
              .map(maskLandsatQA)
              .map(toCelsiusL8);
              
          const yearLandsat = l8.merge(l9);
          
          // Filter to hot season (same as main analysis)
          const hotSeasonCollection = yearLandsat.filter(inHotMonths);
          
          // Check if there's any data for this year
          const yearCollectionSize = await new Promise((resolve, reject) => {
            hotSeasonCollection.size().getInfo((size, error) => {
              if (error) reject(error);
              else resolve(size);
            });
          });
          
          if (yearCollectionSize === 0) {
            // No data available for this year
            timeSeries.push({
              year: year,
              meanC: null,
              sampleCount: 0,
              hasData: false
            });
            console.log(`❌ No data available for year ${year}`);
            continue;
          }
          
          // Create hot season composite for this year
          const yearHotComposite = hotSeasonCollection.median().clip(geometry);
          
          // Calculate AOI mean temperature
          const yearMeanResult = await new Promise((resolve, reject) => {
            yearHotComposite.select('LST').reduceRegion({
              reducer: ee.Reducer.mean(),
              geometry: geometry,
              scale: 30,
              maxPixels: 1e9
            }).getInfo((result, error) => {
              if (error) reject(error);
              else resolve(result.LST || null);
            });
          });
          
          if (yearMeanResult !== null && !isNaN(yearMeanResult)) {
            timeSeries.push({
              year: year,
              meanC: parseFloat(yearMeanResult.toFixed(2)),
              sampleCount: yearCollectionSize,
              hasData: true
            });
            console.log(`✅ Year ${year}: ${yearMeanResult.toFixed(2)}°C (${yearCollectionSize} images)`);
          } else {
            // Data exists but computation failed (e.g., all masked pixels)
            timeSeries.push({
              year: year,
              meanC: null,
              sampleCount: yearCollectionSize,
              hasData: false
            });
            console.log(`⚠️ Year ${year}: No valid pixels after masking`);
          }
          
        } catch (yearError) {
          console.warn(`⚠️ Error processing year ${year}:`, yearError.message);
          // Add null entry for failed year
          timeSeries.push({
            year: year,
            meanC: null,
            sampleCount: 0,
            hasData: false
          });
        }
      }
      
      console.log(`📈 Time series computation complete: ${timeSeries.filter(p => p.hasData).length}/${timeSeries.length} years with data`);
      return timeSeries;
      
    } catch (error) {
      console.error('❌ Error computing time series:', error);
      // Return empty array on failure to not break main response
      return [];
    }
  }

  /**
   * Compute yearly time series for population density data
   * @param {Object} geometry - AOI geometry
   * @param {number} baseYear - Base year for the analysis
   * @returns {Promise<Array>} - Array of yearly population points
   */
  async computeYearlyPopulationTimeSeries(geometry, baseYear = 2020) {
    try {
      // Available population data years in GPW v4.11
      const availableYears = [2000, 2005, 2010, 2015, 2020, 2025];
      
      console.log(`📈 Computing population time series for available years: ${availableYears.join(', ')}`);
      
      const timeSeries = [];
      
      // Process each available year
      for (const year of availableYears) {
        console.log(`📅 Processing population year ${year}...`);
        
        try {
          // GPW provides specific year data
          const startDate = `${year}-01-01`;
          const endDate = `${year}-12-31`;
          
          // NASA SEDAC Gridded Population of World (GPW) v4.11
          const populationCollection = ee.ImageCollection('CIESIN/GPWv411/GPW_Population_Density');
          
          const populationDensity = populationCollection
            .filterDate(startDate, endDate)
            .first()
            .select('population_density')
            .clip(geometry);
          
          // Check if data exists for this year
          const hasData = await new Promise((resolve, reject) => {
            populationDensity.getInfo((info, error) => {
              if (error) {
                console.warn(`⚠️ Error checking population data for year ${year}:`, error.message);
                resolve(false);
              } else {
                resolve(info !== null);
              }
            });
          });
          
          if (!hasData) {
            // No data available for this year
            timeSeries.push({
              year: year,
              meanDensity: null,
              totalPopulation: null,
              hasData: false
            });
            console.log(`❌ No population data available for year ${year}`);
            continue;
          }
          
          // Calculate mean population density and total population
          const reduceCfg = { 
            reducer: ee.Reducer.mean().combine(ee.Reducer.sum(), '', true),
            geometry: geometry,
            scale: 1000, // GPW ~1km resolution
            maxPixels: 1e9 
          };
          
          const yearResult = await new Promise((resolve, reject) => {
            populationDensity.reduceRegion(reduceCfg).getInfo((result, error) => {
              if (error) reject(error);
              else resolve(result);
            });
          });
          
          const meanDensity = yearResult.population_density_mean;
          const totalPopulation = yearResult.population_density_sum;
          
          if (meanDensity !== null && !isNaN(meanDensity)) {
            // Calculate area to get proper total population estimate
            const areaResult = await new Promise((resolve, reject) => {
              geometry.area(1).getInfo((area, error) => {
                if (error) reject(error);
                else resolve(area / 1e6); // Convert to km²
              });
            });
            
            const estimatedTotalPopulation = meanDensity * areaResult;
            
            timeSeries.push({
              year: year,
              meanDensity: parseFloat(meanDensity.toFixed(2)),
              totalPopulation: parseFloat(estimatedTotalPopulation.toFixed(0)),
              hasData: true
            });
            console.log(`✅ Year ${year}: ${meanDensity.toFixed(2)} people/km² (Total: ${estimatedTotalPopulation.toFixed(0)})`);
          } else {
            // Data exists but computation failed
            timeSeries.push({
              year: year,
              meanDensity: null,
              totalPopulation: null,
              hasData: false
            });
            console.log(`⚠️ Year ${year}: No valid pixels after processing`);
          }
          
        } catch (yearError) {
          console.warn(`⚠️ Error processing population year ${year}:`, yearError.message);
          // Add null entry for failed year
          timeSeries.push({
            year: year,
            meanDensity: null,
            totalPopulation: null,
            hasData: false
          });
        }
      }
      
      console.log(`📈 Population time series computation complete: ${timeSeries.filter(p => p.hasData).length}/${timeSeries.length} years with data`);
      return timeSeries;
      
    } catch (error) {
      console.error('❌ Error computing population time series:', error);
      // Return empty array on failure to not break main response
      return [];
    }
  }

  /**
   * Get basic population data for risk assessment (lightweight version)
   * @param {Object} bounds - Geographic bounds {west, south, east, north}
   * @param {number} year - Year for population data (2000, 2005, 2010, 2015, 2020)
   * @returns {Promise<Object>} Basic population statistics
   */
  async getBasicPopulationData(bounds, year = 2020) {
    await this.initialize();

    try {
      console.log('👥 Processing basic population data for risk assessment...');
      
      // --- AOI (Area of Interest) ---
      const geometry = ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]);
      
      // Calculate area in km²
      const areaMeters = geometry.area();
      const areaKm2 = areaMeters.divide(1e6);

      // --- NASA SEDAC Gridded Population of World (GPW) v4.11 ---
      const populationCollection = ee.ImageCollection('CIESIN/GPWv411/GPW_Population_Density');
      
      // Filter by year - GPW provides data for 2000, 2005, 2010, 2015, 2020
      const startYear = year.toString() + '-01-01';
      const endYear = year.toString() + '-12-31';
      
      const populationDensity = populationCollection
        .filterDate(startYear, endYear)
        .first()
        .select('population_density')
        .clip(geometry);

      // Check if data exists
      const imageCheck = await new Promise((resolve, reject) => {
        populationDensity.getInfo((info, error) => {
          if (error || !info) {
            reject(new Error(`No population data available for year ${year} in this area`));
          } else {
            resolve(info);
          }
        });
      });

      console.log(`📊 Computing basic population statistics for year ${year}`);

      // --- Calculate basic population statistics ---
      const reduceCfg = { 
        reducer: ee.Reducer.mean().combine(
          ee.Reducer.minMax(), '', true
        ).combine(
          ee.Reducer.sum(), '', true
        ), 
        geometry, 
        scale: 1000,  // ~1km resolution
        maxPixels: 1e6  // Lower limit for faster processing
      };
      
      const [populationStats, areaResult] = await Promise.all([
        new Promise((resolve, reject) => {
          populationDensity.reduceRegion(reduceCfg).getInfo((result, error) => {
            if (error) {
              reject(error);
            } else {
              resolve(result || {});
            }
          });
        }),
        new Promise((resolve, reject) => {
          areaKm2.getInfo((result, error) => {
            if (error) {
              reject(error);
            } else {
              resolve(result || 0);
            }
          });
        })
      ]);

      // Extract population statistics
      const meanDensity = populationStats.population_density_mean || 0;
      const minDensity = populationStats.population_density_min || 0;
      const maxDensity = populationStats.population_density_max || 0;
      const totalPopulation = populationStats.population_density_sum || 0;

      console.log(`✅ Basic population data processed successfully`);
      console.log(`📊 Total Population: ${Math.round(totalPopulation).toLocaleString()}`);
      console.log(`📊 Average Density: ${Math.round(meanDensity)} people/km²`);
      console.log(`📊 Area: ${Math.round(areaResult * 100) / 100} km²`);

      return {
        success: true,
        data: {
          population_sum: Math.round(totalPopulation),
          population_density_mean: Math.round(meanDensity * 100) / 100,
          population_density_min: Math.round(minDensity * 100) / 100,
          population_density_max: Math.round(maxDensity * 100) / 100,
          totalArea: Math.round(areaResult * 100) / 100,
          year: year,
          bounds: bounds,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Error in basic population data processing:', error);
      throw new Error(`Failed to process basic population data: ${error.message}`);
    }
  }

  /**
   * Get Energy Access Proxy data using built-up + nighttime lights analysis (REFACTORED)
   * @param {Object} bounds - Bounding box { west, south, east, north }
   * @param {number} year - Year for analysis (default: 2024)
   * @returns {Promise<Object>} - Energy access proxy data with PNG overlay
   */
  async getEnergyAccessProxy(bounds, year = 2024) {
    await this.initialize();

    const geometry = ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]);
    const analysisScale = 250; // meters

    // Constants for staged analysis
    const STAGES = [
      { name: 'strict',     waterThresh: 50, builtThresh: 0.01, dilate: 0 },
      { name: 'balanced',   waterThresh: 80, builtThresh: 0.005, dilate: 1 },
      { name: 'permissive', waterThresh: 90, builtThresh: 0.002, dilate: 2 },
    ];
    const MIN_TARGET_COVERAGE = 0.10;  // pick first stage >=10%
    const SOFT_COVERAGE_SWITCH = 0.03; // use soft weighting below 3%

    console.log(`🔋 Processing Energy Access Proxy for bounds:`, bounds, `Year: ${year}`);

    try {
      // ---------- DATASETS ----------
      // VIIRS annual (with fallback year)
      const viirs = (y) =>
        ee.ImageCollection('NOAA/VIIRS/DNB/ANNUAL_V22')
          .filterDate(`${y}-01-01`, `${y + 1}-01-01`)
          .select('median');

      const viirsMain = viirs(year);
      const viirsFallback = viirs(year - 1);
      const viirsUse = ee.ImageCollection(
        ee.Algorithms.If(viirsMain.size().gt(0), viirsMain,
          ee.Algorithms.If(viirsFallback.size().gt(0), viirsFallback, viirs(year - 2))
        )
      );

      const ntl = viirsUse.mosaic().rename('ntl').clip(geometry);

      // Validate nighttime lights availability
      const ntlCount = await new Promise((resolve, reject) => {
        viirsUse.size().getInfo((v, e) => e ? reject(e) : resolve(v));
      });
      
      if (!ntlCount) {
        throw new Error(`No VIIRS annual lights available for ${year}, ${year-1}, or ${year-2}. Try a different year or region.`);
      }
      
      console.log(`📡 Using VIIRS nighttime lights data (${ntlCount} images available)`);

      // GHSL built surface (area-preserving coarsen to ~250m)
      const builtSurfaceRaw = ee.Image('JRC/GHSL/P2023A/GHS_BUILT_S/2020').select('built_surface').clip(geometry);
      const builtSurface250 = builtSurfaceRaw
        .reduceResolution({ reducer: ee.Reducer.sum(), maxPixels: 1024 });

      // Built volume (optional in index; leave at native, only use scale in reducers)
      const builtVolume = ee.Image('JRC/GHSL/P2023A/GHS_BUILT_V/2020')
        .select('built_volume_total')
        .clip(geometry);

      // JRC water mask
      const water = ee.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').clip(geometry);
      
      // ESA WorldCover 2021 for built areas
      const worldCover = ee.Image('ESA/WorldCover/v200/2021').select('Map').clip(geometry);
      const wcBuilt = worldCover.eq(50); // Built class = 50

      // Pixel area for consistent fractions
      const pixelArea = ee.Image.pixelArea();

      // Built fraction (0..1), use area-consistent numerator/denominator
      const builtFrac = builtSurface250.divide(pixelArea).clamp(0, 1).rename('builtFrac');

      // Memoize AOI area once
      const totalAreaM2 = await new Promise((resolve, reject) => {
        geometry.area().getInfo((v, e) => e ? reject(e) : resolve(v || 0));
      });
      const totalAreaKm2 = totalAreaM2 / 1e6;

      console.log('📊 Datasets loaded, computing staged analysis masks...');

      // ---------- STAGED ANALYSIS MASK ----------
      let analysisMask, chosenStage = 'permissive_fallback', coverage = 0;
      
      for (const stage of STAGES) {
        const landMask = water.lt(stage.waterThresh);
        let builtMask = builtFrac.gt(stage.builtThresh);
        
        // Add WorldCover built areas with optional dilation
        if (stage.dilate > 0) {
          const wcBuiltDilated = wcBuilt.focal_max({ radius: stage.dilate });
          builtMask = builtMask.or(wcBuiltDilated);
        } else {
          builtMask = builtMask.or(wcBuilt);
        }
        
        const candidateMask = landMask.and(builtMask);
        
        // Compute coverage for this candidate
        const candidateCoverage = await new Promise((resolve, reject) => {
          ee.Image.pixelArea()
            .updateMask(candidateMask)
            .reduceRegion({
              reducer: ee.Reducer.sum(),
              geometry,
              scale: analysisScale,
              maxPixels: 1e13,
              tileScale: 4
            })
            .getInfo((result, error) => {
              if (error) reject(error);
              else {
                const areaM2 = result.area || 0;
                resolve(areaM2 / Math.max(totalAreaM2, 1));
              }
            });
        });
        
        console.log(`📏 Stage ${stage.name}: coverage = ${(candidateCoverage * 100).toFixed(1)}%`);
        
        if (candidateCoverage >= MIN_TARGET_COVERAGE) {
          analysisMask = candidateMask;
          chosenStage = stage.name;
          coverage = candidateCoverage;
          break;
        }
        
        // Always set the last (permissive) as fallback
        if (stage.name === 'permissive') {
          analysisMask = candidateMask;
          coverage = candidateCoverage;
        }
      }

      const analyzableAreaKm2 = (coverage * totalAreaKm2);
      
      console.log(`📊 Selected stage: ${chosenStage}, coverage: ${(coverage * 100).toFixed(1)}%`);
      console.log(`📏 Total area: ${totalAreaKm2.toFixed(1)} km² | Analyzable: ${analyzableAreaKm2.toFixed(1)} km²`);

      // ---------- ROBUST RESCALE ----------
      const robustRescale01 = (img, mask, pLow = 10, pHigh = 90) => {
        const band = img.bandNames().get(0);
        const masked = img.updateMask(mask);
        const stats = masked.reduceRegion({
          reducer: ee.Reducer.percentile([pLow, pHigh]),
          geometry, scale: analysisScale, maxPixels: 1e13, tileScale: 4
        });
        const lo = ee.Number(stats.get(ee.String(band).cat(`_p${pLow}`)));
        const hi = ee.Number(stats.get(ee.String(band).cat(`_p${pHigh}`)));
        const rng = hi.subtract(lo);

        // Fallback to min/max if percentiles collapse
        const minmax = masked.reduceRegion({
          reducer: ee.Reducer.minMax(),
          geometry, scale: analysisScale, maxPixels: 1e13, tileScale: 4
        });
        const minV = ee.Number(minmax.get(ee.String(band).cat('_min')));
        const maxV = ee.Number(minmax.get(ee.String(band).cat('_max')));
        const safeLo = ee.Number(ee.Algorithms.If(rng.lte(0), minV, lo));
        const safeRng = ee.Number(ee.Algorithms.If(rng.lte(0), maxV.subtract(minV), rng)).max(1e-6);

        return img.subtract(safeLo).divide(safeRng).clamp(0, 1);
      };

      // ---------- SOFT-WEIGHTING FALLBACK ----------
      const softNeeded = coverage < SOFT_COVERAGE_SWITCH;
      
      // Compute NTL-based score image (0..1)
      const ntlLog = ntl.add(1).log().rename('ntlLog');
      const ntlLogScaled = robustRescale01(ntlLog, analysisMask, 10, 99);
      
      let scoreForQuantiles;
      if (softNeeded) {
        console.log('⚠️  Using soft-weighting fallback due to low coverage');
        const landPermissive = water.lt(95);
        scoreForQuantiles = ntlLogScaled
          .updateMask(landPermissive)
          .multiply(builtFrac.multiply(0.8).add(0.2));
      } else {
        const lightsLack = ee.Image(1).subtract(ntlLogScaled).rename('lightsLack');
        const builtSurfaceScaled = robustRescale01(builtSurfaceRaw, analysisMask, 10, 90);
        const builtVolumeScaled = robustRescale01(builtVolume, analysisMask, 10, 90);
        const builtIndex = builtSurfaceScaled.multiply(0.6).add(builtVolumeScaled.multiply(0.4)).sqrt().rename('builtIndex');
        const eap = builtIndex.multiply(lightsLack).rename('EAP').updateMask(analysisMask);
        scoreForQuantiles = eap.focal_mean({ kernel: ee.Kernel.square({ radius: 1 }), iterations: 1 });
      }

      console.log('⚡ Computing improved Energy Access Proxy...');

      // ---------- QUANTILES (with fallback) ----------
      const combinedReducer = ee.Reducer.percentile([10, 30, 50, 70, 90])
        .combine(ee.Reducer.minMax(), '', true);
        
      const quantileStats = await new Promise((resolve, reject) => {
        scoreForQuantiles.reduceRegion({
          reducer: combinedReducer,
          geometry, 
          scale: analysisScale, 
          maxPixels: 1e13, 
          tileScale: 4
        }).getInfo((result, error) => {
          if (error) reject(error);
          else resolve(result || {});
        });
      });

      const scoreBandName = scoreForQuantiles.bandNames().get(0);
      const q20 = ee.Number(quantileStats[`${scoreBandName}_p10`] || 0);
      const q40 = ee.Number(quantileStats[`${scoreBandName}_p30`] || 0);
      const q60 = ee.Number(quantileStats[`${scoreBandName}_p50`] || 0);
      const q80 = ee.Number(quantileStats[`${scoreBandName}_p70`] || 0);
      const eMin = ee.Number(quantileStats[`${scoreBandName}_min`] || 0);
      const eMax = ee.Number(quantileStats[`${scoreBandName}_max`] || 1);
      const width = eMax.subtract(eMin).divide(5);

      const degenerate = q80.subtract(q20).lte(1e-6);
      const finalQ20 = ee.Number(ee.Algorithms.If(degenerate, eMin.add(width), q20));
      const finalQ40 = ee.Number(ee.Algorithms.If(degenerate, eMin.add(width.multiply(2)), q40));
      const finalQ60 = ee.Number(ee.Algorithms.If(degenerate, eMin.add(width.multiply(3)), q60));
      const finalQ80 = ee.Number(ee.Algorithms.If(degenerate, eMin.add(width.multiply(4)), q80));

      // ---------- SEVERITY (0..4) ----------
      const severity = scoreForQuantiles.expression(
        '(e <= q20) ? 0 : (e <= q40) ? 1 : (e <= q60) ? 2 : (e <= q80) ? 3 : 4',
        { e: scoreForQuantiles, q20: finalQ20, q40: finalQ40, q60: finalQ60, q80: finalQ80 }
      ).rename('severity');

      // ---------- BATCHED AREA REDUCTIONS ----------
      console.log('📊 Computing all area statistics in single batched call...');
      
      // Create boolean bands for all area calculations
      const km2 = ee.Image.pixelArea().divide(1e6);
      
      // Area bands
      const analyzableBand = analysisMask.multiply(km2).rename('analyzable');
      const criticalBand = scoreForQuantiles.gte(finalQ80).and(analysisMask).multiply(km2).rename('critical');
      const nearBand = scoreForQuantiles.gte(finalQ60).and(scoreForQuantiles.lt(finalQ80)).and(analysisMask).multiply(km2).rename('near');
      
      // Severity bands (5 classes)
      const sev0Band = severity.eq(0).and(analysisMask).multiply(km2).rename('sev0');
      const sev1Band = severity.eq(1).and(analysisMask).multiply(km2).rename('sev1');
      const sev2Band = severity.eq(2).and(analysisMask).multiply(km2).rename('sev2');
      const sev3Band = severity.eq(3).and(analysisMask).multiply(km2).rename('sev3');
      const sev4Band = severity.eq(4).and(analysisMask).multiply(km2).rename('sev4');
      
      // Deprived areas (absolute classification for cross-city comparison)
      const deprivedBand = scoreForQuantiles.gt(0.6)
        .and(ntlLogScaled.lt(0.3))
        .and(builtFrac.gt(0.01)) // Use builtFrac instead of builtIndex for soft path compatibility
        .and(analysisMask)
        .multiply(km2)
        .rename('deprived');
      
      // Combine all bands for single reduction
      const areaBands = ee.Image.cat([
        analyzableBand, criticalBand, nearBand,
        sev0Band, sev1Band, sev2Band, sev3Band, sev4Band,
        deprivedBand
      ]);
      
      // Single batched area computation
      const areaResults = await new Promise((resolve, reject) => {
        areaBands.reduceRegion({
          reducer: ee.Reducer.sum().forEach(areaBands.bandNames()),
          geometry,
          scale: analysisScale,
          maxPixels: 1e13,
          tileScale: 4
        }).getInfo((result, error) => {
          if (error) reject(error);
          else resolve(result || {});
        });
      });
      
      // Extract area results
      const actualAnalyzableKm2 = areaResults.analyzable || 0;
      const criticalKm2 = areaResults.critical || 0;
      const nearKm2 = areaResults.near || 0;
      const normalKm2 = Math.max(0, actualAnalyzableKm2 - criticalKm2 - nearKm2);
      
      const sevAreasKm2 = {
        0: areaResults.sev0 || 0,
        1: areaResults.sev1 || 0,
        2: areaResults.sev2 || 0,
        3: areaResults.sev3 || 0,
        4: areaResults.sev4 || 0
      };
      
      const deprivedKm2 = areaResults.deprived || 0;
      
      // Compute percentages
      const pct = (partKm2) => actualAnalyzableKm2 > 0 ? +(100 * partKm2 / actualAnalyzableKm2).toFixed(1) : 0;
      
      const sevPercents = {};
      for (let i = 0; i < 5; i++) {
        sevPercents[i] = pct(sevAreasKm2[i]);
      }
      
      const deprivedPct = pct(deprivedKm2);

      console.log(` Critical areas: ${criticalKm2.toFixed(1)} km² (${pct(criticalKm2)}%)`);
      console.log(`🟠 Near-critical areas: ${nearKm2.toFixed(1)} km² (${pct(nearKm2)}%)`);
      console.log(`🟢 Normal areas: ${normalKm2.toFixed(1)} km² (${pct(normalKm2)}%)`);
      console.log(`🏗️ Energy-deprived built areas: ${deprivedPct}% (${deprivedKm2.toFixed(1)} km²)`);

      // ---------- VIZ (continuous) ----------
      const eapForViz = scoreForQuantiles.unmask(0); // fill masked pixels with low value (green end)
      const eapVis = { min: 0, max: 1, palette: ['#1a9850', '#66bd63', '#a6d96a', '#ffffbf', '#fdae61', '#f46d43', '#d73027'] };
      const visImage = eapForViz.visualize(eapVis);

      console.log('🖼️ Generating visualization...');
      const imageUrl = await new Promise((resolve, reject) => {
        visImage.getThumbURL(
          { region: geometry, dimensions: 1024, format: 'png' },
          (url, error) => (error ? reject(error) : resolve(url))
        );
      });

      console.log('✅ Energy Access Proxy analysis complete');

      // ---------- RETURN ----------
      return {
        success: true,
        layerType: 'energy',
        imageUrl,
        overlayBounds: {
          southwest: { lat: bounds.south, lng: bounds.west },
          northeast: { lat: bounds.north, lng: bounds.east }
        },
        attribution: 'VIIRS V22 (NOAA), GHSL 2023A (JRC), JRC GSW 1.4',
        timestamp: new Date().toISOString(),
        statistics: {
          totalAreaKm2: +totalAreaKm2.toFixed(1),           // AOI size
          analyzableAreaKm2: +actualAnalyzableKm2.toFixed(1), // built ∧ land (what percentages use)
          criticalAreaKm2: +criticalKm2.toFixed(1),
          criticalAreaPct: pct(criticalKm2),
          nearCriticalAreaKm2: +nearKm2.toFixed(1),
          nearCriticalAreaPct: pct(nearKm2),
          normalAreasKm2: +normalKm2.toFixed(1),
          normalAreasPct: +(100 - pct(criticalKm2) - pct(nearKm2)).toFixed(1),
          // Cross-city comparison metric
          energyDeprivedPct: +deprivedPct.toFixed(2),
          energyDeprivedKm2: +deprivedKm2.toFixed(2),
          // Coverage and data quality
          analysisCoverage: +((coverage * 100).toFixed(1)),
          dataYear: year,
          // Additional legacy fields for compatibility
          totalCriticalAndNearKm2: +(criticalKm2 + nearKm2).toFixed(1),
          totalCriticalAndNearPct: +(pct(criticalKm2) + pct(nearKm2)).toFixed(1),

          // 5-class severity (area-based)
          areaBreakdown: {
            excellent: { km2: +sevAreasKm2[0].toFixed(1), percentage: sevPercents[0] },
            good:      { km2: +sevAreasKm2[1].toFixed(1), percentage: sevPercents[1] },
            moderate:  { km2: +sevAreasKm2[2].toFixed(1), percentage: sevPercents[2] },
            concerning:{ km2: +sevAreasKm2[3].toFixed(1), percentage: sevPercents[3] },
            critical:  { km2: +sevAreasKm2[4].toFixed(1), percentage: sevPercents[4] }
          }
        },
        diagnostics: {
          chosenStage: chosenStage,
          coverage: +coverage.toFixed(3),
          analyzableKm2: +actualAnalyzableKm2.toFixed(1),
          totalKm2: +totalAreaKm2.toFixed(1),
          usedSoftWeighting: softNeeded,
          status: coverage < SOFT_COVERAGE_SWITCH ? 'LOW_COVERAGE' : 'NORMAL'
        },
        metadata: {
          dataSource: 'VIIRS+GHSL+GSW',
          resolution: `${analysisScale}m`,
          yearPeriod: `${year}`,
          algorithm: 'EAP = sqrt(0.6*BuiltSurfaceScaled + 0.4*BuiltVolumeScaled) * (1 - NTL_log_scaled)',
          method: 'Quantile classification with robust rescaling; area-based stats',
          notes: 'Viz unmasked to fill non-analyzed pixels with neutral color (green end)',
          qualityMetrics: {
            coveragePercent: +((coverage * 100).toFixed(1)),
            ntlImagesUsed: ntlCount,
            degeneratePercentiles: false
          }
        }
      };

    } catch (error) {
      console.error('❌ Error in Energy Access Proxy analysis:', error);
      
      if (error.message.includes('User memory limit exceeded')) {
        throw new Error('Area too large for processing. Please try a smaller region.');
      } else if (error.message.includes('Computation timed out')) {
        throw new Error('Processing timed out. Please try a smaller area.');
      } else {
        throw new Error(`Failed to process energy access data: ${error.message}`);
      }
    }
  }

  /**
   * Get energy access data for predefined city bounds
   * @param {string} cityName - Name of the city
   * @param {number} year - Year for analysis (default: 2024)
   * @returns {Promise<Object>} - Energy access data for the city
   */
  async getCityEnergyData(cityName, year = 2024) {
    const cityBounds = this.getCityBounds(cityName);
    if (!cityBounds) {
      throw new Error(`City "${cityName}" not found or not supported`);
    }

    return await this.getEnergyAccessProxy(cityBounds, year);
  }

  /**
   * Get predefined city bounds for major cities
   * @param {string} cityName - Name of the city
   * @returns {Object|null} - City bounds or null if not found
   */
  getCityBounds(cityName) {
    const cityBounds = {
      'New York': { west: -74.25, south: 40.47, east: -73.70, north: 40.92 },
      'Los Angeles': { west: -118.67, south: 33.70, east: -118.16, north: 34.34 },
      'Chicago': { west: -87.94, south: 41.64, east: -87.52, north: 42.02 },
      'Houston': { west: -95.82, south: 29.52, east: -95.07, north: 30.11 },
      'Phoenix': { west: -112.32, south: 33.27, east: -111.93, north: 33.69 },
      'Philadelphia': { west: -75.28, south: 39.86, east: -74.96, north: 40.14 },
      'Singapore': { west: 103.75, south: 1.28, east: 103.92, north: 1.42 }
    };
    
    return cityBounds[cityName] || null;
  }

  /**
   * Get supported cities list
   * @returns {Array} - List of supported city names
   */
  getSupportedCities() {
    return ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'Singapore'];
  }
}

module.exports = new GEEService();