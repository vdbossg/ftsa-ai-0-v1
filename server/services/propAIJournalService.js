const PropJournal = require("./Model");

exports.fetchPropJournal = async (filters) => {
  const { dateFrom, dateTo, winLoss, symbolSearch } = filters;
  let query = {};

  if (dateFrom) query.date = { $gte: new Date(dateFrom) };
  if (dateTo) query.date = { ...query.date, $lte: new Date(dateTo) };
  if (winLoss === "win") query.profit = { $gte: 0 };
  if (winLoss === "loss") query.profit = { $lt: 0 };
  if (symbolSearch) query.pair = { $regex: symbolSearch, $options: "i" };

  return await PropJournal.find(query).sort({ date: -1 });
};
