// server/gatemanService.js
const fs = require("fs");
const path = require("path");
const { findUserIdByEmail } = require("../models/gatemanModels"); // ✅ go up one level

// Path to local JSON file (inside server/services)
const servicesFolder = path.join(__dirname, "services");
const jsonFilePath = path.join(servicesFolder, "currentWatcherUser.json");

// Generate JSON for a user
async function generateUserJson(email) {
  const userId = await findUserIdByEmail(email);
  if (!userId) throw new Error("User not found");

  // Ensure folder exists
  if (!fs.existsSync(servicesFolder)) fs.mkdirSync(servicesFolder, { recursive: true });

  // Write JSON
  const jsonData = { userId };
  fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));

  return jsonData;
}

// Delete JSON (for logout)
function deleteUserJson() {
  if (fs.existsSync(jsonFilePath)) fs.unlinkSync(jsonFilePath);
}

module.exports = { generateUserJson, deleteUserJson };
