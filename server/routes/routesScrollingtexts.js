// server/routes/routesScrollingtexts.js
const express = require('express');
const router = express.Router();
const { getLiveScrollingTextsController } = require('../controllers/controllersScrollingtexts');

// GET /api/scrollingtexts/live
router.get('/live', getLiveScrollingTextsController);

module.exports = router;
