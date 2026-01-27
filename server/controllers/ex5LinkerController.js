// server/controllers/ex5LinkerController.js
const LicenseEx5 = require("../models/ex5Linkermodel");

// Get all active EX5 for user
async function getActiveEx5(req, res) {
  const userId = req.user._id;
  try {
    const ex5s = await LicenseEx5.find({ userId, status: "active" }).sort({ linkedAt: -1 });
    res.json({ success: true, data: ex5s });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch active EX5" });
  }
}

// Get all inactive EX5 for user
async function getInactiveEx5(req, res) {
  const userId = req.user._id;
  try {
    const ex5s = await LicenseEx5.find({ userId, status: "inactive" }).sort({ linkedAt: -1 });
    res.json({ success: true, data: ex5s });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch inactive EX5" });
  }
}

module.exports = { getActiveEx5, getInactiveEx5 };
