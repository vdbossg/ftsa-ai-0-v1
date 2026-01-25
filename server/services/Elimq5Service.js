// server/services/Elimq5Service.js
const fs = require("fs").promises; // Use async fs functions
const path = require("path");


const templatePath = path.join(
  __dirname,
  "../../mql5/templates/EA_Template.mq5"
);

const outputDir = path.join(
  __dirname,
  "../../mql5/Licensed_mq5"
);

// Poll interval in milliseconds (3 seconds)
const POLL_INTERVAL = 3 * 1000;

class Elimq5Service {
  // EA generation
 static async injectLatestLicense(userId) {
  const { getUserLatestLicense } = require("../services/licenseService");

  const license = await getUserLatestLicense(userId);
  if (!license || !license.licenseKey) {
    throw new Error("No license found for user");
  }

  const expiryFormatted = license.endDate
    ? new Date(license.endDate).toISOString().slice(0, 10).replace(/-/g, ".")
    : "";

  const replacements = {
    "{BROKER}": license.broker,
    "{LOGIN}": license.mtLogin.toString(),
    "{EXPIRY}": expiryFormatted,
    "{LICENSE_KEY}": license.licenseKey
  };

  try {
    let templateContent = await fs.readFile(templatePath, "utf8");

    for (const key in replacements) {
      templateContent = templateContent.replace(
        new RegExp(key, "g"),
        replacements[key]
      );
    }

    await fs.mkdir(outputDir, { recursive: true });

    const outputFile = path.join(
      outputDir,
      `FTSA_AI_${license.mtLogin}.mq5`
    );

    await fs.writeFile(outputFile, templateContent, "utf8");

    console.log("✅ EA generated:", outputFile);
    return { outputFile };

  } catch (err) {
    console.error("❌ EA generation failed:", err);
    throw err;
  }
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
    this.pollingInterval = setInterval(async () => {
        await this.pollForNewLicense();
    }, POLL_INTERVAL);

    console.log(`⏱ Elimq5Service polling started every ${POLL_INTERVAL / 1000}s`);
}
stopPolling() {
    if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        console.log('⏹ Elimq5Service polling stopped');
        this.pollingInterval = null;
    }
}


}

module.exports = Elimq5Service;
