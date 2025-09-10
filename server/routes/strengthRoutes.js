// server/routes/strengthRoutes.js
const express = require("express");
const router = express.Router();
const { updateBrainData } = require("../services/brainService");

// GET /api/brain/strength
router.get("/", async (req, res) => {
  try {
    const brainData = await updateBrainData();

    console.log("📊 BrainData (marketStrength):", brainData?.marketStrength?.length, "pairs");

    if (brainData && brainData.marketStrength && brainData.marketStrength.length > 0) {
      return res.json({
        success: true,
        data: brainData.marketStrength,
      });
    } else {
      console.warn("⚠️ Market strength unavailable or empty");
      return res.status(500).json({
        success: false,
        error: "Market strength unavailable",
      });
    }
  } catch (err) {
    console.error("❌ Error fetching market strength:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

module.exports = router;
