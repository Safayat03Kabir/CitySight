// Population API Routes
const express = require('express');
const router = express.Router();
const populationController = require('../controllers/populationController');

// GET /api/population - Fetch population data for custom bounding box
router.get('/', populationController.getPopulationData);

// GET /api/population/city/:cityName - Fetch population data for predefined city
router.get('/city/:cityName', populationController.getCityPopulationData);

// GET /api/population/info - Get metadata about population data API
router.get('/info', populationController.getPopulationInfo);

// GET /api/population/cities - Get list of supported cities
router.get('/cities', populationController.getSupportedCities);

module.exports = router;