const Signal = require("../models/Signal.model");

exports.save = async (data) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Ensure only one signal per symbol
  await Signal.deleteMany({ symbol: data.symbol });

  // Normalize support/resistance: if one is missing, set to '-'
  const resistanceValue = data.resistance !== undefined ? data.resistance : "-";
  const supportValue = data.support !== undefined ? data.support : "-";

  return await Signal.create({
    symbol: data.symbol,
    type: data.type !== undefined ? data.type : false,
    mode: data.mode !== undefined ? data.mode : false,
    choch: data.choch !== undefined ? data.choch : false,
    resistance: resistanceValue,
    support: supportValue,
    entry: data.entry !== undefined ? data.entry : false,
    sl: data.sl !== undefined ? data.sl : false,
    tp: data.tp !== undefined ? data.tp : false,
    timeframe: data.timeframe || "NA",
    expiresAt,
  });
};

exports.getAll = async () => {
  return await Signal.find();
};
