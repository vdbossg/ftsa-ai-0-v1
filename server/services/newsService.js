// server/services/newsService.js
const axios = require("axios");

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = "https://newsapi.org/v2/top-headlines";

// Helper to determine impact from headline
const determineImpact = (title) => {
  const highKeywords = ["Fed", "ECB", "NFP", "Interest Rate", "Inflation", "Central Bank"];
  const lowKeywords = ["minor", "report", "update"];
  const holidayKeywords = ["holiday", "bank holiday"];

  const lowerTitle = title.toLowerCase();

  if (highKeywords.some(word => lowerTitle.includes(word.toLowerCase()))) return "High🟥";
  if (holidayKeywords.some(word => lowerTitle.includes(word.toLowerCase()))) return "Holiday⬛";
  if (lowKeywords.some(word => lowerTitle.includes(word.toLowerCase()))) return "Low🟨";

  return "Medium🟧"; // default
};

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

    const news = data.articles.map(article => {
      const [date, time] = article.publishedAt.split("T");
      return {
        date,
        time: time.replace("Z", ""),
        currency: "-", // optional: parse from title if needed
        event: article.title,
        impact: determineImpact(article.title),
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
