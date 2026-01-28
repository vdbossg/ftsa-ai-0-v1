// routes/RoutesEaDownload.js
const express = require("express");
const router = express.Router();
const ControllerEaDownload = require("../controllers/ControllerEaDownload");

router.get("/ea-licenses", ControllerEaDownload.getLicenses);
router.get("/ea-download/:licenseKey", ControllerEaDownload.downloadEA);

module.exports = router;
