// server/routes/eaRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const eaController = require("../controllers/eaController");

// Generate EA
router.post("/generate", authenticateToken, eaController.generateEA);

// Download EA
router.get("/download/:filename", authenticateToken, (req, res) => {
  const fs = require("fs");
  const path = require("path");
  const TEMP_DIR = path.join(__dirname, "../../temp");
  const filePath = path.join(TEMP_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, error: "File not found" });

  res.download(filePath, req.params.filename, (err) => {
    if (err) console.error(err);
  });
});

module.exports = router;
