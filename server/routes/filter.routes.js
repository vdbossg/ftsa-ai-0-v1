const express = require("express");
const router = express.Router();
const filterController = require("../controllers/filter.controller");

// GET all valid signals (ignores Top 3 for now)
router.get("/filteredSignals", filterController.getFilteredSignals);

module.exports = router;
