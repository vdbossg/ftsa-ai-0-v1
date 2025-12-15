const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const licenseController = require("../controllers/licenseController");

// Selar webhook route (public)
router.post("/webhook/selar", express.json(), licenseController.selarWebhook);

// Authenticated route to fetch the currently active license for the logged-in user
router.get("/my", authenticateToken, licenseController.getUserLicense);

// NEW: Fetch **all active licenses** for a specific user (frontend expects this)
router.get("/user/:userId", authenticateToken, async (req, res) => {
  const License = require("../models/License");
  try {
    const licenses = await License.find({
      userId: req.params.userId,
      endDate: { $gte: new Date() }, // only active licenses
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: licenses });
  } catch (err) {
    console.error("Failed to fetch user licenses:", err);
    res.status(500).json({ success: false, error: "Failed to fetch licenses" });
  }
});

module.exports = router;
