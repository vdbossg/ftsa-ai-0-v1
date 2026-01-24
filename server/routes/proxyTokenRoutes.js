const express = require("express");
const router = express.Router();
const proxyTokenController = require("../controllers/proxyTokenController");

// Get the latest token (no auth required)
router.get("/token/my", proxyTokenController.getMyToken);

module.exports = router;
