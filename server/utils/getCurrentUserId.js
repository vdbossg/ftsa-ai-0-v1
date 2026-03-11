// FTSA_AI_0.v1\server\utils\getCurrentUserId.js
const fs = require("fs");
const path = require("path");

function getCurrentUserId() {
  const watcherPath = path.join(__dirname, "currentWatcherUser.json"); // adjust path if needed
  try {
    const data = fs.readFileSync(watcherPath, "utf8");
    const json = JSON.parse(data);
    return json.userId || null;
  } catch (err) {
    console.error("❌ Failed to read currentWatcherUser.json:", err);
    return null;
  }
}

module.exports = getCurrentUserId;