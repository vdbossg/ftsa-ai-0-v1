// server/services/ex5LinkerService.js
const fs = require("fs");
const path = require("path");
const License = require("../models/License");
const LicenseEx5 = require("../models/ex5Linkermodel");

// Source folder where EX5 files appear
const EX5_DIR = path.join(__dirname, "../../mql5/Licensed_ex5");

// Target folder to store linked EX5 files
const LINKED_DIR = path.join(__dirname, "../../mql5/MyLicensed_ex5");

// Ensure the linked folder exists
if (!fs.existsSync(LINKED_DIR)) fs.mkdirSync(LINKED_DIR, { recursive: true });

// Threshold in milliseconds for matching license creation time
const LICENSE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Find the most recent license for a given MT5 login
 * within a time threshold of detectedAt
 */
async function findLicenseForEx5ByUser(userId, detectedAt) {
  const windowStart = new Date(detectedAt - LICENSE_THRESHOLD_MS); // 5 min before detection
  const windowEnd = detectedAt;

  const license = await License.findOne({
    userId,
    createdAt: { $gte: windowStart, $lte: windowEnd }
  }).sort({ createdAt: -1 }); // newest first

  return license; // null if none found
}


/**
 * Move EX5 file safely into the linked folder, creating
 * a subfolder for the file.
 */
function moveToLinkedFolder(fileName, license) {
  const src = path.join(EX5_DIR, fileName);

  if (!fs.existsSync(src)) {
    console.error("❌ Source file does not exist:", src);
    return null;
  }

  // Create a folder for this EX5
  const ex5FolderName = `${fileName.split(".")[0]}`; // FTSA_AI_123456
  const ex5FolderPath = path.join(LINKED_DIR, ex5FolderName);
  if (!fs.existsSync(ex5FolderPath)) fs.mkdirSync(ex5FolderPath, { recursive: true });

  // Destination file path
  const destFilePath = path.join(ex5FolderPath, fileName);

  // Move the file
  try {
    fs.renameSync(src, destFilePath);
    console.log(`✅ Moved ${fileName} → ${destFilePath}`);
  } catch (err) {
    console.error("❌ Failed to move file:", err.message);
    return null;
  }

  // Generate license info txt
  const timestamp = new Date().toISOString().replace(/:/g, "-"); // safe for filename
  const licenseTxtPath = path.join(
    ex5FolderPath,
    `${fileName}+license${timestamp}.txt`
  );

  const licenseContent = `
License Key: ${license.licenseKey}
User ID: ${license.userId}
MT5 Login: ${license.mtLogin}
Plan: ${license.plan}
Broker: ${license.broker}
Start Date: ${license.startDate.toISOString()}
End Date: ${license.endDate.toISOString()}
Status: ${license.active ? "active" : "inactive"}
Linked At: ${new Date().toISOString()}
`;

  fs.writeFileSync(licenseTxtPath, licenseContent.trim());
  console.log(`📄 Generated license info: ${licenseTxtPath}`);

  return destFilePath;
}

/**
 * Watch the EX5 folder for new files
 */
function startEx5Watcher() {
  console.log("🚀 EX5 Linker Service running, watching folder:", EX5_DIR);

  // 🔁 POLL every 2 seconds
setInterval(async () => {
  try {
    const files = fs.readdirSync(EX5_DIR).filter(f => f.endsWith(".ex5"));

    for (const filename of files) {
      const detectedAt = new Date();
      const { getWatcherUserId } = require("../services/watcherSessionService");
      const userId = getWatcherUserId();

      if (!userId) {
        console.log("❌ No logged-in user bound to EX5 watcher.");
        continue;
      }

      const license = await findLicenseForEx5ByUser(userId, detectedAt);
      if (!license) {
        console.log("No matching license found for user:", userId);
        continue;
      }

      const exists = await LicenseEx5.findOne({ filename, licenseId: license._id });
      if (exists) {
        console.log(`⚠️ Already linked: ${filename} to license ${license.licenseKey}`);
        continue;
      }

      const linkedFilePath = moveToLinkedFolder(filename, license);
      if (!linkedFilePath) continue;

      await LicenseEx5.create({
        licenseId: license._id,
        userId: license.userId,
        mtLogin: license.mtLogin,
        filename,
        filePath: linkedFilePath,
        linkedAt: detectedAt,
        status: license.active ? "active" : "inactive",
      });

      console.log(`✅ Linked ${filename} to license ${license.licenseKey}`);
    }
  } catch (err) {
    console.error("EX5 polling error:", err.message);
  }
}, 2000); // every 2 seconds

}

module.exports = { startEx5Watcher };
