const express = require("express");
const router = express.Router();
const Controller = require("../controllers/controllersWithdrawalRequest");

// EXACT ROUTES YOU REQUESTED

router.post("/WithdrawalRequest/M-bank/userid/", Controller.create);

router.post("/WithdrawalRequest/M-visacard/userid/", Controller.create);

router.post("/WithdrawalRequest/M-paypal/userid/", Controller.create);

router.post("/WithdrawalRequest/M-m-pesa/userid/", Controller.create);

module.exports = router;
