const express = require('express');
const router = express.Router();
const controller = require('../controllers/controllersWithdrawalRequest');

// All POST + GET routes per method
router.post('/:method/userid', controller.postWithdrawal);
router.get('/:method/userid', controller.getWithdrawal);

module.exports = router;
