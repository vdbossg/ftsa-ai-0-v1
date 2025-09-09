// server/services/newsService.js

// This is the function the controller calls
exports.getLatestNews = async () => {
  // TODO: Replace with live API calls (Forex Factory, Investing.com, etc.)
  // Ready-to-use structured placeholder data
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
};
