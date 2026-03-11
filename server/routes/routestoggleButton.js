const express = require("express");
const router = express.Router();
const toggleController = require("../controllers/controllerstoggleButton");

// Optional: add auth middleware here if you have JWT/session
router.post("/risk-state/toggle", toggleController.toggleRiskState);

module.exports = router;