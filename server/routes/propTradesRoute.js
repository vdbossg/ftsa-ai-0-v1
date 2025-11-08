const express = require("express");
const router = express.Router();
const { propTableTrades } = require("../controllers/propTradesController");

// GET /api/proptabletrades
router.get("/", propTableTrades);

module.exports = router;
