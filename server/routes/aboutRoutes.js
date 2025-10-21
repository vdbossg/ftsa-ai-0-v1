//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\routes\aboutRoutes.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { verifyAdmin } = require("../middleware/auth");
const aboutService = require("../services/aboutService");

// Validation rules for POST & PUT
const aboutValidationRules = [
  body("criticalNotices").isArray().optional(),
  body("keyFeatures").isArray().optional(),
  body("whyExist").isString().optional(),
  body("poweredBy").isString().optional(),
  body("offices").isArray().optional(),
  body("team").isArray().optional(),
  body("roadmap").isArray().optional(),
];

// PUBLIC route for user app
router.get("/public", async (req, res) => {
  try {
    const about = await aboutService.getAbout();
    res.json(about);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN routes

// GET all about
router.get("/", async (req, res) => {
  try {
    const about = await aboutService.getAbout();
    res.json(about);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE about
router.post("/", verifyAdmin, aboutValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const about = await aboutService.createAbout(req.body);
    res.status(201).json(about);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE about
router.put("/:id", verifyAdmin, aboutValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const updated = await aboutService.updateAbout(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "About not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE about
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await aboutService.deleteAbout(req.params.id);
    if (!deleted) return res.status(404).json({ message: "About not found" });
    res.json({ message: "About page deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
