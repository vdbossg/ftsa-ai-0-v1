const express = require('express');
const { downloadEA } = require('../controllers/eaController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/download', authMiddleware, downloadEA);

module.exports = router;
