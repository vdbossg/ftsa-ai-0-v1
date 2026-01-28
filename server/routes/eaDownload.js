// server/routes/eaDownload.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { verifyUser } = require("../middlewares/auth"); // your auth middleware
const License = require("../models/License"); // your MongoDB License model

// folder where compiled EAs live
const EA_FOLDER = "C:/Users/LENOVO/Desktop/FTSA_AI_0.v1/mt5/MQL5/Experts";

// POST /api/ea/download
router.post("/download", verifyUser, async (req, res) => {
  const { licenseId } = req.body;
  const userId = req.user.id; // set by verifyUser middleware

  try {
    // Find license in MongoDB
    const license = await License.findOne({ _id: licenseId, userId });

    if (!license) return res.status(404).json({ success: false, error: "License not found." });

    // Check if license is active
    const now = new Date();
    if (!license.active || license.endDate < now) {
      return res.status(403).json({ success: false, error: "License expired or inactive." });
    }

    // Map license to EA file path
    const eaFilename = `FTSA_AI_${license.mtLogin}.ex5`;
    const eaPath = path.join(EA_FOLDER, eaFilename);

    // Check if file exists
    if (!fs.existsSync(eaPath)) {
      return res.status(404).json({ success: false, error: "EA file not found on server." });
    }

    // Send file as download
    res.download(eaPath, eaFilename, (err) => {
      if (err) {
        console.error("Error sending EA:", err);
        res.status(500).json({ success: false, error: "Failed to download EA." });
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

module.exports = router;
