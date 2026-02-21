// FTSA_AI_0.v1\server\routes\rms.js
const express = require("express");
const router = express.Router();
const RmsController = require("../controllers/RmsController");

// Save or update RMS settings for logged-in user
router.post("/", RmsController.saveRmsSettings);

// Get latest RMS settings for logged-in user
router.get("/", RmsController.getLatestRmsSettings);

module.exports = router;