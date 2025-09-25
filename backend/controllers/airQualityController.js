// Air Quality Controller
// Handles HTTP requests for air quality data
const airQualityService = require('../services/airQualityService');

/**
 * Get air quality data for custom area with enhanced logging
 * GET /api/airquality?bounds=west,south,east,north&startDate=2024-01-01&endDate=2024-08-01
 */
exports.getAirQualityData = async (req, res) => {
  console.log('🌬️ Air quality request received:', req.query);
  console.log('🔍 API Access - Air Quality endpoint hit');
  console.log('📝 Request details:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  try {
    const { bounds, startDate, endDate } = req.query;

    // Validate bounds parameter
    if (!bounds) {
      console.log('❌ Air quality: Missing bounds parameter');
      return res.status(400).json({
        error: 'Missing bounds parameter',
        message: 'Please provide bounds in format: west,south,east,north',
        example: '/api/airquality?bounds=-74.1,40.6,-73.9,40.8'
      });
    }

    // Parse bounds
    const boundsArray = bounds.split(',').map(coord => parseFloat(coord.trim()));
    if (boundsArray.length !== 4 || boundsArray.some(isNaN)) {
      console.log('❌ Air quality: Invalid bounds format:', bounds);
      return res.status(400).json({
        error: 'Invalid bounds format',
        message: 'Bounds must be four numbers: west,south,east,north'
      });
    }

    const [west, south, east, north] = boundsArray;
    const boundsObj = { west, south, east, north };

    // Set default dates if not provided
    const defaultStartDate = startDate || '2024-01-01';
    const defaultEndDate = endDate || '2024-08-01';

    console.log('🌬️ Processing air quality request for bounds:', boundsObj);
    console.log('📅 Date range:', defaultStartDate, 'to', defaultEndDate);

    const result = await airQualityService.getAirQualityData(boundsObj, defaultStartDate, defaultEndDate);
    
    console.log('✅ Air quality data processing complete:', {
      success: result.success,
      imageUrl: result.imageUrl ? 'Generated' : 'Failed',
      overlayBounds: result.overlayBounds ? 'Present' : 'Missing',
      statisticsIncluded: !!result.statistics,
      timestamp: new Date().toISOString()
    });

    res.json(result);
  } catch (error) {
    console.error('❌ Air quality error:', error);
    res.status(500).json({
      error: 'Failed to fetch air quality data',
      message: error.message
    });
  }
};

/**
 * Get air quality data for predefined city with enhanced logging
 * GET /api/airquality/city/:cityName?startDate=2024-01-01&endDate=2024-08-01
 */
exports.getCityAirQualityData = async (req, res) => {
  console.log('🏙️ City air quality request received for:', req.params.cityName, req.query);
  console.log('🔍 API Access - City Air Quality endpoint hit');
  
  try {
    const { cityName } = req.params;
    const { startDate, endDate } = req.query;

    if (!cityName) {
      console.log('❌ City air quality: Missing city name');
      return res.status(400).json({
        error: 'Missing city name',
        message: 'Please provide a city name in the URL path'
      });
    }

    // Set default dates if not provided
    const defaultStartDate = startDate || '2024-01-01';
    const defaultEndDate = endDate || '2024-08-01';

    console.log('🏙️ Processing city air quality for:', cityName);
    console.log('📅 Date range:', defaultStartDate, 'to', defaultEndDate);

    const result = await airQualityService.getCityAirQualityData(cityName, defaultStartDate, defaultEndDate);
    
    console.log('✅ City air quality processing complete:', {
      city: cityName,
      success: result.success,
      imageUrl: result.imageUrl ? 'Generated' : 'Failed',
      overlayBounds: result.overlayBounds ? 'Present' : 'Missing',
      timestamp: new Date().toISOString()
    });

    res.json(result);
  } catch (error) {
    console.error('❌ City air quality error:', error);
    res.status(500).json({
      error: 'Failed to fetch city air quality data',
      message: error.message
    });
  }
};

/**
 * Get multi-year statistics for air quality analysis
 * GET /api/airquality/statistics?bounds=west,south,east,north&years=2020,2021,2022
 */
