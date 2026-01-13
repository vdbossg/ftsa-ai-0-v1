// server/routes/license.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const licenseController = require("../controllers/licenseController");
const { handlePaystackWebhook, getUserLicense } = require("../services/licenseService");

// ---------------------- Paystack Webhook Route ----------------------
// Public route, Paystack calls this when a payment event occurs
router.post("/webhook/paystack", express.json(), async (req, res) => {
  try {
    await handlePaystackWebhook(req);
    res.sendStatus(200); // acknowledge Paystack
  } catch (err) {
    console.error("Paystack webhook error:", err);
    res.sendStatus(400);
  }
});

// ---------------------- Fetch Current User License ----------------------
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const license = await getUserLicense(req.user.id);
    res.json({ success: true, data: license });
  } catch (err) {
    console.error("Failed to fetch user license:", err);
    res.status(500).json({ success: false, error: "Failed to fetch license" });
  }
});

// ---------------------- Fetch All Active Licenses for Specific User ----------------------
router.get("/user/:userId", authenticateToken, async (req, res) => {
  const License = require("../models/License");
  try {
    const licenses = await License.find({
  userId: req.params.userId,
  $or: [
    { endDate: { $gte: new Date() } },
    { endDate: null },
  ],
}).sort({ createdAt: -1 });


    res.json({ success: true, data: licenses });
  } catch (err) {
    console.error("Failed to fetch user licenses:", err);
    res.status(500).json({ success: false, error: "Failed to fetch licenses" });
  }
});

module.exports = router;
