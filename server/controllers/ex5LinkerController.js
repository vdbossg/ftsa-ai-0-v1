const fs = require("fs");
const LicenseEx5 = require("../models/ex5Linkermodel");

// Fetch active EX5 licenses
async function getActiveEx5(req, res) {
  const userId = req.user._id;
  try {
    const ex5s = await LicenseEx5.find({ userId, status: "active" }).sort({ linkedAt: -1 });
    res.json({ success: true, data: ex5s });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch active EX5" });
  }
}

// Fetch inactive EX5 licenses
async function getInactiveEx5(req, res) {
  const userId = req.user._id;
  try {
    const ex5s = await LicenseEx5.find({ userId, status: "inactive" }).sort({ linkedAt: -1 });
    res.json({ success: true, data: ex5s });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to fetch inactive EX5" });
  }
}

// Download EX5 by licenseId
async function downloadEx5ByLicense(req, res) {
  const userId = req.user._id;
  const licenseId = req.params.licenseId;

  try {
    const ex5 = await LicenseEx5.findOne({ licenseId, userId });
    if (!ex5) return res.status(404).json({ success: false, error: "EX5 not found" });

    if (!fs.existsSync(ex5.filePath)) return res.status(404).json({ success: false, error: "EX5 file missing" });

    res.download(ex5.filePath, ex5.filename);
  } catch (err) {
    console.error("downloadEx5ByLicense error:", err.message);
    res.status(500).json({ success: false, error: "Failed to download EX5" });
  }
}

module.exports = { getActiveEx5, getInactiveEx5, downloadEx5ByLicense };
