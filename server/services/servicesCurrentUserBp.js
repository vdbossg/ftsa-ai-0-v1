// FTSA_AI_0.v1\server\services\servicesCurrentUserBp.js
const fs = require("fs");
const path = require("path");
const { User } = require("../models/modelsCurrentUserBp");

// Read logged-in userId from currentWatcherUser.json
const getCurrentUserId = () => {
  const watcherPath = path.join(__dirname, "../currentWatcherUser.json");
  try {
    const data = fs.readFileSync(watcherPath, "utf8");
    const json = JSON.parse(data);
    return json.userId || null;
  } catch (err) {
    console.error("❌ Failed to read currentWatcherUser.json:", err);
    return null;
  }
};

// Return minimal user info
const getCurrentUserBp = async (userIdParam) => {
  const userId = userIdParam || getCurrentUserId();
  if (!userId) return null;

  const user = await User.findById(userId).select("firstName email");
  if (!user) return null;

  return {
    userId: user._id.toString(),
    email: user.email,
    name: user.firstName
  };
};

module.exports = { getCurrentUserBp };