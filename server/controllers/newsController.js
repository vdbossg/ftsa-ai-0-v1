const newsService = require("../services/newsService");

exports.getTodayNews = async (req, res) => {
  try {
    const data = await newsService.getLatestEconomicEvents(); // updated
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
};
