const express = require("express");
const router = express.Router();
const SupportChannel = require("../models/SupportChannel");

// GET support channels / contact info and categories
router.get("/", async (req, res) => {
  try {
    let channel = await SupportChannel.findOne();
    if (!channel) {
      // Create default if not exists
      channel = await SupportChannel.create({
        email: "support@ftsa-ai.org",
        phone: [ "+254118194945"],
        whatsapp: "+254118194945",
        categories: [
          {
            name: "Subscriptions",
            subOptions: [
              {
                name: "EA",
                subOptions: [
                  {
                    name: "Active",
                    subOptions: [
                      {
                        name: "Plan",
                        subOptions: [
                          { name: "Basic" },
                          { name: "Plus" },
                          { name: "Unlimited" },
                          { name: "Downloading" },
                          { name: "Payment" }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });
    }

    res.json({
      contactInfo: {
        email: channel.email,
        phone: channel.phone,
        whatsapp: channel.whatsapp
      },
      categories: channel.categories || []
    });
  } catch (err) {
    console.error("Failed to fetch support channels:", err);
    res.status(500).json({ message: "Failed to fetch support channels" });
  }
});

// POST / update categories or contact info
router.post("/", async (req, res) => {
  try {
    const { email, phone, whatsapp, categories } = req.body;
    let channel = await SupportChannel.findOne();

    if (!channel) {
      channel = new SupportChannel({ email, phone, whatsapp, categories });
    } else {
      if (email) channel.email = email;
      if (phone) channel.phone = phone;
      if (whatsapp) channel.whatsapp = whatsapp;
      if (categories) channel.categories = categories;
    }

    await channel.save();
    res.json({ message: "Support info updated successfully", channel });
  } catch (err) {
    console.error("Failed to update support info:", err);
    res.status(500).json({ message: "Failed to update support info" });
  }
});

module.exports = router;
