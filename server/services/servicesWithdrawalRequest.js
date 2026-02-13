const WithdrawalRequest = require('../models/modelsWithdrawalRequest');
const fs = require('fs');
const path = require('path');

// Get currently logged-in userId
function getCurrentUserId() {
  const filePath = path.join(__dirname, 'currentWatcherUser.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    const json = JSON.parse(data);
    return json.userId;
  }
  throw new Error('No logged-in user found in currentWatcherUser.json');
}

// Create a new withdrawal
async function createWithdrawal(method, payload) {
  const userId = getCurrentUserId();
  const withdrawal = new WithdrawalRequest({
    ...payload,
    method,
    userId
  });
  return await withdrawal.save();
}

// Get all withdrawals for the current user & method
async function getWithdrawals(method) {
  const userId = getCurrentUserId();
  return await WithdrawalRequest.find({ userId, method }).sort({ createdAt: -1 });
}

module.exports = {
  createWithdrawal,
  getWithdrawals
};
