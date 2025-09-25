// Heat Island Controller
// Handles HTTP requests for urban heat island data
const geeService = require('../services/geeService');

/**
 * Get heat island data for a specified bounding box
 * GET /api/heat?bounds=west,south,east,north&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
exports.getHeatData = async (req, res) => {
  console.log('🔥 Heat data request received:', req.query);
  
  try {
    // Parse query parameters
    const { bounds, startDate, endDate } = req.query;

    // Validate bounds parameter
    if (!bounds) {
      return res.status(400).json({
        error: 'Missing bounds parameter',
        message: 'Please provide bounds in format: west,south,east,north',
        example: '/api/heat?bounds=-74.1,40.6,-73.9,40.8',
        timestamp: new Date().toISOString()
      });
    }

    // Parse bounds string into coordinates
    const boundsArray = bounds.split(',').map(coord => parseFloat(coord.trim()));
    
    if (boundsArray.length !== 4 || boundsArray.some(isNaN)) {
      return res.status(400).json({
        error: 'Invalid bounds format',
        message: 'Bounds must be four numbers: west,south,east,north',
        example: 'bounds=-74.1,40.6,-73.9,40.8',
        timestamp: new Date().toISOString()
      });
    }

    const [west, south, east, north] = boundsArray;

    // Validate coordinate ranges
    if (west < -180 || west > 180 || east < -180 || east > 180 || 
        south < -90 || south > 90 || north < -90 || north > 90) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Longitude must be between -180 and 180, latitude between -90 and 90',
        timestamp: new Date().toISOString()
      });
    }

    if (west >= east || south >= north) {
      return res.status(400).json({
        error: 'Invalid bounds',
        message: 'West must be less than east, south must be less than north',
        timestamp: new Date().toISOString()
      });
    }

    const boundsObj = { west, south, east, north };

    // Validate date parameters (optional)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate && !dateRegex.test(startDate)) {
      return res.status(400).json({
        error: 'Invalid start date format',
        message: 'Date must be in YYYY-MM-DD format',
        example: 'startDate=2024-01-01',
        timestamp: new Date().toISOString()
      });
    }

    if (endDate && !dateRegex.test(endDate)) {
      return res.status(400).json({
        error: 'Invalid end date format',
        message: 'Date must be in YYYY-MM-DD format',
        example: 'endDate=2024-08-01',
        timestamp: new Date().toISOString()
      });
    }

    // Set default dates if not provided (recent hot season for best heat data)
    const defaultStartDate = startDate || '2024-01-01';
    const defaultEndDate = endDate || '2024-08-01';

    console.log(`📊 Fetching heat data for bounds: ${JSON.stringify(boundsObj)}`);
    console.log(`📅 Date range: ${defaultStartDate} to ${defaultEndDate}`);

    // Add request timeout handling
    const requestTimeout = setTimeout(() => {
      console.log('⏰ Heat data request taking longer than expected...');
    }, 10000);

    // Fetch heat island data from Google Earth Engine
    const heatData = await geeService.getHeatIslandData(
      boundsObj, 
      defaultStartDate, 
      defaultEndDate
    );

    clearTimeout(requestTimeout);

    // Enhanced response including comprehensive statistics data
    const streamlinedResponse = {
      success: true,
      imageUrl: heatData.imageUrl,
      layerType: 'heatIsland',
      bounds: boundsObj,
      dateRange: { start: defaultStartDate, end: defaultEndDate },
      overlayBounds: {
        northeast: { lat: north, lng: east },
        southwest: { lat: south, lng: west }
      },
      visualizationParams: heatData.visualizationParams,
      statistics: heatData.statistics,
      metadata: {
        dataSource: heatData.dataSource,
        description: heatData.description,
        processingInfo: heatData.processingInfo,
        requestId: `heat_${Date.now()}`,
        processingTime: `${Date.now() - Date.now()}ms`
      },
      attribution: 'NASA Landsat Collection 2 Level 2, MODIS Land Cover',
      timestamp: new Date().toISOString()
    };

    console.log('✅ Heat data successfully processed and returned');
    res.json(streamlinedResponse);

  } catch (error) {
    console.error('❌ Heat data error:', error);
    
    // Determine error type and provide appropriate response
    let statusCode = 500;
    let errorMessage = error.message;
    
    if (error.message.includes('No data available') || error.message.includes('No satellite data')) {
      statusCode = 404;
      errorMessage = 'No heat island data available for the specified area and time period';
    } else if (error.message.includes('authentication')) {
      statusCode = 503;
      errorMessage = 'Google Earth Engine authentication error';
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      statusCode = 429;
      errorMessage = 'Google Earth Engine processing limit reached. Please try again later.';
    } else if (error.message.includes('Area too large')) {
      statusCode = 400;
      errorMessage = 'Requested area too large for processing. Please try a smaller region.';
    } else if (error.message.includes('timed out')) {
      statusCode = 408;
      errorMessage = 'Processing timed out. Please try a smaller area or different time period.';
    }
    
    res.status(statusCode).json({
      error: 'Failed to fetch heat island data',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      suggestions: [
        'Try a smaller area or different date range',
        'Ensure the area has sufficient satellite coverage',
        'Check if the coordinates are in a valid geographic region',
        'Use recent dates (2020-2024) for best data availability'
      ],
      examples: {
        validRequest: '/api/heat?bounds=-74.1,40.6,-73.9,40.8&startDate=2024-01-01&endDate=2024-08-01',
        cityRequest: '/api/heat/city/New York'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get heat island data for a predefined city
 * GET /api/heat/city/:cityName?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
exports.getCityHeatData = async (req, res) => {
  console.log('🏙️ City heat data request received:', req.params, req.query);
  
  try {
    const { cityName } = req.params;
    const { startDate, endDate } = req.query;

    // Validate city parameter
    if (!cityName) {
      return res.status(400).json({
        error: 'Missing city parameter',
        message: 'Please provide a city name in the URL path',
        supportedCities: geeService.getSupportedCities(),
        timestamp: new Date().toISOString()
      });
    }

    // Check if city is supported
    const supportedCities = geeService.getSupportedCities();
    if (!supportedCities.includes(cityName)) {
      return res.status(404).json({
        error: 'City not supported',
        message: `City "${cityName}" is not in our supported cities list`,
        supportedCities: supportedCities,
        suggestions: 'Use the bounds parameter with /api/heat for custom areas',
        timestamp: new Date().toISOString()
      });
    }

    // Validate date parameters if provided
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate && !dateRegex.test(startDate)) {
      return res.status(400).json({
        error: 'Invalid start date format',
        message: 'Date must be in YYYY-MM-DD format',
        timestamp: new Date().toISOString()
      });
    }

    if (endDate && !dateRegex.test(endDate)) {
      return res.status(400).json({
        error: 'Invalid end date format',
        message: 'Date must be in YYYY-MM-DD format',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🌡️ Fetching heat data for ${cityName}`);

    // Fetch city heat data
    const heatData = await geeService.getCityHeatData(
      cityName,
      startDate || '2024-01-01',
      endDate || '2024-08-01'
    );

    // Get city bounds for response
    const cityBounds = geeService.getCityBounds(cityName);

    // Enhanced response for city data with statistics
    const streamlinedResponse = {
      success: true,
      imageUrl: heatData.imageUrl,
      layerType: 'heatIsland',
      city: cityName,
      bounds: cityBounds,
      dateRange: { 
        start: startDate || '2024-01-01', 
        end: endDate || '2024-08-01' 
      },
      overlayBounds: {
        northeast: { lat: cityBounds.north, lng: cityBounds.east },
        southwest: { lat: cityBounds.south, lng: cityBounds.west }
      },
      visualizationParams: heatData.visualizationParams,
      statistics: heatData.statistics,
      metadata: {
        dataSource: heatData.dataSource,
        description: heatData.description,
        processingInfo: heatData.processingInfo,
        requestId: `heat_city_${Date.now()}`,
        processingTime: `${Date.now() - Date.now()}ms`
      },
      attribution: 'NASA Landsat Collection 2 Level 2, MODIS Land Cover',
      timestamp: new Date().toISOString()
    };

    console.log(`✅ City heat data for ${cityName} successfully processed`);
    res.json(streamlinedResponse);

  } catch (error) {
    console.error(`❌ City heat data error for ${req.params.cityName}:`, error);
    
    let statusCode = 500;
    if (error.message.includes('not found') || error.message.includes('not supported')) {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      error: 'Failed to fetch city heat data',
      message: error.message,
      city: req.params.cityName,
      supportedCities: geeService.getSupportedCities(),
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get available heat data info/metadata
 * GET /api/heat/info
 */
