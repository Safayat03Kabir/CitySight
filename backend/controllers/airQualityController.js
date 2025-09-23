// Air Quality Controller
// Handles HTTP requests for air quality data
const airQualityService = require('../services/airQualityService');

/**
 * Get air quality data for a specified bounding box
 * GET /api/airquality?bounds=west,south,east,north&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
exports.getAirQualityData = async (req, res) => {
  console.log('🌬️ Air quality data request received:', req.query);
  
  try {
    // Parse query parameters
    const { bounds, startDate, endDate } = req.query;

    // Validate bounds parameter
    if (!bounds) {
      return res.status(400).json({
        error: 'Missing required parameter',
        message: 'Bounds parameter is required',
        example: '/api/airquality?bounds=-74.1,40.6,-73.9,40.8',
        timestamp: new Date().toISOString()
      });
    }

    // Parse bounds string into coordinates
    const boundsArray = bounds.split(',').map(coord => parseFloat(coord.trim()));
    
    if (boundsArray.length !== 4 || boundsArray.some(isNaN)) {
      return res.status(400).json({
        error: 'Invalid bounds format',
        message: 'Bounds must be four comma-separated numbers: west,south,east,north',
        example: 'bounds=-74.1,40.6,-73.9,40.8',
        received: bounds,
        timestamp: new Date().toISOString()
      });
    }

    const [west, south, east, north] = boundsArray;

    // Validate coordinate ranges
    if (west < -180 || west > 180 || east < -180 || east > 180 || 
        south < -90 || south > 90 || north < -90 || north > 90) {
      return res.status(400).json({
        error: 'Invalid coordinate values',
        message: 'Coordinates must be within valid ranges: longitude [-180,180], latitude [-90,90]',
        received: { west, south, east, north },
        timestamp: new Date().toISOString()
      });
    }

    if (west >= east || south >= north) {
      return res.status(400).json({
        error: 'Invalid bounding box',
        message: 'West must be less than East, and South must be less than North',
        received: { west, south, east, north },
        timestamp: new Date().toISOString()
      });
    }

    const boundsObj = { west, south, east, north };

    // Validate date parameters (optional)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate && !dateRegex.test(startDate)) {
      return res.status(400).json({
        error: 'Invalid start date format',
        message: 'Start date must be in YYYY-MM-DD format',
        received: startDate,
        example: '2024-01-01',
        timestamp: new Date().toISOString()
      });
    }

    if (endDate && !dateRegex.test(endDate)) {
      return res.status(400).json({
        error: 'Invalid end date format',
        message: 'End date must be in YYYY-MM-DD format',
        received: endDate,
        example: '2024-08-01',
        timestamp: new Date().toISOString()
      });
    }

    // Set default dates if not provided
    const defaultStartDate = startDate || '2024-01-01';
    const defaultEndDate = endDate || '2024-08-01';

    console.log(`📊 Fetching air quality data for bounds: ${JSON.stringify(boundsObj)}`);
    console.log(`📅 Date range: ${defaultStartDate} to ${defaultEndDate}`);

    // Add request timeout handling
    const requestTimeout = setTimeout(() => {
      throw new Error('Request timeout - processing took too long');
    }, 30000); // 30 seconds for air quality processing

    // Fetch air quality data from Google Earth Engine
    const airQualityData = await airQualityService.getAirQualityData(
      boundsObj, 
      defaultStartDate, 
      defaultEndDate
    );

    clearTimeout(requestTimeout);

    // Enhance response with additional metadata for frontend
    const enhancedResponse = {
      success: true,
      data: {
        // Core data from service
        imageUrl: airQualityData.imageUrl,
        ...airQualityData,
        // Frontend-specific enhancements
        layerType: 'airQuality',
        opacity: 0.7,
        attribution: 'ESA Sentinel-5P TROPOMI, MODIS Land Cover',
        // Map overlay bounds
        overlayBounds: {
          northeast: { lat: north, lng: east },
          southwest: { lat: south, lng: west }
        },
        // Display configuration
        displayInfo: {
          minConcentration: airQualityData.visualizationParams.min,
          maxConcentration: airQualityData.visualizationParams.max,
          colorScale: airQualityData.visualizationParams.palette,
          legend: {
            title: 'NO₂ Concentration (mol/m²)',
            colors: airQualityData.visualizationParams.palette,
            labels: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
          }
        }
      },
      metadata: {
        requestId: `airquality_${Date.now()}`,
        processingTime: new Date().toISOString(),
        dataQuality: airQualityData.statistics.no2ImageCount > 5 ? 'excellent' : 
                    airQualityData.statistics.no2ImageCount > 2 ? 'good' : 'fair',
        availableImages: {
          no2: airQualityData.statistics.no2ImageCount,
          co: airQualityData.statistics.coImageCount,
          so2: airQualityData.statistics.so2ImageCount
        },
        cacheExpires: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // 6 hours cache
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ Air quality data successfully processed and returned');
    res.json(enhancedResponse);

  } catch (error) {
    console.error('❌ Air quality data error:', error);
    
    // Determine error type and provide appropriate response
    let statusCode = 500;
    let errorMessage = error.message;
    
    if (error.message.includes('No data available') || error.message.includes('No satellite data')) {
      statusCode = 404;
      errorMessage = 'No air quality data available for the specified area and time period';
    } else if (error.message.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Request timeout - please try a smaller area or different time period';
    } else if (error.message.includes('Area too large')) {
      statusCode = 413;
      errorMessage = 'Area too large for processing - please try a smaller region';
    } else if (error.message.includes('quota')) {
      statusCode = 429;
      errorMessage = 'Service quota exceeded - please try again later';
    }
    
    res.status(statusCode).json({
      error: 'Failed to fetch air quality data',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      suggestions: [
        'Try a smaller area or different date range',
        'Ensure the area has sufficient satellite coverage',
        'Check if the coordinates are in a valid geographic region',
        'Use recent dates (2019-2024) for best data availability'
      ],
      examples: {
        validRequest: '/api/airquality?bounds=-74.1,40.6,-73.9,40.8&startDate=2024-01-01&endDate=2024-08-01',
        cityRequest: '/api/airquality/city/New York'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get air quality data for a predefined city
 * GET /api/airquality/city/:cityName?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
exports.getCityAirQualityData = async (req, res) => {
  console.log('🏙️ City air quality data request received:', req.params, req.query);
  
  try {
    const { cityName } = req.params;
    const { startDate, endDate } = req.query;

    // Validate city parameter
    if (!cityName) {
      return res.status(400).json({
        error: 'Missing city parameter',
        message: 'City name is required in the URL path',
        example: '/api/airquality/city/New York',
        timestamp: new Date().toISOString()
      });
    }

    // Check if city is supported
    const supportedCities = airQualityService.getSupportedCities();
    if (!supportedCities.includes(cityName)) {
      return res.status(404).json({
        error: 'City not supported',
        message: `City "${cityName}" is not in the supported cities list`,
        supportedCities: supportedCities,
        example: '/api/airquality/city/New York',
        timestamp: new Date().toISOString()
      });
    }

    // Validate date parameters if provided
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDate && !dateRegex.test(startDate)) {
      return res.status(400).json({
        error: 'Invalid start date format',
        message: 'Start date must be in YYYY-MM-DD format',
        received: startDate,
        timestamp: new Date().toISOString()
      });
    }

    if (endDate && !dateRegex.test(endDate)) {
      return res.status(400).json({
        error: 'Invalid end date format',
        message: 'End date must be in YYYY-MM-DD format',
        received: endDate,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🌬️ Fetching air quality data for ${cityName}`);

    // Fetch city air quality data
    const airQualityData = await airQualityService.getCityAirQualityData(
      cityName,
      startDate || '2024-01-01',
      endDate || '2024-08-01'
    );

    // Get city bounds for response
    const cityBounds = airQualityService.getCityBounds(cityName);
    
    // Enhanced response similar to custom bounds
    const enhancedResponse = {
      success: true,
      data: {
        ...airQualityData,
        city: cityName,
        layerType: 'airQuality',
        opacity: 0.7,
        attribution: 'ESA Sentinel-5P TROPOMI, MODIS Land Cover',
        overlayBounds: {
          northeast: { lat: cityBounds.north, lng: cityBounds.east },
          southwest: { lat: cityBounds.south, lng: cityBounds.west }
        },
        displayInfo: {
          minConcentration: airQualityData.visualizationParams.min,
          maxConcentration: airQualityData.visualizationParams.max,
          colorScale: airQualityData.visualizationParams.palette,
          legend: {
            title: 'NO₂ Concentration (mol/m²)',
            colors: airQualityData.visualizationParams.palette,
            labels: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
          }
        }
      },
      metadata: {
        requestId: `airquality_city_${Date.now()}`,
        city: cityName,
        processingTime: new Date().toISOString(),
        dataQuality: airQualityData.statistics.no2ImageCount > 5 ? 'excellent' : 
                    airQualityData.statistics.no2ImageCount > 2 ? 'good' : 'fair'
      },
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Air quality data for ${cityName} successfully processed and returned`);
    res.json(enhancedResponse);

  } catch (error) {
    console.error('❌ City air quality data error:', error);
    
    res.status(500).json({
      error: 'Failed to fetch city air quality data',
      message: error.message,
      city: req.params.cityName,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get available air quality data info/metadata
 * GET /api/airquality/info
 */
