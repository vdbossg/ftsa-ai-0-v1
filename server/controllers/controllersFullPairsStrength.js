// controllers/controllersFullPairsStrength.js
const FullPairsService = require('../services/servicesFullPairsStrength');

async function getFullPairsStrength(req, res) {
  try {
    const data = await FullPairsService.updateFullPairsStrength();
    res.json(data);
  } catch (err) {
    console.error("❌ getFullPairsStrength error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  getFullPairsStrength
};