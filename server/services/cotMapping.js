const axios = require("axios");
const Cot = require("../models/cotMapping");
const { getCOTCurrency } = require("../utils/cotMapping");

async function fetchAndUpdateCOT(pair) {
  const cotCurrency = getCOTCurrency(pair);
  if (!cotCurrency) return null;

  try {
    // COT API URL (CFTC JSON public feed)
    const url = `https://publicreporting.cftc.gov/resource/6dca-aqww.json?market_and_exchange_names=${encodeURIComponent(cotCurrency + " - CHICAGO MERCANTILE EXCHANGE")}&$order=report_date_as_yyyy_mm_dd DESC&$limit=1`;

    const response = await axios.get(url);
    if (!response.data || response.data.length === 0) return null;

    const cot = response.data[0];

    const nonCommLong = parseFloat(cot.noncomm_positions_long_all) || 0;
    const nonCommShort = parseFloat(cot.noncomm_positions_short_all) || 0;
    const net = nonCommLong - nonCommShort;
    const total = nonCommLong + nonCommShort;
    const pct = total > 0 ? (net / total) * 100 : 0;

    let bias = "⚪ neutral";
    if (pct > 10) bias = "🟩 bullish";
    else if (pct < -10) bias = "🟥 bearish";

    const cotDoc = {
      pair,
      cotCurrency,
      reportDate: cot.report_date_as_yyyy_mm_dd,
      nonCommercial: { long: nonCommLong, short: nonCommShort, net, percent: pct.toFixed(2) },
      bias
    };

    // Upsert in MongoDB
    await Cot.findOneAndUpdate({ pair }, cotDoc, { upsert: true, new: true });

    return cotDoc;
  } catch (err) {
    console.error("COT fetch error:", err.message);
    return null;
  }
}

async function fetchAllCOT(pairs) {
  const results = [];
  for (const pair of pairs) {
    const res = await fetchAndUpdateCOT(pair);
    if (res) results.push(res);
  }
  return results;
}

module.exports = { fetchAndUpdateCOT, fetchAllCOT };