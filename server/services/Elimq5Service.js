// server/services/Elimq5Service.js
const fs = require("fs");
const path = require("path");


const templatePath = path.join(__dirname, "../templates/EA_Template.mq5");
const configPath   = path.join(__dirname, "../templates/license_Config.json");
const outputDir    = path.join(__dirname, "../Licensed_mq5");

// Poll interval in milliseconds (3 seconds)
const POLL_INTERVAL = 3 * 1000;

class Elimq5Service {
  // Manual EA generation
  static async injectLatestLicense(userId) {
  const { getUserLatestLicense } = require("../services/licenseService");

  const license = await getUserLatestLicense(userId);
  if (!license || !license.licenseKey) throw new Error("No license found for user");

  const expiryFormatted = license.endDate ? new Date(license.endDate).toISOString().replace("T", " ").split(".")[0] : "";

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

  fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, "FTSA_AI_FCS_EA_FINAL_licensed.mq5");
  fs.writeFileSync(outputFile, templateContent, "utf8");

  console.log(`✅ Licensed EA generated: ${license.licenseKey}`);
  return { message: "Licensed EA generated successfully", outputFile };
}

  // ------------------ AUTO-POLLING ------------------
 constructor(userId) {
    if (!userId) throw new Error("UserId is required for Elimq5Service.");
    this.userId = userId;

    // Track last license as full object
    this.lastLicense = null;

    // Start polling every POLL_INTERVAL (3s)
    this.startPolling();
}



  async pollForNewLicense() {
    try {
      const { getUserLatestLicense } = require("../services/licenseService");

const license = await getUserLatestLicense(this.userId);
if (!license || !license.licenseKey) return;

// Compare all fields to detect a new license
const isNewLicense = !this.lastLicense ||
                     this.lastLicense.broker !== license.broker ||
                     this.lastLicense.mtLogin !== license.mtLogin ||
                     this.lastLicense.endDate !== license.endDate ||
                     this.lastLicense.licenseKey !== license.licenseKey;

      if (isNewLicense) {
        this.lastLicense = {
          broker: license.broker,
          mtLogin: license.mtLogin,
          endDate: license.endDate,
          licenseKey: license.licenseKey
        };

        console.log(`🆕 New license detected: ${license.licenseKey}, generating EA...`);
        await Elimq5Service.injectLatestLicense(this.userId);
      }

    } catch (error) {
      console.error("Elimq5 polling error:", error.message);
    }
  }

  startPolling() {
    // Poll for new license every POLL_INTERVAL milliseconds
    setInterval(async () => {
        await this.pollForNewLicense();
    }, POLL_INTERVAL);

    console.log(`⏱ Elimq5Service polling started every ${POLL_INTERVAL / 1000}s`);
}

}

module.exports = Elimq5Service;
