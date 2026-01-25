const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { handlePaystackWebhook, getUserLatestLicense } = require("../services/licenseService");

// ---------------------- Paystack Webhook Route ----------------------
router.post("/webhook/paystack", express.json(), async (req, res) => {
  try {
    await handlePaystackWebhook(req);
    res.sendStatus(200); // acknowledge Paystack
  } catch (err) {
    console.error("Paystack webhook error:", err);
    res.sendStatus(400);
  }
});

// ---------------------- Fetch Current User License Automatically ----------------------
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // guaranteed by authenticateToken
    if (!userId) return res.status(401).json({ success: false, error: "Not logged in" });

    const license = await getUserLatestLicense(userId);

    res.json({ success: true, data: license || null });
  } catch (err) {
    console.error("Failed to fetch user license:", err);
    res.status(500).json({ success: false, error: "Failed to fetch license" });
  }
});

module.exports = router;
