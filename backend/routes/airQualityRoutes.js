// Air Quality API Routes
const express = require('express');
const router = express.Router();
const airQualityController = require('../controllers/airQualityController');

// GET /api/airquality - Fetch air quality data for custom bounding box
router.get('/', airQualityController.getAirQualityData);

// GET /api/airquality/city/:cityName - Fetch air quality data for predefined city
router.get('/city/:cityName', airQualityController.getCityAirQualityData);

// GET /api/airquality/info - Get metadata about air quality data API
router.get('/info', airQualityController.getAirQualityInfo);

// GET /api/airquality/cities - Get list of supported cities
router.get('/cities', airQualityController.getSupportedCities);

module.exports = router;