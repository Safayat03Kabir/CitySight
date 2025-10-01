const express = require('express');
const energyController = require('../controllers/energyController');

const router = express.Router();

// Get energy access data for custom area
router.get('/', energyController.getEnergyData);

// Get energy access data for predefined city
router.get('/city/:cityName', energyController.getCityEnergyData);

module.exports = router;