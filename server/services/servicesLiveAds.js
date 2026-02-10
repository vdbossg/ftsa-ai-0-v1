// FTSA_AI_0.v1/server/services/servicesLiveAds.js
const connectAdminDB = require('../config/adminDb');
const mongoose = require('mongoose');
const liveAdsSchema = require('../models/modelsLiveAds');

let LiveAds; // model

const getLiveAds = async () => {
  try {
    const conn = await connectAdminDB();
    if (!LiveAds) LiveAds = conn.model('adsdatas', liveAdsSchema, 'adsdatas');

    // Fetch only ads with status "go live"
    const liveAds = await LiveAds.find({ status: 'go live' }).sort({ priority: -1 });
    return liveAds;
  } catch (err) {
    console.error('Error fetching live ads:', err.message);
    throw err;
  }
};

module.exports = { getLiveAds };
