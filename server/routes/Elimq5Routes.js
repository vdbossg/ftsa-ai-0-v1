// server/routes/Elimq5Routes.js
const express = require("express");
const router = express.Router();
const Elimq5Controller = require("../controllers/Elimq5Controller");
const { authenticateToken } = require("../middleware/auth");

// Route to generate licensed EA
router.get("/generate", authenticateToken, Elimq5Controller.generateEA);

module.exports = router;