exports.getAirQualityInfo = (req, res) => {
  res.json({
    success: true,
    info: {
      title: 'Air Quality Analysis API',
      dataSource: 'ESA Sentinel-5P TROPOMI + MODIS Land Cover',
      description: 'Atmospheric composition data for air quality analysis using Google Earth Engine',
      temporalResolution: 'Daily composite with temporal filtering',
      spatialResolution: '1113.2 meters (Sentinel-5P)',
      units: 'mol/m² (column density)',
      availableDateRange: {
        start: '2018-04-30', // Sentinel-5P mission start
        end: 'Present (with ~3-7 day delay)'
      },
      supportedCities: airQualityService.getSupportedCities(),
      pollutants: {
        NO2: 'Nitrogen Dioxide - Primary traffic/industrial pollution indicator',
        CO: 'Carbon Monoxide - Combustion processes indicator',
        SO2: 'Sulfur Dioxide - Industrial emissions indicator'
      },
      endpoints: {
        customArea: {
          path: '/api/airquality',
          method: 'GET',
          parameters: {
            bounds: 'Required - west,south,east,north coordinates',
            startDate: 'Optional - YYYY-MM-DD format (default: 2024-01-01)',
            endDate: 'Optional - YYYY-MM-DD format (default: 2024-08-01)'
          },
          example: '/api/airquality?bounds=-74.1,40.6,-73.9,40.8&startDate=2024-01-01&endDate=2024-08-01'
        },
        predefinedCity: {
          path: '/api/airquality/city/:cityName',
          method: 'GET',
          parameters: {
            cityName: 'Required - One of the supported cities',
            startDate: 'Optional - YYYY-MM-DD format',
            endDate: 'Optional - YYYY-MM-DD format'
          },
          example: '/api/airquality/city/New York?startDate=2024-01-01&endDate=2024-08-01'
        },
        info: {
          path: '/api/airquality/info',
          method: 'GET',
          description: 'Get this information page'
        }
      },
      dataProcessing: {
        qualityFiltering: 'Extreme values filtered out',
        temporalComposite: 'Median of available observations',
        spatialAggregation: 'Urban vs rural concentration analysis',
        atmosphericCorrection: 'Built into Sentinel-5P Level 3 products'
      },
      outputFormat: {
        imageUrl: 'PNG thumbnail URL from Google Earth Engine',
        bounds: 'Geographic bounding box of the analysis area',
        statistics: 'Pollution statistics and urban-rural comparison',
        visualizationParams: 'Color palette and scaling for map display'
      },
      limitations: [
        'Cloud cover may limit data availability in some regions',
        'Processing time increases with area size',
        'Sentinel-5P data available from April 2018 onwards',
        'Google Earth Engine quota limits may apply',
        'Coarse spatial resolution compared to ground-based measurements'
      ]
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Get supported cities list
 * GET /api/airquality/cities
 */
exports.getSupportedCities = (req, res) => {
  const supportedCities = airQualityService.getSupportedCities();
  
  res.json({
    success: true,
    count: supportedCities.length,
    cities: supportedCities.map(city => ({
      name: city,
      bounds: airQualityService.getCityBounds(city),
      endpoint: `/api/airquality/city/${encodeURIComponent(city)}`
    })),
    usage: {
      selectCity: 'GET /api/airquality/city/{cityName}',
      customArea: 'GET /api/airquality?bounds=west,south,east,north'
    },
    timestamp: new Date().toISOString()
  });
};