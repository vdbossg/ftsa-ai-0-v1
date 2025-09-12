const express = require("express");
const router = express.Router();
const SupportChannel = require("../models/SupportChannel");

// GET support channels / contact info
router.get("/", async (req, res) => {
  try {
    let channel = await SupportChannel.findOne();
    if (!channel) {
      // Create default if not exists
      channel = await SupportChannel.create({
        email: "support@ftsa-ai.com",
        phone: ["+254700000001", "+254700000002"],
        whatsapp: "+254712345678"
      });
    }
    res.json({ contactInfo: channel });
  } catch (err) {
    console.error("Failed to fetch support channels:", err);
    res.status(500).json({ message: "Failed to fetch support channels" });
  }
});

module.exports = router;
