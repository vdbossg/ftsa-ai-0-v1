// server/services/newsService.js
const axios = require("axios");

const API_KEY = process.env.TRADING_ECONOMICS_API_KEY;
const BASE_URL = "https://api.tradingeconomics.com/calendar";

// Helper function to determine the impact level
const determineImpact = (importance) => {
  switch (importance) {
    case 3:
      return "High🟥";
    case 2:
      return "Medium🟧";
    case 1:
      return "Low🟨";
    default:
      return "Medium🟧"; // Default to Medium if not specified
  }
};

// Helper function to determine the currency
const determineCurrency = (countryCode) => {
  const currencyMap = {
    USA: "USD",
    EUR: "EUR",
    GBR: "GBP",
    // Add more country codes and their corresponding currencies as needed
  };
  return currencyMap[countryCode] || "-";
};

// Fetch the latest economic calendar events
exports.getLatestEconomicEvents = async () => {
  try {
    const { data } = await axios.get(BASE_URL, {
      params: {
        c: API_KEY,
        f: "json",
        // Add any additional parameters as needed
      },
    });

    if (!data || !Array.isArray(data)) {
      throw new Error("Invalid data format received from API");
    }

    // Map the API response to the desired format
    const events = data.map((event) => ({
      date: event.date,
      time: event.time,
      currency: determineCurrency(event.countryCode),
      event: event.title,
      impact: determineImpact(event.importance),
      actual: event.actualValue || "-",
      previous: event.previousValue || "-",
      forecast: event.forecastValue || "-",
    }));

    return events;
  } catch (error) {
    console.error("Error fetching economic events:", error.message);
    return [];
  }
};
