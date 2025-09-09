const express = require("express");
const router = express.Router();
const tradesController = require("../controllers/tradesController");

// GET /api/trades
router.get("/", tradesController.getTrades);

module.exports = router;
