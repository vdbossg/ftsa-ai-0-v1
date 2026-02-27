const express = require('express');
const router = express.Router();
const getStartedController = require('../controllers/controllersGetstarted');

// POST /api/getstarted/new
router.post('/new', getStartedController.createReferral.bind(getStartedController));

// GET /api/getstarted/new
router.get('/new', getStartedController.getAllReferrals.bind(getStartedController));

module.exports = router;