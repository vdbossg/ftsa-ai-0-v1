// server/services/mtAIJournalService.js
const MTJournal = require("../models/mtAIJournalModel");
const { fetchExternalMTTrades } = require("./fetchmtAIJournalService");

// Fetch MT trades from DB (with optional filters)
const getMTJournal = async (filters = {}) => {
  const { dateFrom, dateTo, winLoss, symbolSearch } = filters;
  let query = {};

  if (dateFrom) query.date = { $gte: new Date(dateFrom) };
  if (dateTo) query.date = { ...query.date, $lte: new Date(dateTo) };
  if (winLoss === "win") query.profit = { $gte: 0 };
  if (winLoss === "loss") query.profit = { $lt: 0 };
  if (symbolSearch) query.pair = { $regex: symbolSearch, $options: "i" };

  return await MTJournal.find(query).sort({ date: -1 });
};

// Fetch from external API, optionally save to DB
const refreshMTJournal = async () => {
  const trades = await fetchExternalMTTrades();

  // Optional: save/update MongoDB
  for (const trade of trades) {
    await MTJournal.updateOne(
      { ticket: trade.ticket },
      { $set: trade },
      { upsert: true }
    );
  }

  return trades;
};

module.exports = { getMTJournal, refreshMTJournal };
