// server/services/Elimq5Service.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const templatePath = path.join(__dirname, "../templates/EA_Template.mq5");
const configPath   = path.join(__dirname, "../templates/license_Config.json");
const outputDir    = path.join(__dirname, "../Licensed_mq5");

// Poll interval in milliseconds (5 minutes)
const POLL_INTERVAL = 5 * 60 * 1000;

class Elimq5Service {
  // Keep the original static method for manual calls
  static async injectLatestLicense(token) {
    try {
      const { data } = await axios.get("http://localhost:5000/api/licenses/my", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ensure latest license is selected
let license = data.data;
if (Array.isArray(license)) {
  license = license[0]; // pick the latest license (most recent)
}

if (!license) throw new Error("No license found for user");

const expiryFormatted = new Date(license.endDate).toISOString().replace("T", " ").split(".")[0]; // YYYY-MM-DD HH:MM:SS

const replacements = {
  "{BROKER}": license.broker || "",
  "{LOGIN}": license.mtLogin.toString(),
  "{EXPIRY}": expiryFormatted,
  "{LICENSE_KEY}": license.licenseKey || ""
};

fs.writeFileSync(configPath, JSON.stringify({
  broker: license.broker || "",
  login: license.mtLogin,
  expiry: expiryFormatted,
  license_key: license.licenseKey || ""
}, null, 4));

      let templateContent = fs.readFileSync(templatePath, "utf8");

      for (const key in replacements) {
        templateContent = templateContent.replace(new RegExp(key, "g"), replacements[key]);
      }

      if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true }); // safe for nested folders
}

      const outputFile = path.join(outputDir, "FTSA_AI_FCS_EA_FINAL_licensed.mq5");
      fs.writeFileSync(outputFile, templateContent, "utf8");

      console.log(`✅ Licensed EA generated: ${license.licenseKey}`);

      return { message: "Licensed EA generated successfully", outputFile };

    } catch (error) {
      console.error("Elimq5 Injection Error:", error.message);
      throw new Error(error.message);
    }
  }

  // ------------------ AUTO-POLLING ------------------
  constructor(token) {
    if (!token) throw new Error("User token is required for Elimq5Service.");
    this.token = token;
    // Test token by fetching license immediately
Elimq5Service.injectLatestLicense(this.token).catch(err => {
  console.error("Initial EA generation failed:", err.message);
});
    this.lastLicenseKey = ""; // Track last license
    this.startPolling();
  }

  async pollForNewLicense() {
    try {
      const { data } = await axios.get("http://localhost:5000/api/licenses/my", {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const license = data.data;

      if (license.licenseKey && license.licenseKey !== this.lastLicenseKey) {
        this.lastLicenseKey = license.licenseKey;
        await Elimq5Service.injectLatestLicense(this.token);
      }
    } catch (error) {
      console.error("Elimq5 polling error:", error.message);
    }
  }

  startPolling() {
    // Run immediately once
    this.pollForNewLicense();

    // Then repeat every interval
    setInterval(() => this.pollForNewLicense(), POLL_INTERVAL);
    console.log(`⏱ Elimq5Service polling started every ${POLL_INTERVAL / 1000}s`);
  }
}

module.exports = Elimq5Service;
