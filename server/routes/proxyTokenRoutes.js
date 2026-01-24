const express = require("express");
const router = express.Router();
const proxyTokenController = require("../controllers/proxyTokenController");
const authMiddleware = require("../middleware/authMiddleware"); // use your existing JWT auth middleware

// Get my latest token
router.get("/token/my", authMiddleware, proxyTokenController.getMyToken);

module.exports = router;
