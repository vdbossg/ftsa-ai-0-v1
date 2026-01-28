// server/services/watcherSessionService.js
const fs = require("fs");
const path = require("path");

// File to store the currently bound watcher user
const WATCHER_FILE = path.join(__dirname, "currentWatcherUser.json");
console.log("Watcher file path:", WATCHER_FILE);

/**
 * Bind the current logged-in user to the EX5 watcher
 * Saves to file for persistence across restarts
 */
function setWatcherUserId(userId) {
  try {
    // Ensure the folder exists before writing
    const dir = path.dirname(WATCHER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(WATCHER_FILE, JSON.stringify({ userId }), "utf-8");
    console.log(`✅ Watcher bound to user: ${userId}`);
  } catch (err) {
    console.error("❌ Failed to bind watcher user:", err);
  }
}


/**
 * Get the currently bound watcher user from file
 */
function getWatcherUserId() {
  try {
    if (!fs.existsSync(WATCHER_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(WATCHER_FILE, "utf-8"));
    return data.userId || null;
  } catch (err) {
    console.error("❌ Failed to read watcher user:", err);
    return null;
  }
}

module.exports = { setWatcherUserId, getWatcherUserId };