import Affiliate from "../models/Affiliate.js"; // make sure this model exists
import User from "../models/User.js";

export const getAffiliateData = async (req, res) => {
  try {
    const { userId } = req.params;
    const affiliate = await Affiliate.findOne({ user: userId }).populate('referredUsers');
    if (!affiliate) return res.status(404).json({ message: "Affiliate not found" });
    res.json(affiliate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerAffiliate = async (req, res) => {
  try {
    const { fullName, username, email, password, country, phone } = req.body;
    // simple check for existing affiliate
    const existing = await Affiliate.findOne({ email });
    if (existing) return res.status(400).json({ message: "Affiliate already exists" });

    const newAffiliate = await Affiliate.create({
      fullName,
      username,
      email,
      password,
      country,
      phone,
      isRegistered: true,
      totalCommission: 0,
      availableBalance: 0,
      referredUsers: [],
    });

    res.status(201).json(newAffiliate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};
