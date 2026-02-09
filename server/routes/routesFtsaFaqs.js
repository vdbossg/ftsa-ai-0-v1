const express = require('express');
const { getFaqsController } = require('../controllers/controllersFtsaFaqs');

const router = express.Router();

// GET /api/FtsafaqsData
router.get('/', getFaqsController);

module.exports = router;
