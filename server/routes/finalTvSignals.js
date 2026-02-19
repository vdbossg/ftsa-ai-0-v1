// routes/finalTvSignals.js
const express = require("express");      // <- must be express
const router = express.Router();
const finalController = require("../controllers/finalTvSignalsController");

// Use the exact exported function name
router.get("/finalTvsignals", finalController.getFinalSignalsController);

module.exports = router;
