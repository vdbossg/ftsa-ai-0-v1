const express = require("express");
const router = express.Router();
const { getMTAccount, connectMT, deleteMT } = require("../controllers/mtaccountController.js");

// Optional auth middleware
const authMiddleware = (req, res, next) => next();

// Routes fully synced with frontend
router.get("/", authMiddleware, getMTAccount);
router.post("/connect", authMiddleware, connectMT);
router.delete("/", authMiddleware, deleteMT);

module.exports = router;
