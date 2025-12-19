//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\services\fcsService.js
const fs = require("fs");
const path = require("path");
const config = require("../config/fcsConfig.json");

function saveSignal(signal) {
  try {
    // Accept all symbols
// (optional: keep whitelist by using "*" in config)
if (config.allowedSymbols.length > 0 && config.allowedSymbols[0] !== "*") {
  if (!config.allowedSymbols.includes(signal.symbol)) {
    throw new Error(`Symbol ${signal.symbol} is not allowed`);
  }
}


    if (!signal.lots) signal.lots = config.defaultLot;
    if (!signal.sl) signal.sl = config.defaultSl;
    if (!signal.tp) signal.tp = config.defaultTp;
    if (!signal.id) signal.id = Date.now().toString();

    const jsonFullPath = path.resolve(config.jsonPath);
    const folder = path.dirname(jsonFullPath);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    fs.writeFileSync(jsonFullPath, JSON.stringify(signal, null, 2));
    console.log("Signal saved:", signal);
    return signal;
  } catch (err) {
    console.error("Error saving signal:", err.message);
    return null;
  }
}

function getLatestSignal() {
  try {
    const jsonFullPath = path.resolve(config.jsonPath);
    if (!fs.existsSync(jsonFullPath)) return null;
    const data = fs.readFileSync(jsonFullPath);
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading signal:", err.message);
    return null;
  }
}

module.exports = { saveSignal, getLatestSignal };
