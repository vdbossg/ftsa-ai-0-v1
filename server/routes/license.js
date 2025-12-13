//\server\routes\license.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const licenseController = require("../controllers/licenseController");

// Selar webhook route (public)
router.post("/webhook/selar", express.json(), licenseController.selarWebhook);

// Authenticated route to fetch user's active license
router.get("/my", authenticateToken, licenseController.getUserLicense);

module.exports = router;
