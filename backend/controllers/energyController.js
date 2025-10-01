// Energy Access Proxy Controller
// Handles HTTP requests for energy access data
const geeService = require('../services/geeService');

/**
 * Get energy access data for custom area
 * GET /api/energy?bounds=west,south,east,north&year=2023
 */
exports.getEnergyData = async (req, res) => {
  console.log('🔋 Energy access request received:', req.query);
  console.log('🔍 API Access - Energy endpoint hit');
  console.log('📝 Request details:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  try {
    const { bounds, year } = req.query;

    // Validate bounds parameter
    if (!bounds) {
      console.log('❌ Energy: Missing bounds parameter');
      return res.status(400).json({
        error: 'Missing bounds parameter',
        message: 'Please provide bounds in format: west,south,east,north',
        example: '/api/energy?bounds=-74.1,40.6,-73.9,40.8'
      });
    }

    // Parse bounds
    const boundsArray = bounds.split(',').map(coord => parseFloat(coord.trim()));
    if (boundsArray.length !== 4 || boundsArray.some(isNaN)) {
      console.log('❌ Energy: Invalid bounds format:', bounds);
      return res.status(400).json({
        error: 'Invalid bounds format',
        message: 'Bounds must be four numbers: west,south,east,north'
      });
    }

    const [west, south, east, north] = boundsArray;
    const boundsObj = { west, south, east, north };

    // Validate year parameter (optional, defaults to 2023)
    const analysisYear = year ? parseInt(year) : 2023;
    if (isNaN(analysisYear) || analysisYear < 2012 || analysisYear > 2024) {
      console.log('❌ Energy: Invalid year:', year);
      return res.status(400).json({
        error: 'Invalid year',
        message: 'Year must be between 2012 and 2024'
      });
    }

    console.log('🔋 Processing energy access request for bounds:', boundsObj, 'Year:', analysisYear);

    // Basic bounds validation
    if (west >= east || south >= north) {
      return res.status(400).json({
        error: 'Invalid bounds',
        message: 'West must be < East and South must be < North'
      });
    }

    // Area check (prevent overly large requests)
    const area = (east - west) * (north - south);
    if (area > 25) { // Roughly 25 degrees squared
      return res.status(400).json({
        error: 'Area too large',
        message: 'Please request a smaller area (max ~25 degrees squared)'
      });
    }

    console.log('⏱️ Calling GEE service for energy access analysis...');
    const startTime = Date.now();
    
    // Call GEE service
    const data = await geeService.getEnergyAccessProxy(boundsObj, analysisYear);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Energy access analysis completed in ${processingTime}ms`);
    
    // Ensure required fields exist
    if (!data.imageUrl) {
      throw new Error('No image URL generated');
    }

    // Add processing info
    data.processingTime = processingTime;
    data.requestInfo = {
      bounds: boundsObj,
      year: analysisYear,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending energy access response:', {
      success: data.success,
      layerType: data.layerType,
      hasImageUrl: !!data.imageUrl,
      statisticsKeys: Object.keys(data.statistics || {}),
      processingTime
    });

    res.json(data);

  } catch (error) {
    console.error('❌ Energy access data error:', error);
    
    // Enhanced error handling
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error.message.includes('Area too large')) {
      statusCode = 413;
      errorMessage = error.message;
    } else if (error.message.includes('timed out')) {
      statusCode = 408;
      errorMessage = 'Request timed out. Please try a smaller area.';
    } else if (error.message.includes('No data available')) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.message.includes('Authentication')) {
      statusCode = 503;
      errorMessage = 'Service temporarily unavailable';
    } else {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      error: 'Energy access processing failed',
      message: errorMessage,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
};

/**
 * Get energy access data for predefined city
 * GET /api/energy/city/:cityName?year=2023
 */
exports.getCityEnergyData = async (req, res) => {
  console.log('🏙️ City energy access request:', req.params.cityName);
  
  try {
    const { cityName } = req.params;
    const { year } = req.query;

    if (!cityName) {
      return res.status(400).json({
        error: 'Missing city name',
        message: 'Please provide a city name'
      });
    }

    // Validate year parameter (optional, defaults to 2023)
    const analysisYear = year ? parseInt(year) : 2023;
    if (isNaN(analysisYear) || analysisYear < 2012 || analysisYear > 2024) {
      return res.status(400).json({
        error: 'Invalid year',
        message: 'Year must be between 2012 and 2024'
      });
    }

    console.log(`🔋 Processing city energy access: ${cityName}, Year: ${analysisYear}`);

    const startTime = Date.now();
    const data = await geeService.getCityEnergyData(cityName, analysisYear);
    const processingTime = Date.now() - startTime;

    console.log(`✅ City energy access analysis completed in ${processingTime}ms`);

    // Add processing info
    data.processingTime = processingTime;
    data.requestInfo = {
      cityName: cityName,
      year: analysisYear,
      timestamp: new Date().toISOString()
    };

    res.json(data);

  } catch (error) {
    console.error('❌ City energy access error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    
    if (error.message.includes('not found')) {
      statusCode = 404;
      errorMessage = `City "${req.params.cityName}" not found or not supported`;
    } else if (error.message.includes('timed out')) {
      statusCode = 408;
      errorMessage = 'Request timed out';
    } else {
      errorMessage = error.message;
    }

    res.status(statusCode).json({
      error: 'City energy access processing failed',
      message: errorMessage,
      timestamp: new Date().toISOString(),
      supportedCities: geeService.getSupportedCities()
    });
  }
};