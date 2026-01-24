//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\services\proxyTokenService.js
const fs = require("fs");
const path = require("path");

// Store the latest login token for the user
const LLTU_JSON_PATH = path.join(__dirname, "Lltu_json.json");

class ProxyTokenService {
  // Save latest token + minimal user info
  static saveLatestToken(userId, token) {
    let data = {};
    if (fs.existsSync(LLTU_JSON_PATH)) {
      try {
        data = JSON.parse(fs.readFileSync(LLTU_JSON_PATH, "utf8"));
      } catch (err) {
        console.error("Failed to read LLTU_JSON:", err.message);
      }
    }

    // Overwrite or add this user's token
    data[userId] = {
      token,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(LLTU_JSON_PATH, JSON.stringify(data, null, 4), "utf8");
    console.log(`✅ Token saved for user ${userId}`);
  }

  // Get latest token for a user
  static getLatestToken(userId) {
    if (!fs.existsSync(LLTU_JSON_PATH)) return null;

    try {
      const data = JSON.parse(fs.readFileSync(LLTU_JSON_PATH, "utf8"));
      return data[userId]?.token || null;
    } catch (err) {
      console.error("Failed to read LLTU_JSON:", err.message);
      return null;
    }
  }
}

module.exports = ProxyTokenService;
