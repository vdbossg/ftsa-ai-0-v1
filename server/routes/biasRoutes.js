// server/routes/biasRoutes.js
const express = require('express');
const router = express.Router();
const biasController = require('../controllers/biasController');

// GET /api/bias
router.get('/', biasController.getBias);

// POST /api/bias
router.post('/', biasController.setBias);

module.exports = router;
