// FTSA_AI_0.v1\server\routes\routesCurrentUserBp.js
const express = require("express");
const router = express.Router();
const { currentUserBpController } = require("../controllers/controllersCurrentUserBp");

// 1️⃣ GET current logged-in user
router.get("/CurrentUserBp", currentUserBpController);

// 2️⃣ GET any user by ID
router.get("/CurrentUserBp/:userId", currentUserBpController);

module.exports = router;