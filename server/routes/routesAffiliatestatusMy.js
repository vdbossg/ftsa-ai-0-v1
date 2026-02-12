// FTSA_AI_0.v1/server/routes/routesAffiliatestatusMy.js
const express = require('express');
const router = express.Router();
const { getAffiliateStatus } = require('../controllers/controllersAffiliatestatusMy');

// GET /api/affiliatestatus/userid
router.get('/userid', getAffiliateStatus);

module.exports = router;
