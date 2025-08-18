const express = require('express');
const { downloadEA } = require('../controllers/eaController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/download', authMiddleware, downloadEA);

module.exports = router; // ✅ Important!
