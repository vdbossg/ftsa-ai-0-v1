const express = require("express");
const router = express.Router();
const { propTableTrades } = require("../controllers/propTradesController");

/**
 * @route   GET /api/proptabletrades
 * @desc    Get live trades and prop settings for the currently logged-in user
 * @access  Public (or protect with auth middleware if needed)
 */
router.get("/", propTableTrades);

module.exports = router;