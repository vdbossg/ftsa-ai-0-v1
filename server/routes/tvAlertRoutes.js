const express = require('express');
const router = express.Router();
const tvAlertController = require('../controllers/tvAlertController');

// POST new TradingView alert
router.post('/', tvAlertController.receiveAlert);

// GET all TradingView alerts
router.get('/', tvAlertController.fetchAlerts);

module.exports = router;
