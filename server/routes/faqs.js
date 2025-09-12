const express = require("express");
const router = express.Router();
const FAQ = require("../models/FAQ");

// GET all FAQs
router.get("/", async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.json(faqs);
  } catch (err) {
    console.error("Failed to fetch FAQs:", err);
    res.status(500).json({ message: "Failed to fetch FAQs" });
  }
});

// Optional: GET single FAQ by ID
router.get("/:id", async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json(faq);
  } catch (err) {
    console.error("Failed to fetch FAQ:", err);
    res.status(500).json({ message: "Failed to fetch FAQ" });
  }
});

module.exports = router;
