// FTSA_AI_0.v1\server\routes\mttabletrades.routes.js
const express = require("express");
const router = express.Router();
const MTController = require("../controllers/mttabletrades.controller");

/**
 * GET /api/mttabletrades
 * Returns MT5 trades for the currently logged-in (watched) user
 */
router.get("/", MTController.fetchMTTableTrades);

module.exports = router;