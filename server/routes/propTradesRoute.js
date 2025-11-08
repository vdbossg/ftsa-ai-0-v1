const express = require("express");
const router = express.Router();
const { getPropTableTrades } = require("../controllers/propTradesController");

router.get("/", async (req, res) => {
  try {
    const result = await getPropTableTrades();
    res.json(result);
  } catch (error) {
    console.error("Error fetching Prop Table Trades:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
