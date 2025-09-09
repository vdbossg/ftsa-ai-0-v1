const express = require('express');
const router = express.Router();

let autoTradeStatus = "OFF"; // Global state for demo

router.post('/', (req, res) => {
  const { start } = req.body;
  autoTradeStatus = start ? "ON" : "OFF";
  res.json({ status: autoTradeStatus });
});

module.exports = router;
