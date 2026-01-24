// C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\services\proxyToken.js
const fs = require("fs");
const path = require("path");

// Path to the JSON storage
const LltuPath = path.join(__dirname, "Lltu_json.json");

class ProxyToken {
  constructor() {
    this.jsonPath = LltuPath;
    this.data = {};

    // Load existing data if file exists
    if (fs.existsSync(this.jsonPath)) {
      try {
        this.data = JSON.parse(fs.readFileSync(this.jsonPath, "utf8"));
      } catch (err) {
        console.error("Error reading Lltu_json.json:", err.message);
        this.data = {};
      }
    }
  }

  // Save token for a specific user
  saveToken(userId, token) {
    this.data[userId] = { token, updatedAt: new Date().toISOString() };
    fs.writeFileSync(this.jsonPath, JSON.stringify(this.data, null, 4), "utf8");
    console.log(`✅ Token saved for user ${userId}`);
  }

  // Get token for a specific user
  getToken(userId) {
    return this.data[userId]?.token || null;
  }
}

// Export a single instance
module.exports = new ProxyToken();
