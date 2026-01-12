const express = require('express');
const router = express.Router();
const tvsController = require('../controllers/tvsConverter.controller');

// Manual trigger (optional)
router.get('/convertAndPost', tvsController.convertAndPost);

module.exports = router;
