// FTSA_AI_0.v1/server/routes/routesLiveAds.js
const express = require('express');
const router = express.Router();
const { fetchLiveAds } = require('../controllers/controllersLiveAds');

// GET /api/live-ads
router.get('/', fetchLiveAds);

module.exports = router;
