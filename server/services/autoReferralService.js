const User = require("../models/User");
const GetStarted = require("../models/modelsGetstarted");
const ReferralCheckController = require("../controllers/controllersReferralCheck");

class AutoReferralService {
  constructor(interval = 5000) { // 5 seconds
    this.interval = interval;
    this.controller = ReferralCheckController; // reuse your existing controller logic
    this.start();
  }

  start() {
    setInterval(async () => {
      try {
        // Find all unused referrals
        const referrals = await GetStarted.find({ used: false });
        for (const referral of referrals) {
          const user = await User.findOne({ email: referral.email });
          if (!user) continue; // skip if user not yet in DB

          // mimic calling checkAndProcessReferral
          await this.controller.checkAndProcessReferral({ /* fake req */ }, { 
            json: (data) => console.log("AutoReferral:", data), 
            status: (code) => ({ json: (data) => console.log(`Status ${code}:`, data) }) 
          });
        }
      } catch (err) {
        console.error("AutoReferralService error:", err.message);
      }
    }, this.interval);
  }
}

module.exports = AutoReferralService;