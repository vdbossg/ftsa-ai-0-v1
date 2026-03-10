const SymbolTopdownStrength = require('../models/modelsTopdownStrength');

async function getAllTopdown(req, res) {
  try {
    const allData = await SymbolTopdownStrength.find().sort({ symbol: 1 });
    res.json(allData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTopdownBySymbol(req, res) {
  try {
    const { symbol } = req.params;
    const data = await SymbolTopdownStrength.findOne({ symbol: symbol.toUpperCase() });
    if (!data) return res.status(404).json({ error: 'Symbol not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllTopdown, getTopdownBySymbol };