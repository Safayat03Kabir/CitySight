// Heat Island API Routes
const express = require('express');
const router = express.Router();
const heatController = require('../controllers/heatController');

// GET /api/heat - Fetch heat island data for custom bounding box
router.get('/', heatController.getHeatData);

// GET /api/heat/city/:cityName - Fetch heat island data for predefined city
router.get('/city/:cityName', heatController.getCityHeatData);

// GET /api/heat/info - Get metadata about heat data API
router.get('/info', heatController.getHeatInfo);

// GET /api/heat/statistics - Get multi-year heat statistics
router.get('/statistics', heatController.getHeatStatistics);

// GET /api/heat/cities - Get list of supported cities
router.get('/cities', heatController.getSupportedCities);

module.exports = router;