// server/controllers/controllersNewreferrals.js
const referralService = require('../services/servicesNewreferrals');

const postNewReferral = async (req, res) => {
  try {
    const { userId, email, referredBy } = req.body;
    if (!userId || !email || !referredBy) {
      return res.status(400).json({ message: "userId, email, and referredBy are required." });
    }

    const savedReferral = await referralService.addReferral({ userId, email, referredBy });
    res.status(201).json({ message: "Referral saved successfully", data: savedReferral });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getReferrals = async (req, res) => {
  try {
    const referrals = await referralService.getAllReferrals();
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  postNewReferral,
  getReferrals,
};