exports.getAirQualityStatistics = async (req, res) => {
  console.log('📊 Air quality statistics request received:', req.query);
  console.log('🔍 API Access - Air Quality Statistics endpoint hit');
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
      console.log('❌ Air quality statistics: Missing bounds parameter');
      return res.status(400).json({
        error: 'Missing bounds parameter',
        message: 'Please provide bounds in format: west,south,east,north',
        example: '/api/airquality/statistics?bounds=-74.1,40.6,-73.9,40.8&years=2020,2021,2022',
        timestamp: new Date().toISOString()
      });
    }

    // Parse bounds
    const boundsArray = bounds.split(',').map(coord => parseFloat(coord.trim()));
    if (boundsArray.length !== 4 || boundsArray.some(isNaN)) {
      console.log('❌ Air quality statistics: Invalid bounds format:', bounds);
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

    console.log(`📊 Processing air quality statistics for ${targetYears.length} years:`, targetYears);
    console.log('🗺️ Analysis bounds:', boundsObj);

    // Fetch data for each year
    const yearlyStats = [];
    for (const year of targetYears) {
      try {
        console.log(`🌬️ Fetching air quality data for year ${year}...`);
        const startDate = `${year}-01-01`;
        const endDate = `${year}-08-01`;
        
        const airQualityData = await airQualityService.getAirQualityData(boundsObj, startDate, endDate);
        
        if (airQualityData.success && airQualityData.statistics) {
          const yearStats = {
            year,
            urbanMeanNO2: airQualityData.statistics.urbanMeanNO2,
            ruralMeanNO2: airQualityData.statistics.ruralMeanNO2,
            airQualityDifference: airQualityData.statistics.airQualityDifference,
            no2ImageCount: airQualityData.statistics.no2ImageCount,
            concentrationRange: airQualityData.statistics.concentrationRange,
            qualityScore: airQualityData.metadata?.processingInfo?.qualityScore
          };
          yearlyStats.push(yearStats);
          console.log(`✅ Added air quality data for ${year}:`, yearStats);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to fetch air quality data for year ${year}:`, error.message);
      }
    }

    // Structure data for AI analysis
    const aiAnalysisData = {
      dataType: 'air_quality_analysis',
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
        urbanPollution: stat.urbanMeanNO2,
        ruralPollution: stat.ruralMeanNO2,
        pollutionDifference: stat.airQualityDifference,
        dataQuality: stat.qualityScore || 'unknown'
      })),
      trends: yearlyStats.length > 1 ? {
        pollutionTrend: yearlyStats[yearlyStats.length - 1].urbanMeanNO2 - yearlyStats[0].urbanMeanNO2,
        qualityTrend: yearlyStats[yearlyStats.length - 1].airQualityDifference - yearlyStats[0].airQualityDifference
      } : null
    };

    console.log(`✅ Air quality statistics processing complete. Found data for ${yearlyStats.length} years`);

    res.json({
      success: true,
      type: 'airquality_statistics',
      bounds: boundsObj,
      yearlyData: yearlyStats,
      summary: {
        totalYears: yearlyStats.length,
        avgNO2: yearlyStats.length > 0 ? 
          (yearlyStats.reduce((sum, item) => sum + (item.urbanMeanNO2 || 0), 0) / yearlyStats.length).toFixed(2) : null,
        maxPollutionDifference: yearlyStats.length > 0 ? 
          Math.max(...yearlyStats.map(item => item.airQualityDifference || 0)).toFixed(2) : null,
        avgImageCount: yearlyStats.length > 0 ? 
          Math.round(yearlyStats.reduce((sum, item) => sum + (item.no2ImageCount || 0), 0) / yearlyStats.length) : null
      },
      aiAnalysisData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Air quality statistics error:', error);
    res.status(500).json({
      error: 'Failed to fetch air quality statistics',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get available air quality info/metadata
 * GET /api/airquality/info
 */
exports.getAirQualityInfo = (req, res) => {
  console.log('ℹ️ API Access - Air Quality Info endpoint hit');
  res.json({
    success: true,
    info: {
      title: 'Air Quality Analysis API',
      dataSource: 'ESA Copernicus Sentinel-5P TROPOMI',
      description: 'Nitrogen Dioxide (NO2) air quality data for pollution monitoring',
      temporalResolution: 'Daily global coverage',
      spatialResolution: '1113.2 meters',
      units: 'µg/m³ (approximate NO2 concentration)',
      availableDateRange: {
        start: '2018-04-30', // Sentinel-5P launch
        end: 'Present (with ~1 week delay)'
      },
      supportedCities: airQualityService.getSupportedCities(),
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
        statistics: {
          path: '/api/airquality/statistics',
          method: 'GET',
          parameters: {
            bounds: 'Required - west,south,east,north coordinates',
            years: 'Optional - comma-separated years (default: 2020,2021,2022,2023,2024)'
          },
          example: '/api/airquality/statistics?bounds=-74.1,40.6,-73.9,40.8&years=2020,2021,2022'
        }
      }
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