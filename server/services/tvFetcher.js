// FTSA_AI_0.v1\server\services/tvFetcher.js
const TVAlert = require("../models/tvAlertModel");

// This function fetches the latest filtered signals directly from MongoDB
const getFinalSignals = async () => {
  try {
    const filteredSignals = await TVAlert.find({
      status: "NEW",
      choch: true
    }).sort({ updatedAt: -1 });

    return filteredSignals;
  } catch (error) {
    console.error("Error fetching final TV signals:", error.message);
    return [];
  }
};

module.exports = { getFinalSignals };
