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

 // ---------------- FOLDER-BASED SUFFIX LOGIC ----------------
const myLicensedDir = path.join(__dirname, "../../mql5/MyLicensed_ex5");
await fs.mkdir(myLicensedDir, { recursive: true });

const folderPrefix = `FTSA_AI_${license.mtLogin}`;
const existingItems = await fs.readdir(myLicensedDir, { withFileTypes: true });

// Find all folders for this login
const matchingFolders = existingItems
  .filter(f => f.isDirectory() && (f.name === folderPrefix || f.name.startsWith(`${folderPrefix}_`)))
  .map(f => f.name);

// Determine next suffix
let nextSuffix = 0;
matchingFolders.forEach(f => {
    const match = f.match(new RegExp(`^${folderPrefix}_(\\d+)$`));
    if (match) nextSuffix = Math.max(nextSuffix, parseInt(match[1], 10) + 1);
    else if (f === folderPrefix) nextSuffix = Math.max(nextSuffix, 1);
});

// Final folder name
const finalFolderName = nextSuffix === 0 ? folderPrefix : `${folderPrefix}_${nextSuffix}`;
const finalFolderPath = path.join(myLicensedDir, finalFolderName);
await fs.mkdir(finalFolderPath, { recursive: true });

// Final EX5 filename inside that folder
const finalEx5File = path.join(finalFolderPath, `${finalFolderName}.ex5`);

// Save template content as .mq5 first (before compilation)
const tempMq5Path = path.join(outputDir, `${finalFolderName}.mq5`);
await fs.writeFile(tempMq5Path, templateContent, "utf8");

// At this point, your compilation step should compile tempMq5Path → finalEx5File
// Example (if already compiled elsewhere):
// await fs.rename(compiledEx5Path, finalEx5File);

console.log("✅ EA folder and EX5 ready:", finalFolderPath, finalEx5File);
return { folder: finalFolderPath, outputFile: finalEx5File };

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
