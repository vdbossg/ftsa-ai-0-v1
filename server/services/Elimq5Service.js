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

    // Base output file path
let baseFileName = `FTSA_AI_${license.mtLogin}.mq5`;
let outputFile = path.join(outputDir, baseFileName);

// Check if file exists, add incremental suffix if needed
let counter = 1;
while (true) {
  try {
    await fs.access(outputFile); // file exists
    const extIndex = baseFileName.lastIndexOf('.mq5');
    const nameOnly = baseFileName.slice(0, extIndex);
    const ext = baseFileName.slice(extIndex);
    outputFile = path.join(outputDir, `${nameOnly}_${counter}${ext}`);
    counter++;
  } catch {
    // file does not exist, ready to write
    break;
  }
}

await fs.writeFile(outputFile, templateContent, "utf8");

console.log("✅ EA generated:", outputFile);
return { outputFile };

  } catch (err) {
    console.error("❌ EA generation failed:", err);
    throw err;
  }
}


  // ------------------ AUTO-POLLING ------------------
 

constructor() {
    // Track last license as full object
    this.lastLicense = null;

    // Start polling every POLL_INTERVAL (3s)
    this.startPolling();
}

  async pollForNewLicense() {
    try {
      const { getUserLatestLicense } = require("../services/licenseService");

const currentUserDataRaw = await fs.readFile(
    path.join(__dirname, "currentWatcherUser.json"),
    "utf8"
);
const currentUserData = currentUserDataRaw ? JSON.parse(currentUserDataRaw) : {};
const userId = currentUserData.userId;
if (!userId) return; // no logged-in user, skip

const license = await getUserLatestLicense(userId);
if (!license || !license.licenseKey) return;


// Compare all fields to detect a new license
// Only generate if license key changed
const isNewLicense = !this.lastLicense || this.lastLicense !== license.licenseKey;

if (isNewLicense) {
  this.lastLicense = license.licenseKey; // store last license key

  console.log(`🆕 New license detected: ${license.licenseKey}, generating EA...`);
  await Elimq5Service.injectLatestLicense(userId);
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
