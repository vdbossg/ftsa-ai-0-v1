const Signal = require("../models/Signal.model");

exports.save = async (data) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // rewrite: one signal per symbol
  await Signal.deleteMany({ symbol: data.symbol });

  // Save exactly what is sent, keep false or missing fields as-is
  return await Signal.create({
    symbol: data.symbol,
    type: data.type !== undefined ? data.type : false,
    mode: data.mode !== undefined ? data.mode : false,
    choch: data.choch !== undefined ? data.choch : false,
    resistance: data.resistance !== undefined ? data.resistance : false,
    entry: data.entry !== undefined ? data.entry : false,
    sl: data.sl !== undefined ? data.sl : false,
    tp: data.tp !== undefined ? data.tp : false,
    timeframe: data.timeframe || "NA",
    expiresAt
  });
};

exports.getAll = async () => {
  return await Signal.find();
};
