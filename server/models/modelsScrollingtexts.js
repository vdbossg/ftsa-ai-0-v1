// server/models/modelsScrollingtexts.js
const mongoose = require('mongoose');
const connectAdminDB = require('../config/adminDb');

const scrollingTextSchema = new mongoose.Schema({
  title: String,
  scrollingText: String,
  description: String,
  mediaUrl: { type: [String], default: [] },
  mediaType: { type: [String], default: [] },
  status: String,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'scrollingtexts' });

let ScrollingText;

const getScrollingTextModel = async () => {
  if (ScrollingText) return ScrollingText;

  const adminConnection = await connectAdminDB();
  ScrollingText = adminConnection.model('ScrollingText', scrollingTextSchema);
  return ScrollingText;
};

module.exports = getScrollingTextModel;
