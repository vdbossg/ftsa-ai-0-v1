const WithdrawalRequest = require("../models/modelsWithdrawalRequest");

class WithdrawalRequestService {
  static async create(data) {
    const withdrawal = new WithdrawalRequest(data);
    return await withdrawal.save();
  }
}

module.exports = WithdrawalRequestService;
