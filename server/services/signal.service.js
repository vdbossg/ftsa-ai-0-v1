//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\services\signal.service.js
const Signal = require("../models/Signal.model");

exports.save = async (data) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Ensure only one signal per symbol
  await Signal.deleteMany({ symbol: data.symbol });

  return await Signal.create({
    symbol: data.symbol,

    type: data.type !== undefined && data.type !== "false" ? data.type : false,
    mode: data.mode !== undefined && data.mode !== "false" ? data.mode : false,

    choch: typeof data.choch === "number" ? data.choch : false,

    // ✅ CORRECT normalization
    resistance: typeof data.resistance === "number" ? data.resistance : false,
    support: typeof data.support === "number" ? data.support : false,

    entry: typeof data.entry === "number" ? data.entry : false,
    sl: typeof data.sl === "number" ? data.sl : false,
    tp: typeof data.tp === "number" ? data.tp : false,

    timeframe: data.timeframe || "NA",
    expiresAt
  });
};

exports.getAll = async () => {
  return await Signal.find();
};
