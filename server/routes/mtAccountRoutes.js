const express = require("express");
const router = express.Router();
const {
  getMTAccount,
  connectMT,
  deleteMT,
} = require("../controllers/mtaccountController.js");

// Auth middleware to ensure a user is logged in
const authMiddleware = (req, res, next) => {
  const fs = require("fs");
  const path = require("path");
  const watcherPath = path.join(__dirname, "../services/currentWatcherUser.json");

  try {
    const data = fs.readFileSync(watcherPath, "utf8");
    const json = JSON.parse(data);
    if (!json.userId) {
      return res.status(401).json({ success: false, message: "No user logged in" });
    }
    next();
  } catch (err) {
    console.error("Failed to read currentWatcherUser.json:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ Use controller functions directly
router.get("/", authMiddleware, getMTAccount);
router.post("/connect", authMiddleware, connectMT);
router.delete("/:login", authMiddleware, deleteMT);


module.exports = router;
