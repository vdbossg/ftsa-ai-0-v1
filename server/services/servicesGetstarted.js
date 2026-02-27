const GetStarted = require('../models/modelsGetstarted');

class GetStartedService {
  async createReferral(data) {
    const referral = new GetStarted(data);
    return await referral.save();
  }

  async getAllReferrals() {
    return await GetStarted.find().sort({ createdAt: -1 });
  }

  async getByEmail(email) {
    return await GetStarted.findOne({ email });
  }
}

module.exports = new GetStartedService();