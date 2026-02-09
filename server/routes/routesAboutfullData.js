const express = require("express");
const router = express.Router();
const { fetchAboutFullData } = require("../controllers/controllersAboutfullData");

// GET /api/aboutfullData
router.get("/", fetchAboutFullData);

module.exports = router;
