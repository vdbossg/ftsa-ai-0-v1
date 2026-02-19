//FTSA_AI_0.v1\server\routes\tvAlertsRoutes.js
const express = require('express');
const router = express.Router();
const { handleTVAlert, getAllTVAlerts } = require('../controllers/tvAlertsController');

// POST /api/tv-alerts
router.post('/', handleTVAlert);

// GET /api/tv-alerts/signals
router.get('/signals', getAllTVAlerts);

module.exports = router;
