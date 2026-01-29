// server/routes/gatemanRoutes.js
const express = require("express");
const router = express.Router();
const { loginGateman, logoutGateman } = require("../controllers/gatemanController");

// Gateman generate JSON (POST)
router.post("/my", loginGateman);

// Optional: delete JSON on logout
router.post("/logout", logoutGateman);

module.exports = router;
