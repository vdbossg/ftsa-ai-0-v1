const express = require('express');
const { downloadEA } = require('../controllers/eaController');
const adminAuth = require('../middleware/adminAuthMiddleware');
const authMiddleware = require('../middleware/authMiddleware'); // <-- import authMiddleware

const router = express.Router();

// Route protected by general authentication
router.get('/download', authMiddleware, downloadEA);

module.exports = router;
