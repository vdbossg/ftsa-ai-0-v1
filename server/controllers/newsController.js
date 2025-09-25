// server/controllers/newsController.js
const newsService = require("../services/newsService");

exports.getTodayNews = async (req, res) => {
  try {
    const data = await newsService.getLatestEconomicEvents();
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({ success: false, error: "Failed to fetch news" });
  }
};
