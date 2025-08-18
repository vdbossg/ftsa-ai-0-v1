// server/routes/mtAccountRoutes.js
const express = require('express');
const router = express.Router();
const mtAccountController = require('../controllers/mtAccountController');

// In-memory storage (replace with DB later)


router.get('/', mtAccountController.getAccounts);
router.post('/save', mtAccountController.saveAccount);
router.delete('/:accountID', mtAccountController.deleteAccount);
router.post('/connect', mtAccountController.login);
router.post('/login', mtAccountController.login);

module.exports = router;
