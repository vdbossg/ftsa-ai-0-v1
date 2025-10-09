const express = require("express");
const router = express.Router();
const {
  getMT4Account,
  connectMT4,
  deleteMT4,
} = require("../controllers/mt4accountController.js");

// Optional authentication middleware
const authMiddleware = (req, res, next) => next();

// ✅ Use MT4 controller functions
router.get("/", authMiddleware, getMT4Account);
router.post("/connect", authMiddleware, connectMT4);
// Use query param instead of optional path param
router.delete("/", authMiddleware, deleteMT4); // /api/mt4accounts?login=12345


module.exports = router;
