// Population Controller
// Handles HTTP requests for population density data
const geeService = require('../services/geeService');

/**
 * Get population data for a specified bounding box
 * GET /api/population?bounds=west,south,east,north&year=YYYY
 */
exports.getPopulationData = async (req, res) => {
  console.log('👥 Population data request received:', req.query);
  console.log('🔍 API Access - Population endpoint hit');
  console.log('📝 Request details:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  try {
    // Parse query parameters
    const { bounds, year } = req.query;

    // Validate bounds parameter
    if (!bounds) {
      return res.status(400).json({
        error: 'Missing bounds parameter',
        message: 'Please provide bounds in format: west,south,east,north',
        example: '/api/population?bounds=-74.1,40.6,-73.9,40.8',
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

    // Validate year parameter (optional)
    const validYears = [2000, 2005, 2010, 2015, 2020, 2025];
    const targetYear = year ? parseInt(year) : 2020; // Default to 2020
    
    if (year && !validYears.includes(targetYear)) {
      return res.status(400).json({
        error: 'Invalid year parameter',
        message: `Year must be one of: ${validYears.join(', ')}`,
        availableYears: validYears,
        defaultYear: 2020,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📊 Fetching population data for bounds: ${JSON.stringify(boundsObj)}`);
    console.log(`📅 Year: ${targetYear}`);

    // Add request timeout handling
    const requestTimeout = setTimeout(() => {
      console.log('⏰ Population data request taking longer than expected...');
    }, 10000);

    // Fetch population data from Google Earth Engine
    const populationData = await geeService.getPopulationData(
      boundsObj, 
      targetYear
    );

    clearTimeout(requestTimeout);

    // Enhanced response including comprehensive statistics data
    const streamlinedResponse = {
      success: true,
      imageUrl: populationData.imageUrl,
      layerType: 'population',
      bounds: boundsObj,
      year: targetYear,
      overlayBounds: {
        northeast: { lat: north, lng: east },
        southwest: { lat: south, lng: west }
      },
      visualizationParams: populationData.visualizationParams,
      statistics: populationData.statistics,
      metadata: populationData.metadata,
      attribution: 'NASA Socioeconomic Data and Applications Center (SEDAC)',
      timestamp: new Date().toISOString()
    };

    console.log('✅ Population data successfully processed and returned');
    res.json(streamlinedResponse);

  } catch (error) {
    console.error('❌ Population data error:', error);
    
    // Determine error type and provide appropriate response
    let statusCode = 500;
    let errorMessage = error.message;
    
    if (error.message.includes('No data available') || error.message.includes('No population data')) {
      statusCode = 404;
      errorMessage = 'No population data available for the specified area and year';
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
      errorMessage = 'Processing timed out. Please try a smaller area.';
    }
    
    res.status(statusCode).json({
      error: 'Failed to fetch population data',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      suggestions: [
        'Try a smaller area',
        'Use a supported year (2000, 2005, 2010, 2015, 2020, 2025)',
        'Check if the coordinates are in a valid geographic region'
      ],
      examples: {
        validRequest: '/api/population?bounds=-74.1,40.6,-73.9,40.8&year=2020',
        cityRequest: '/api/population/city/New York'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get population data for a predefined city
 * GET /api/population/city/:cityName?year=YYYY
 */
exports.getCityPopulationData = async (req, res) => {
  console.log('🏙️ City population data request received:', req.params, req.query);
  
  try {
    const { cityName } = req.params;
    const { year } = req.query;

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
        suggestions: 'Use the bounds parameter with /api/population for custom areas',
        timestamp: new Date().toISOString()
      });
    }

    // Validate year parameter if provided
    const validYears = [2000, 2005, 2010, 2015, 2020, 2025];
    const targetYear = year ? parseInt(year) : 2020;
    
    if (year && !validYears.includes(targetYear)) {
      return res.status(400).json({
        error: 'Invalid year parameter',
        message: `Year must be one of: ${validYears.join(', ')}`,
        availableYears: validYears,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`👥 Fetching population data for ${cityName}, year ${targetYear}`);

    // Fetch city population data
    const populationData = await geeService.getCityPopulationData(
      cityName,
      targetYear
    );

    // Get city bounds for response
    const cityBounds = geeService.getCityBounds(cityName);

    // Enhanced response for city data with statistics
    const streamlinedResponse = {
      success: true,
      imageUrl: populationData.imageUrl,
      layerType: 'population',
      city: cityName,
      bounds: cityBounds,
      year: targetYear,
      overlayBounds: {
        northeast: { lat: cityBounds.north, lng: cityBounds.east },
        southwest: { lat: cityBounds.south, lng: cityBounds.west }
      },
      visualizationParams: populationData.visualizationParams,
      statistics: populationData.statistics,
      metadata: populationData.metadata,
      attribution: 'NASA Socioeconomic Data and Applications Center (SEDAC)',
      timestamp: new Date().toISOString()
    };

    console.log(`✅ City population data for ${cityName} successfully processed`);
    res.json(streamlinedResponse);

  } catch (error) {
    console.error(`❌ City population data error for ${req.params.cityName}:`, error);
    
    let statusCode = 500;
    if (error.message.includes('not found') || error.message.includes('not supported')) {
      statusCode = 404;
    }
    
    res.status(statusCode).json({
      error: 'Failed to fetch city population data',
      message: error.message,
      city: req.params.cityName,
      supportedCities: geeService.getSupportedCities(),
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get multi-year statistics for population analysis
 * GET /api/population/statistics?bounds=west,south,east,north&years=2000,2005,2010,2015,2020
 */
exports.getPopulationStatistics = async (req, res) => {
  console.log('📊 Population statistics request received:', req.query);
  console.log('🔍 API Access - Population Statistics endpoint hit');
  console.log('📝 Request details:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  try {
    const { bounds, years } = req.query;

    // Validate bounds parameter
    if (!bounds) {
      console.log('❌ Population statistics: Missing bounds parameter');
      return res.status(400).json({
        error: 'Missing bounds parameter',
        message: 'Please provide bounds in format: west,south,east,north',
        example: '/api/population/statistics?bounds=-74.1,40.6,-73.9,40.8&years=2000,2005,2010,2015,2020',
        timestamp: new Date().toISOString()
      });
    }

    // Parse bounds
    const boundsArray = bounds.split(',').map(coord => parseFloat(coord.trim()));
    if (boundsArray.length !== 4 || boundsArray.some(isNaN)) {
      console.log('❌ Population statistics: Invalid bounds format:', bounds);
      return res.status(400).json({
        error: 'Invalid bounds format',
        message: 'Bounds must be four numbers: west,south,east,north',
        timestamp: new Date().toISOString()
      });
    }

    const [west, south, east, north] = boundsArray;
    const boundsObj = { west, south, east, north };

    // Parse years or use default (available population data years)
    const defaultYears = [2000, 2005, 2010, 2015, 2020];
    let targetYears = years ? 
      years.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y)) : 
      defaultYears;

    // Filter to only supported population years
    const supportedYears = [2000, 2005, 2010, 2015, 2020, 2025];
    targetYears = targetYears.filter(year => supportedYears.includes(year));

    console.log(`📊 Processing population statistics for ${targetYears.length} years:`, targetYears);
    console.log('🗺️ Analysis bounds:', boundsObj);

    // Fetch data for each year
    const yearlyStats = [];
    for (const year of targetYears) {
      try {
        console.log(`👥 Fetching population data for year ${year}...`);
        
        const populationData = await geeService.getPopulationData(boundsObj, year);
        
        if (populationData.success && populationData.statistics) {
          const yearStats = {
            year,
            totalPopulation: populationData.statistics.totalPopulation,
            populationDensity: populationData.statistics.populationDensity,
            gridCells: populationData.statistics.gridCells,
            maxDensity: populationData.statistics.maxDensity,
            avgDensity: populationData.statistics.avgDensity,
            populationRange: populationData.statistics.populationRange,
            qualityScore: populationData.metadata?.processingInfo?.qualityScore
          };
          yearlyStats.push(yearStats);
          console.log(`✅ Added population data for ${year}:`, yearStats);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch population data for year ${year}:`, error.message);
      }
    }

    // Structure data for AI analysis
    const aiAnalysisData = {
      dataType: 'population_analysis',
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
        population: stat.totalPopulation,
        density: stat.populationDensity,
        maxDensity: stat.maxDensity,
        dataQuality: stat.qualityScore || 'unknown'
      })),
      trends: yearlyStats.length > 1 ? {
        populationGrowth: yearlyStats[yearlyStats.length - 1].totalPopulation - yearlyStats[0].totalPopulation,
        densityChange: yearlyStats[yearlyStats.length - 1].populationDensity - yearlyStats[0].populationDensity,
        growthRate: yearlyStats.length > 1 ? 
          ((yearlyStats[yearlyStats.length - 1].totalPopulation / yearlyStats[0].totalPopulation - 1) * 100).toFixed(2) : null
      } : null
    };

    console.log(`✅ Population statistics processing complete. Found data for ${yearlyStats.length} years`);

    res.json({
      success: true,
      type: 'population_statistics',
      bounds: boundsObj,
      yearlyData: yearlyStats,
      summary: {
        totalYears: yearlyStats.length,
        avgPopulation: yearlyStats.length > 0 ? 
          Math.round(yearlyStats.reduce((sum, item) => sum + (item.totalPopulation || 0), 0) / yearlyStats.length) : null,
        avgDensity: yearlyStats.length > 0 ? 
          (yearlyStats.reduce((sum, item) => sum + (item.populationDensity || 0), 0) / yearlyStats.length).toFixed(2) : null,
        maxPopulation: yearlyStats.length > 0 ? 
          Math.max(...yearlyStats.map(item => item.totalPopulation || 0)) : null,
        avgGridCells: yearlyStats.length > 0 ? 
          Math.round(yearlyStats.reduce((sum, item) => sum + (item.gridCells || 0), 0) / yearlyStats.length) : null
      },
      aiAnalysisData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Population statistics error:', error);
    res.status(500).json({
      error: 'Failed to fetch population statistics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get available population data info/metadata
 * GET /api/population/info
 */
exports.getPopulationInfo = (req, res) => {
  console.log('ℹ️ API Access - Population Info endpoint hit');
  res.json({
    success: true,
    info: {
      title: 'Population Density Analysis API',
      dataSource: 'NASA SEDAC - Gridded Population of the World (GPW)',
      description: 'Population density analysis using satellite-derived population data',
      temporalResolution: '5-year intervals',
      spatialResolution: '30 arc-seconds (~1km at equator)',
      units: 'persons per square kilometer',
      availableYears: [2000, 2005, 2010, 2015, 2020, 2025],
      note: '2025 data may be projected/estimated',
      endpoints: {
        customArea: {
          path: '/api/population',
          method: 'GET',
          parameters: {
            bounds: 'Required - west,south,east,north coordinates',
            year: 'Optional - Available years: 2000,2005,2010,2015,2020,2025 (default: 2020)'
          },
          example: '/api/population?bounds=-74.1,40.6,-73.9,40.8&year=2020'
        },
        statistics: {
          path: '/api/population/statistics',
          method: 'GET',
          parameters: {
            bounds: 'Required - west,south,east,north coordinates',
            years: 'Optional - comma-separated years from available years (default: all years)'
          },
          example: '/api/population/statistics?bounds=-74.1,40.6,-73.9,40.8&years=2000,2005,2010,2015,2020'
        }
      }
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Get supported cities list
 * GET /api/population/cities
 */
exports.getSupportedCities = (req, res) => {
  const supportedCities = geeService.getSupportedCities();
  
  res.json({
    success: true,
    count: supportedCities.length,
    cities: supportedCities.map(city => ({
      name: city,
      bounds: geeService.getCityBounds(city),
      endpoint: `/api/population/city/${encodeURIComponent(city)}`
    })),
    usage: {
      selectCity: 'GET /api/population/city/{cityName}',
      customArea: 'GET /api/population?bounds=west,south,east,north',
      riskAssessment: 'GET /api/population/basic?bounds=west,south,east,north'
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Get basic population data for risk assessment (lightweight endpoint)
 * GET /api/population/basic?bounds=west,south,east,north&year=YYYY
 */
exports.getBasicPopulationData = async (req, res) => {
  console.log('👥 Basic population data request received:', req.query);
  
  try {
    // Parse query parameters
    const { bounds, year } = req.query;

    // Validate bounds parameter
    if (!bounds) {
      return res.status(400).json({
        error: 'Missing bounds parameter',
        message: 'Please provide bounds in format: west,south,east,north',
        example: '/api/population/basic?bounds=-74.1,40.6,-73.9,40.8',
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

    // Validate year parameter (optional)
    const validYears = [2000, 2005, 2010, 2015, 2020];
    const targetYear = year ? parseInt(year) : 2020; // Default to 2020
    
    if (year && !validYears.includes(targetYear)) {
      return res.status(400).json({
        error: 'Invalid year parameter',
        message: `Year must be one of: ${validYears.join(', ')}`,
        availableYears: validYears,
        defaultYear: 2020,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📊 Fetching basic population data for bounds: ${JSON.stringify(boundsObj)}`);
    console.log(`📅 Year: ${targetYear}`);

    // Add request timeout handling
    const requestTimeout = setTimeout(() => {
      console.log('⏰ Basic population data request taking longer than expected...');
    }, 5000); // Shorter timeout for basic endpoint

    // Fetch basic population data from Google Earth Engine
    const populationResponse = await geeService.getBasicPopulationData(
      boundsObj, 
      targetYear
    );

    clearTimeout(requestTimeout);

    // Return the response directly from the service
    res.json(populationResponse);

    console.log('✅ Basic population data request completed successfully');

  } catch (error) {
    console.error('❌ Error in basic population data endpoint:', error);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes('No population data available')) {
      statusCode = 404;
    } else if (error.message.includes('Invalid') || error.message.includes('bounds')) {
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: 'Basic population data processing failed',
      message: error.message,
      code: statusCode,
      timestamp: new Date().toISOString(),
      suggestion: statusCode === 404 ? 
        'Try a different year or geographic area with known population data' :
        'Please check your request parameters and try again'
    });
  }
};