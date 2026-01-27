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

// Download EX5 by licenseId (all versions)
async function downloadEx5ByLicense(req, res) {
  const userId = req.user._id;
  const licenseId = req.params.licenseId;

  try {
    // Fetch all EX5 records for this license, newest first
    const ex5Files = await LicenseEx5.find({ licenseId, userId }).sort({ linkedAt: -1 });

    if (!ex5Files.length)
      return res.status(404).json({ success: false, error: "EX5 not found" });

    // Instead of picking one file, send a list to the client
    // Client can then pick which version to download
    const filesList = ex5Files.map(f => ({
      filename: f.filename,
      filePath: f.filePath,
      linkedAt: f.linkedAt,
      status: f.status
    }));

    res.json({ success: true, data: filesList });

  } catch (err) {
    console.error("downloadEx5ByLicense error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch EX5 files" });
  }
}

module.exports = { getActiveEx5, getInactiveEx5, downloadEx5ByLicense };
