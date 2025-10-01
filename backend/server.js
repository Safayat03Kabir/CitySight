// Main server entry point for CitySight Heat Island API
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import route modules
const heatRoutes = require('./routes/heatRoutes');
const airQualityRoutes = require('./routes/airQualityRoutes');
const populationRoutes = require('./routes/populationRoutes');
const energyRoutes = require('./routes/energyRoutes');

// Import GEE services for initialization
const geeService = require('./services/geeService');
const airQualityService = require('./services/airQualityService');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later',
    retryAfter: '15 minutes'
  }
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add request timestamp
app.use((req, res, next) => {
  req.timestamp = new Date().toISOString();
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'CitySight Heat Island API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/heat', heatRoutes);
app.use('/api/airquality', airQualityRoutes);
app.use('/api/population', populationRoutes);
app.use('/api/energy', energyRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'CitySight Heat Island API',
    version: '1.0.0',
    description: 'API for urban heat island analysis using Google Earth Engine',
    endpoints: {
      health: '/health',
      heat: '/api/heat',
      heatInfo: '/api/heat/info',
      airQuality: '/api/airquality',
      airQualityInfo: '/api/airquality/info',
      population: '/api/population',
      populationInfo: '/api/population/info',
      energy: '/api/energy',
      energyInfo: '/api/energy/info'
    },
    documentation: {
      heatEndpoint: 'GET /api/heat?bounds=west,south,east,north&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
      airQualityEndpoint: 'GET /api/airquality?bounds=west,south,east,north&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
      populationEndpoint: 'GET /api/population?bounds=west,south,east,north&year=YYYY',
      energyEndpoint: 'GET /api/energy?bounds=west,south,east,north&year=YYYY',
      exampleRequest: '/api/heat?bounds=-74.1,40.6,-73.9,40.8&startDate=2024-01-01&endDate=2024-08-01',
      exampleEnergyRequest: '/api/energy?bounds=-74.1,40.6,-73.9,40.8&year=2024'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      '/health',
      '/api',
      '/api/heat',
      '/api/heat/info',
      '/api/airquality',
      '/api/airquality/info',
      '/api/population',
      '/api/population/info'
    ],
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong';
  
  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : 'Request error',
    message: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Initialize Google Earth Engine services
    console.log('🛰️ Initializing Google Earth Engine...');
    await geeService.initialize();
    await airQualityService.initialize();
    
    // Start the HTTP server
    app.listen(PORT, () => {
      console.log(`🔥 CitySight Heat Island API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌡️ Heat API: http://localhost:${PORT}/api/heat`);
      console.log(`🌬️ Air Quality API: http://localhost:${PORT}/api/airquality`);
      console.log(`👥 Population API: http://localhost:${PORT}/api/population`);
      console.log(`⚡ Energy API: http://localhost:${PORT}/api/energy`);
      console.log(`📋 API Documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('💡 Make sure Google Earth Engine is properly configured');
    process.exit(1);
  }
};

startServer();

module.exports = app;