// Population Controller
// Handles HTTP requests for population density data
const geeService = require('../services/geeService');

/**
 * Get population data for a specified bounding box
 * GET /api/population?bounds=west,south,east,north&year=YYYY
 */
exports.getPopulationData = async (req, res) => {
  console.log('👥 Population data request received:', req.query);
  
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

    // Enhance response with additional metadata for frontend
    const enhancedResponse = {
      success: true,
      data: {
        // Include the essential imageUrl that frontend expects
        imageUrl: populationData.imageUrl,
        // Spread other population data properties
        ...populationData,
        // Add frontend-specific properties
        layerType: 'population',
        opacity: 0.7,
        attribution: 'NASA Socioeconomic Data and Applications Center (SEDAC)',
        // Add coordinate bounds for map overlay
        overlayBounds: {
          northeast: { lat: north, lng: east },
          southwest: { lat: south, lng: west }
        },
        // Enhanced statistics for visualization
        displayInfo: {
          minDensity: populationData.visualizationParams.min,
          maxDensity: populationData.visualizationParams.max,
          colorScale: populationData.visualizationParams.palette,
          legend: {
            title: 'Population Density (people/km²)',
            colors: populationData.visualizationParams.palette,
            labels: ['0', '100', '1,000', '5,000', '10,000+']
          }
        }
      },
      metadata: {
        requestId: `population_${Date.now()}`,
        processingTime: new Date().toISOString(),
        dataQuality: 'excellent',
        dataYear: targetYear,
        cacheExpires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Population data successfully processed and returned');
    res.json(enhancedResponse);

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

    const response = {
      success: true,
      city: cityName,
      data: {
        ...populationData,
        cityBounds,
        layerType: 'cityPopulation',
        opacity: 0.7,
        overlayBounds: {
          northeast: { lat: cityBounds.north, lng: cityBounds.east },
          southwest: { lat: cityBounds.south, lng: cityBounds.west }
        }
      },
      metadata: {
        requestId: `city_population_${Date.now()}`,
        processingTime: new Date().toISOString(),
        dataQuality: 'excellent',
        dataYear: targetYear
      },
      timestamp: new Date().toISOString()
    };

    console.log(`✅ City population data for ${cityName} successfully processed`);
    res.json(response);

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
 * Get available population data info/metadata
 * GET /api/population/info
 */
exports.getPopulationInfo = (req, res) => {
  res.json({
    success: true,
    info: {
      title: 'Population Density Analysis API',
      dataSource: 'NASA Socioeconomic Data and Applications Center (SEDAC) - Gridded Population of the World (GPW)',
      description: 'Population density estimates for demographic analysis using Google Earth Engine',
      temporalResolution: '5-year intervals',
      spatialResolution: '30 arc-seconds (~1 km)',
      units: 'People per square kilometer',
      availableYears: [2000, 2005, 2010, 2015, 2020, 2025],
      defaultYear: 2020,
      supportedCities: geeService.getSupportedCities(),
      endpoints: {
        customArea: {
          path: '/api/population',
          method: 'GET',
          parameters: {
            bounds: 'Required - west,south,east,north coordinates',
            year: 'Optional - Available years: 2000, 2005, 2010, 2015, 2020, 2025 (default: 2020)'
          },
          example: '/api/population?bounds=-74.1,40.6,-73.9,40.8&year=2020'
        },
        predefinedCity: {
          path: '/api/population/city/:cityName',
          method: 'GET',
          parameters: {
            cityName: 'Required - One of the supported cities',
            year: 'Optional - Available years: 2000, 2005, 2010, 2015, 2020, 2025'
          },
          example: '/api/population/city/New York?year=2020'
        },
        info: {
          path: '/api/population/info',
          method: 'GET',
          description: 'Get this information page'
        }
      },
      dataProcessing: {
        algorithm: 'UN-adjusted population estimates',
        resolution: '~1km grid cells',
        projection: 'Geographic (WGS84)',
        processing: 'NASA SEDAC population count to density conversion'
      },
      outputFormat: {
        imageUrl: 'PNG thumbnail URL from Google Earth Engine',
        bounds: 'Geographic bounding box of the analysis area',
        statistics: 'Population density statistics and demographic metrics',
        visualizationParams: 'Color palette and scaling for map display'
      },
      limitations: [
        'Data availability varies by region and year',
        'Processing time increases with area size',
        'Population estimates are modeled data, not census counts',
        'Google Earth Engine quota limits may apply'
      ]
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
      customArea: 'GET /api/population?bounds=west,south,east,north'
    },
    timestamp: new Date().toISOString()
  });
};