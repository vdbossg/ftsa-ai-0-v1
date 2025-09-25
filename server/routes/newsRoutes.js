const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");


// GET /api/news/today
// Fetches live ForexFactory economic calendar via server-side proxy
router.get("/today", newsController.getTodayNews);

module.exports = router;
