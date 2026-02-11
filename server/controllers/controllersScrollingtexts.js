// server/controllers/controllersScrollingtexts.js
const { getLiveScrollingTexts } = require('../services/servicesScrollingtexts');

const getLiveScrollingTextsController = async (req, res) => {
  try {
    const data = await getLiveScrollingTexts();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching live scrolling texts:', error.message);
    res.status(500).json({ error: 'Server error fetching live scrolling texts' });
  }
};

module.exports = {
  getLiveScrollingTextsController
};
