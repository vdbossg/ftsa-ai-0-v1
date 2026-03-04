const express = require("express");
const router = express.Router();
const { getMTTableTrades, getPropTableTrades } = require("../controllers/bypassMTTableTradesController");

// Define GET routes
router.get("/mttabletrades", getMTTableTrades);
router.get("/proptabletrades", getPropTableTrades);

module.exports = router;