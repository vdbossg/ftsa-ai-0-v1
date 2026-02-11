// server/services/servicesScrollingtexts.js
const getScrollingTextModel = require('../models/modelsScrollingtexts');

const LIVE_BASE_URL = 'http://localhost:5001'; // or process.env.MEDIA_BASE_URL

const getLiveScrollingTexts = async () => {
  const ScrollingText = await getScrollingTextModel();

  // Fetch all documents with status: "go_live"
  let liveTexts = await ScrollingText.find({ status: 'go_live' }).sort({ createdAt: -1 }).lean();

  // Convert relative mediaUrl to full URL only if needed
  liveTexts = liveTexts.map(text => {
    if (!text.mediaUrl) return text;
    const mediaUrl = text.mediaUrl.map(url => url.startsWith('http') ? url : LIVE_BASE_URL + url);
    return { ...text, mediaUrl };
  });

  return liveTexts;
};

module.exports = {
  getLiveScrollingTexts
};
