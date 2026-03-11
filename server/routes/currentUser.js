// server/routes/currentUser.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/current-user", (req, res) => {
  try {
    const filePath = path.join(
      __dirname,
      "../services/currentWatcherUser.json"
    );

    const raw = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(raw || "{}");

    res.json({
      success: true,
      userId: json.userId || null
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to read watcher user"
    });
  }
});

module.exports = router;