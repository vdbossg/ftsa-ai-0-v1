const express = require("express");
const router = express.Router();
const RmsController = require("../controllers/RmsController");

// Save RMS settings
router.post("/", RmsController.saveRmsSettings);

// Get latest RMS settings
router.get("/", RmsController.getLatestRmsSettings);

module.exports = router;
