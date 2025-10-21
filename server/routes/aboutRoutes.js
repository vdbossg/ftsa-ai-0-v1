//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\routes\aboutRoutes.js
const express = require("express");
const router = express.Router();
const About = require("../models/About");
const { body, validationResult } = require("express-validator");
const { verifyAdmin } = require("../middleware/auth");


// Public route for user app
router.get("/public", async (req, res) => {
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
// GET about data
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

// POST create about (admin)
router.post(
  "/",
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

// PUT update about (admin)
router.put(
  "/:id",
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

// DELETE about (admin)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await About.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "About not found" });
    res.json({ message: "About page deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
