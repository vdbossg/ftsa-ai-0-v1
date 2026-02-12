// server/routes/routesNewreferrals.js
const express = require('express');
const router = express.Router();
const referralController = require('../controllers/controllersNewreferrals');

// POST /api/byrer/newuser → add new referral
router.post('/newuser', referralController.postNewReferral);

// GET /api/byrer/newuser → list all referrals
router.get('/newuser', referralController.getReferrals);

module.exports = router;
