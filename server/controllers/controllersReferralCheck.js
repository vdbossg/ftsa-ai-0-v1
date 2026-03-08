//FTSA_AI_0.v1\server\controllers\controllersReferralCheck.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const GetStarted = require("../models/modelsGetstarted");
const User = require("../models/User");

// Helper to get logged-in userId
const getCurrentUserId = () => {
  const watcherPath = path.join(__dirname, "../services/currentWatcherUser.json");
  try {
    const data = fs.readFileSync(watcherPath, "utf8");
    const json = JSON.parse(data);
    return json.userId || null;
  } catch (err) {
    console.error("Failed to read currentWatcherUser.json:", err);
    return null;
  }
};

class ReferralCheckController {
  async checkAndProcessReferral(req, res) {
    try {
      const userId = getCurrentUserId();
      if (!userId)
        return res.status(400).json({ success: false, message: "No user logged in" });

      const user = await User.findById(userId);
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

      const referral = await GetStarted.findOne({ email: user.email });
      if (!referral)
        return res.json({ success: true, message: "No referral found for this user" });

      const endpoint = `http://localhost:5000/api/byrer/newuser`;

      const response = await axios.post(endpoint, {
        userId: user._id,
        email: user.email,
        referredBy: referral.referralCode,
      });

      console.log("BYRER RESPONSE:", response.data);

      if (response.data.message === "Referral saved successfully") {
        await GetStarted.deleteOne({ _id: referral._id });

        return res.json({
          success: true,
          message: "Referral processed and deleted",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Referral NOT saved in byr",
          byrResponse: response.data,
        });
      }

    } catch (err) {
      console.error("Referral check error:", err.response?.data || err.message);

      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.response?.data || err.message,
      });
    }
  }
}

module.exports = new ReferralCheckController();