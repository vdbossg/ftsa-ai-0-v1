// FTSA_AI_0.v1/server/controllers/controllersAffiliatestatusMy.js
const { getCurrentUserId, getAffiliateDataByUserId } = require('../services/servicesAffiliatestatusMy');

const getAffiliateStatus = async (req, res) => {
  try {
    // Use the userId from JSON
    const userId = getCurrentUserId();
    if (!userId) {
      return res.status(400).json({ success: false, message: 'No logged-in user found' });
    }

    const affiliateData = await getAffiliateDataByUserId(userId);

    if (!affiliateData) {
      return res.status(404).json({ success: false, message: 'Affiliate data not found for this user' });
    }

    return res.json({ success: true, data: affiliateData });

  } catch (err) {
    console.error('Error fetching affiliate data:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAffiliateStatus
};
