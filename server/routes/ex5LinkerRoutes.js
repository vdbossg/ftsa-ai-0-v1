// server/routes/ex5LinkerRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { getActiveEx5, getInactiveEx5, downloadEx5ByLicense } = require("../controllers/ex5LinkerController");

// Get active/inactive
router.get("/licensedactiveex5/my", authenticateToken, getActiveEx5);
router.get("/licensedinactiveex5/my", authenticateToken, getInactiveEx5);

// Download EX5 by licenseId
router.get("/ex5/download/:licenseId", authenticateToken, downloadEx5ByLicense);

module.exports = router;
