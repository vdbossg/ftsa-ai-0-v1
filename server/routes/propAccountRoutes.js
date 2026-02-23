// server/routes/propAccountRoutes.js
const express = require("express");
const router = express.Router();
const {
  getPropAccount,
  connectPropAccount,
  deletePropAccount,
} = require("../controllers/propAccountController.js");

const fs = require("fs");
const path = require("path");

const authMiddleware = (req, res, next) => {
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

// ✅ Routes for Prop MT5 accounts
router.get("/", authMiddleware, getPropAccount);
router.post("/", authMiddleware, connectPropAccount); // ✅ added to match frontend
router.post("/connect", authMiddleware, connectPropAccount); // keep old one (compatibility)
router.delete("/:login", authMiddleware, deletePropAccount);

module.exports = router;
