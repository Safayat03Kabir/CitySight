const express = require('express');
const airQualityController = require('../controllers/airQualityController');

const router = express.Router();

// Get air quality data for custom area
router.get('/', airQualityController.getAirQualityData);

// Get air quality data for predefined city
router.get('/city/:cityName', airQualityController.getCityAirQualityData);

// Get air quality multi-year statistics
router.get('/statistics', airQualityController.getAirQualityStatistics);

// Get air quality metadata/info
router.get('/info', airQualityController.getAirQualityInfo);

module.exports = router;