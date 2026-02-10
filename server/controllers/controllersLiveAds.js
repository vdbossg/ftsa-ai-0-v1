// FTSA_AI_0.v1/server/controllers/controllersLiveAds.js
const { getLiveAds } = require('../services/servicesLiveAds');

const fetchLiveAds = async (req, res) => {
  try {
    const ads = await getLiveAds();
    res.json({ success: true, data: ads });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch live ads', error: err.message });
  }
};

module.exports = { fetchLiveAds };
