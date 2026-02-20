// routes/routesFullPairsStrength.js
const express = require('express');
const router = express.Router();
const { getFullPairsStrength } = require('../controllers/controllersFullPairsStrength');

router.get('/FullPairsStrength', getFullPairsStrength);

module.exports = router;