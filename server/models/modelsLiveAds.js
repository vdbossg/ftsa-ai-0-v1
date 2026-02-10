// FTSA_AI_0.v1/server/models/modelsLiveAds.js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  mediaType: { type: String, required: true },
  fileName: { type: String, required: true },
  url: { type: String, required: true }
}, { _id: true });

const liveAdsSchema = new mongoose.Schema({
  type: { type: String, required: true },
  media: [mediaSchema],
  description: { type: String },
  status: { type: String, required: true },
  priority: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = liveAdsSchema; // export schema only
