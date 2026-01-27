// server/services/ex5LinkerService.js
const fs = require("fs");
const path = require("path");
const License = require("../models/License");
const LicenseEx5 = require("../models/ex5Linkermodel");

// Folder where EX5 files appear
const EX5_DIR = path.join(__dirname, "../../mt5/MQL5/Experts");

// Folder to store linked files
const LINKED_DIR = path.join(EX5_DIR, "MyLicensed_ex5");

// Ensure linked folder exists
if (!fs.existsSync(LINKED_DIR)) fs.mkdirSync(LINKED_DIR, { recursive: true });

// Helper: find license near timestamp
async function findLicenseForEx5(mtLogin, detectedAt) {
  const licenses = await License.find({ mtLogin }).sort({ createdAt: -1 });
  const thresholdMs = 5 * 60 * 1000; // 5 minutes

  for (let lic of licenses) {
    const diff = Math.abs(new Date(lic.createdAt) - detectedAt);
    if (diff <= thresholdMs) return lic;
  }

  return licenses[0] || null;
}

// Move file to linked folder safely (incremental numbering to avoid overwrite)
function moveToLinkedFolder(fileName) {
  const src = path.join(EX5_DIR, fileName);
  let destFileName = fileName;
  let dest = path.join(LINKED_DIR, destFileName);

  let counter = 1;
  // Keep incrementing until we find a filename that doesn't exist
  while (fs.existsSync(dest)) {
    destFileName = fileName.replace(/\.ex5$/, `_${counter}.ex5`);
    dest = path.join(LINKED_DIR, destFileName);
    counter++;
  }

  fs.renameSync(src, dest);
  return destFileName; // <-- return the **new filename**, not full path
}



// Watch EX5 folder
function startEx5Watcher() {
  fs.watch(EX5_DIR, async (eventType, filename) => {
    if (!filename || !filename.endsWith(".ex5")) return;

    try {
      const detectedAt = new Date();
      const mtLoginMatch = filename.match(/\d+/);
      if (!mtLoginMatch) return console.log("Cannot parse MT5 login from filename:", filename);

      const mtLogin = Number(mtLoginMatch[0]);
      const license = await findLicenseForEx5(mtLogin, detectedAt);
      if (!license) return console.log("No license found for MT5 login:", mtLogin);

      // Prevent duplicate linking
      const exists = await LicenseEx5.findOne({ filename, licenseId: license._id });
      if (exists) return;

      // Move to MyLicensed_ex5 folder
const newFileName = moveToLinkedFolder(filename);
const linkedFilePath = path.join(LINKED_DIR, newFileName);

await LicenseEx5.create({
  licenseId: license._id,
  userId: license.userId,
  mtLogin,
  filename: newFileName, // <-- use the unique filename here
  filePath: linkedFilePath,
  linkedAt: detectedAt,
  status: license.active ? "active" : "inactive",
});

      console.log(`✅ Linked ${filename} to license ${license.licenseKey}`);
    } catch (err) {
      console.error("EX5 linker error:", err.message);
    }
  });

  console.log("🚀 EX5 Linker Service running, watching folder:", EX5_DIR);
}

module.exports = { startEx5Watcher };
