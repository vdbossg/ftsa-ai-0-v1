// server/services/ex5LinkerService.js
const fs = require("fs");
const path = require("path");
const License = require("../models/License");
const LicenseEx5 = require("../models/ex5Linkermodel");

// Folder to watch
const EX5_DIR = path.join(__dirname, "../../mt5/MQL5/Experts");

// Helper: find the license around timestamp
async function findLicenseForEx5(mtLogin, detectedAt) {
  const licenses = await License.find({ mtLogin, active: true }).sort({ createdAt: -1 });
  const thresholdMs = 5 * 60 * 1000; // 5 minutes

  for (let lic of licenses) {
    const diff = Math.abs(new Date(lic.createdAt) - detectedAt);
    if (diff <= thresholdMs) return lic;
  }

  return licenses[0] || null; // fallback to latest
}

// Watch folder for new EX5 files
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

      const exists = await LicenseEx5.findOne({ filename, licenseId: license._id });
      if (exists) return; // already linked

      await LicenseEx5.create({
        licenseId: license._id,
        userId: license.userId,
        mtLogin,
        filename,
        filePath: path.join(EX5_DIR, filename),
        linkedAt: detectedAt,
        status: license.active ? "active" : "inactive"
      });

      console.log(`✅ Linked ${filename} to license ${license.licenseKey}`);
    } catch (err) {
      console.error("Error linking EX5:", err.message);
    }
  });

  console.log("🚀 EX5 Linker Service running, watching folder:", EX5_DIR);
}

module.exports = { startEx5Watcher };
