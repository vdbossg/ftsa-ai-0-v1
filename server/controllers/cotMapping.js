const { fetchAndUpdateCOT } = require("../services/cotMapping");
const Cot = require("../models/cotMapping");

async function getCOT(req, res) {
  try {
    const pair = req.params.pair.toUpperCase();

    let cot = await Cot.findOne({ pair });
    if (!cot) cot = await fetchAndUpdateCOT(pair);

    if (!cot) return res.status(404).json({ error: "COT data not available" });

    res.json(cot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { getCOT };