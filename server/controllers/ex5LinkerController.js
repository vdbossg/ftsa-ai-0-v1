// server/controllers/ex5Controller.js
const fs = require("fs");
const LicenseEx5 = require("../models/ex5Linkermodel");

// Fetch all active EX5 licenses for the logged-in user
async function getActiveEx5(req, res) {
  const userId = req.user._id;

  try {
    const ex5s = await LicenseEx5.find({ userId, status: "active" })
  .sort({ linkedAt: -1 })
  .populate('licenseId');  // <--- populate licenseId to access licenseKey


    const data = ex5s.map(f => ({
  _id: f._id,
  licenseId: f.licenseId,
  mtLogin: f.mtLogin,
  filename: f.filename,
  filePath: f.filePath,
  licenseKey: f.licenseId?.licenseKey || "",
  linkedAt: f.linkedAt,
  status: f.status
}));


    res.json({ success: true, data });
  } catch (err) {
    console.error("getActiveEx5 error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch active EX5" });
  }
}

// Fetch all inactive EX5 licenses for the logged-in user
async function getInactiveEx5(req, res) {
  const userId = req.user._id;

  try {
    const ex5s = await LicenseEx5.find({ userId, status: "inactive" })
      .sort({ linkedAt: -1 });

    const data = ex5s.map(f => ({
  _id: f._id,
  licenseId: f.licenseId,
  mtLogin: f.mtLogin,
  filename: f.filename,
  filePath: f.filePath,
  licenseKey: f.licenseId?.licenseKey || "",
  linkedAt: f.linkedAt,
  status: f.status
}));

    res.json({ success: true, data });
  } catch (err) {
    console.error("getInactiveEx5 error:", err.message);
    res.status(500).json({ success: false, error: "Failed to fetch inactive EX5" });
  }
}

// Download EX5 files by licenseId (all versions for this user)
async function downloadEx5ByLicense(req, res) {
  const userId = req.user._id;
  const licenseId = req.params.licenseId;

  try {
    // Fetch all EX5 records for this license and user, newest first
    const ex5Files = await LicenseEx5.find({ licenseId, userId })
      .sort({ linkedAt: -1 });

    if (!ex5Files.length) {
      return res.status(404).json({ success: false, error: "EX5 not found" });
    }

    // Send full list with license info
    const filesList = ex5Files.map(f => ({
      filename: f.filename,
      filePath: f.filePath,
      mtLogin: f.mtLogin,           // include MT5 login
      licenseKey: f.licenseId?.licenseKey || "",
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
