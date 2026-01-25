// server/routes/Elimq5Routes.js
const express = require("express");
const router = express.Router();
const Elimq5Controller = require("../controllers/Elimq5Controller");
const Elimq5Service = require("../services/Elimq5Service");
// Existing POST route
router.post("/generate", Elimq5Controller.generateEA);

// ✅ Add GET route for testing


router.get("/generate", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ success: false, error: "userId is required" });

    // Call the service directly, not the controller
    const result = await Elimq5Service.injectLatestLicense(userId);

    res.json({ success: true, ...result });
  } catch (err) {
    console.error("EA generation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
