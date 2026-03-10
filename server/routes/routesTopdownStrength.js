const express = require('express');
const router = express.Router();
const { getAllTopdown, getTopdownBySymbol } = require('../controllers/controllersTopdownStrength');

router.get('/all', getAllTopdown);
router.get('/:symbol', getTopdownBySymbol);

module.exports = router;