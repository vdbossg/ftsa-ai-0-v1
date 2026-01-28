// controllers/ControllerEaDownload.js
const path = require("path");
const fs = require("fs");
const ServicesEaDownload = require("../services/ServicesEaDownload");

let licensesCache = ServicesEaDownload.getAllLicenses();

// Optional: setup real-time updates
ServicesEaDownload.watchFolder((updatedLicenses) => {
  licensesCache = updatedLicenses;
});

const getLicenses = (req, res) => {
  res.json({ success: true, data: licensesCache });
};

const downloadEA = (req, res) => {
  const licenseKey = req.params.licenseKey;
  const license = licensesCache.find((l) => l.licenseKey === licenseKey);

  if (!license) {
    return res.status(404).json({ success: false, message: "License not found" });
  }

  const filePath = path.join(license.folderPath, license.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "EA file not found" });
  }

  res.download(filePath, license.filename);
};

module.exports = { getLicenses, downloadEA };
