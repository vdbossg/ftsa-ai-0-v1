// server/services/newsService.js
const axios = require("axios");

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = "https://newsapi.org/v2/top-headlines";

exports.getLatestNews = async () => {
  try {
    const { data } = await axios.get(NEWS_API_URL, {
      params: {
        category: "business",
        language: "en",
        pageSize: 20,
        apiKey: NEWS_API_KEY,
      },
    });

    if (!data.articles || data.articles.length === 0) return [];

    // Transform API data to match frontend table structure
    const news = data.articles.map(article => {
      const [date, time] = article.publishedAt.split("T");
      return {
        date,
        time: time.replace("Z", ""),
        currency: "-",            // Optional: could parse from title
        event: article.title,
        impact: "Medium🟧",       // Optional: could detect High/Low keywords
        actual: "-",
        previous: "-",
        forecast: "-",
      };
    });

    return news;
  } catch (error) {
    console.error("❌ Error fetching news from API:", error.message);
    return [];
  }
};