exports.getHeatInfo = (req, res) => {
  res.json({
    success: true,
    info: {
      title: 'Urban Heat Island Analysis API',
      dataSource: 'NASA Landsat Collection 2 Level 2 + MODIS Land Cover',
      description: 'Land Surface Temperature data for urban heat island analysis using Google Earth Engine',
      temporalResolution: 'Hot season composite (April-June)',
      spatialResolution: '30 meters',
      units: 'Degrees Celsius',
      availableDateRange: {
        start: '2013-04-11', // Landsat 8 launch
        end: 'Present (with ~2 week delay)'
      },
      supportedCities: geeService.getSupportedCities(),
      endpoints: {
        customArea: {
          path: '/api/heat',
          method: 'GET',
          parameters: {
            bounds: 'Required - west,south,east,north coordinates',
            startDate: 'Optional - YYYY-MM-DD format (default: 2024-01-01)',
            endDate: 'Optional - YYYY-MM-DD format (default: 2024-08-01)'
          },
          example: '/api/heat?bounds=-74.1,40.6,-73.9,40.8&startDate=2024-01-01&endDate=2024-08-01'
        },
        predefinedCity: {
          path: '/api/heat/city/:cityName',
          method: 'GET',
          parameters: {
            cityName: 'Required - One of the supported cities',
            startDate: 'Optional - YYYY-MM-DD format',
            endDate: 'Optional - YYYY-MM-DD format'
          },
          example: '/api/heat/city/New York?startDate=2024-01-01&endDate=2024-08-01'
        },
        info: {
          path: '/api/heat/info',
          method: 'GET',
          description: 'Get this information page'
        }
      },
      dataProcessing: {
        cloudFiltering: 'Images with <20% cloud cover',
        qualityMasking: 'Landsat QA_PIXEL flags applied',
        temporalComposite: 'Median of hot season observations',
        thermalConversion: 'Landsat thermal band converted to Celsius',
        urbanRuralAnalysis: 'MODIS land cover used for classification'
      },
      outputFormat: {
        imageUrl: 'PNG thumbnail URL from Google Earth Engine',
        bounds: 'Geographic bounding box of the analysis area',
        statistics: 'Temperature statistics and urban heat island metrics',
        visualizationParams: 'Color palette and scaling for map display'
      },
      limitations: [
        'Cloud cover may limit data availability in some regions',
        'Processing time increases with area size',
        'Hot season data (April-June) provides best heat island signal',
        'Google Earth Engine quota limits may apply'
      ]
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Get multi-year statistics for heat analysis
 * GET /api/heat/statistics?bounds=west,south,east,north&years=2020,2021,2022
 */
exports.getHeatStatistics = async (req, res) => {
  console.log('📊 Heat statistics request received:', req.query);
  
  try {
    const { bounds, years } = req.query;

    // Validate bounds parameter
    if (!bounds) {
      return res.status(400).json({
        error: 'Missing bounds parameter',
        message: 'Please provide bounds in format: west,south,east,north',
        example: '/api/heat/statistics?bounds=-74.1,40.6,-73.9,40.8&years=2020,2021,2022',
        timestamp: new Date().toISOString()
      });
    }

    // Parse bounds
    const boundsArray = bounds.split(',').map(coord => parseFloat(coord.trim()));
    if (boundsArray.length !== 4 || boundsArray.some(isNaN)) {
      return res.status(400).json({
        error: 'Invalid bounds format',
        message: 'Bounds must be four numbers: west,south,east,north',
        timestamp: new Date().toISOString()
      });
    }

    const [west, south, east, north] = boundsArray;
    const boundsObj = { west, south, east, north };

    // Parse years or use default
    const defaultYears = [2020, 2021, 2022, 2023, 2024];
    const targetYears = years ? 
      years.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y)) : 
      defaultYears;

    console.log(`📊 Fetching heat statistics for ${targetYears.length} years`);

    // Fetch data for each year
    const yearlyStats = [];
    for (const year of targetYears) {
      try {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-08-01`;
        
        const heatData = await geeService.getHeatIslandData(boundsObj, startDate, endDate);
        
        if (heatData.success && heatData.statistics) {
          yearlyStats.push({
            year,
            temperature: heatData.statistics.urbanMeanC,
            heatIslandIntensity: heatData.statistics.heatIslandIntensity,
            imageCount: heatData.statistics.imageCount,
            temperatureRange: heatData.statistics.temperatureRange
          });
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch heat data for year ${year}:`, error.message);
      }
    }

    // Structure data for AI analysis
    const aiAnalysisData = {
      dataType: 'urban_heat_island',
      region: {
        bounds: boundsObj,
        coordinates: `${west},${south} to ${east},${north}`
      },
      temporalCoverage: {
        years: targetYears,
        totalDataPoints: yearlyStats.length
      },
      metrics: yearlyStats.map(stat => ({
        year: stat.year,
        urbanTemperature: stat.temperature,
        heatIslandIntensity: stat.heatIslandIntensity,
        dataQuality: stat.imageCount > 10 ? 'high' : stat.imageCount > 5 ? 'medium' : 'low'
      })),
      trends: yearlyStats.length > 1 ? {
        temperatureTrend: yearlyStats[yearlyStats.length - 1].temperature - yearlyStats[0].temperature,
        heatIslandTrend: yearlyStats[yearlyStats.length - 1].heatIslandIntensity - yearlyStats[0].heatIslandIntensity
      } : null
    };

    res.json({
      success: true,
      type: 'heat_statistics',
      bounds: boundsObj,
      yearlyData: yearlyStats,
      summary: {
        totalYears: yearlyStats.length,
        avgTemperature: yearlyStats.length > 0 ? 
          (yearlyStats.reduce((sum, item) => sum + (item.temperature || 0), 0) / yearlyStats.length).toFixed(2) : null,
        maxHeatIsland: yearlyStats.length > 0 ? 
          Math.max(...yearlyStats.map(item => item.heatIslandIntensity || 0)).toFixed(2) : null
      },
      aiAnalysisData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Heat statistics error:', error);
    res.status(500).json({
      error: 'Failed to fetch heat statistics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get supported cities list
 * GET /api/heat/cities
 */
exports.getSupportedCities = (req, res) => {
  const supportedCities = geeService.getSupportedCities();
  
  res.json({
    success: true,
    count: supportedCities.length,
    cities: supportedCities.map(city => ({
      name: city,
      bounds: geeService.getCityBounds(city),
      endpoint: `/api/heat/city/${encodeURIComponent(city)}`
    })),
    usage: {
      selectCity: 'GET /api/heat/city/{cityName}',
      customArea: 'GET /api/heat?bounds=west,south,east,north'
    },
    timestamp: new Date().toISOString()
  });
};