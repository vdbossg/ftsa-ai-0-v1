// FTSA_AI_0.v1/server/services/servicesAffiliatestatusMy.js
const fs = require('fs');
const path = require('path');
const Affiliate = require('../models/modelsAffiliatestatusMy');

const currentWatcherFile = path.join(__dirname, 'currentWatcherUser.json');

const getCurrentUserId = () => {
  try {
    const rawData = fs.readFileSync(currentWatcherFile, 'utf8');
    const json = JSON.parse(rawData);
    return json.userId || null;
  } catch (err) {
    console.error('Error reading currentWatcherUser.json:', err);
    return null;
  }
};

const getAffiliateDataByUserId = async (userId) => {
  if (!userId) return null;
  return await Affiliate.findOne({ user: userId }).lean();
};

module.exports = {
  getCurrentUserId,
  getAffiliateDataByUserId
};
