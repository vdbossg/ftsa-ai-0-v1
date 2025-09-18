const express = require("express");
const router = express.Router();
const About = require("../models/About");
const { body, validationResult } = require("express-validator");
const { verifyAdmin } = require("../middleware/auth"); // middleware to protect admin routes

// --------------------
// GET about data (for user app)
// --------------------
router.get("/", async (req, res) => {
  try {
    const about = await About.findOne();
    if (!about) {
      return res.json({
        criticalNotices: [],
        keyFeatures: [],
        whyExist: "",
        poweredBy: "",
        offices: [],
        team: [],
        roadmap: [],
      });
    }
    res.json(about);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// POST create about (admin only)
// --------------------
router.post(
  "/about",
  verifyAdmin,
  [
    body("criticalNotices").isArray().optional(),
    body("keyFeatures").isArray().optional(),
    body("whyExist").isString().optional(),
    body("poweredBy").isString().optional(),
    body("offices").isArray().optional(),
    body("team").isArray().optional(),
    body("roadmap").isArray().optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const about = new About(req.body);
      await about.save();
      res.status(201).json(about);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// --------------------
// PUT update about (admin only)
// --------------------
router.put(
  "/about/:id",
  verifyAdmin,
  [
    body("criticalNotices").isArray().optional(),
    body("keyFeatures").isArray().optional(),
    body("whyExist").isString().optional(),
    body("poweredBy").isString().optional(),
    body("offices").isArray().optional(),
    body("team").isArray().optional(),
    body("roadmap").isArray().optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const updated = await About.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: "About not found" });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// --------------------
// DELETE about (admin only)
// --------------------
router.delete("/about/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await About.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "About not found" });
    res.json({ message: "About page deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
