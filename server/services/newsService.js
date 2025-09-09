// server/services/newsService.js
const axios = require("axios");
const cheerio = require("cheerio");

// Exported function called by the controller
exports.getLatestNews = async () => {
  try {
    // Forex Factory calendar URL for the current week
    const url = "https://www.forexfactory.com/calendar?week=this";
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const news = [];

    // Loop through each row in the calendar
    $("#calendar tr.calendar_row").each((i, el) => {
      const date = $(el).find(".calendar__date").text().trim();
      const time = $(el).find(".calendar__time").text().trim();
      const currency = $(el).find(".calendar__currency").text().trim();
      const event = $(el).find(".calendar__event").text().trim();
      const impactText = $(el).find(".impact").attr("title") || "";

      let impact = "Low🟨";
      if (impactText.includes("High")) impact = "High🟥";
      else if (impactText.includes("Medium")) impact = "Medium🟧";
      else if (impactText.includes("Holiday")) impact = "Holiday⬛";

      const actual = $(el).find(".actual").text().trim() || "-";
      const forecast = $(el).find(".forecast").text().trim() || "-";
      const previous = $(el).find(".previous").text().trim() || "-";

      if (event) {
        news.push({
          date: date || "-",
          time: time || "-",
          currency: currency || "-",
          event,
          impact,
          actual,
          forecast,
          previous,
        });
      }
    });

    // Return only today's and upcoming events
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const filtered = news.filter(n => n.date >= today);

    return filtered.length > 0 ? filtered : news;
  } catch (error) {
    console.error("❌ Error fetching news:", error.message);

    // fallback to placeholder data
    return [
      {
        date: "2025-09-09",
        time: "08:30",
        currency: "USD",
        event: "Non-Farm Payrolls (NFP)",
        impact: "High🟥",
        actual: 200000,
        forecast: 180000,
        previous: 190000,
      },
      {
        date: "2025-09-09",
        time: "10:00",
        currency: "EUR",
        event: "ECB Interest Rate Decision",
        impact: "Medium🟧",
        actual: 0.50,
        forecast: 0.50,
        previous: 0.25,
      },
      {
        date: "2025-09-10",
        time: "12:00",
        currency: "GBP",
        event: "GDP QoQ",
        impact: "Low🟨",
        actual: 0.3,
        forecast: 0.4,
        previous: 0.2,
      },
      {
        date: "2025-09-11",
        time: "-",
        currency: "-",
        event: "Bank Holiday",
        impact: "Holiday⬛",
        actual: "-",
        forecast: "-",
        previous: "-",
      },
    ];
  }
};
