const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");

// GET /api/news/today
router.get("/today", newsController.getTodayNews);

module.exports = router;
