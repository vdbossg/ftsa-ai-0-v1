const express = require("express");
const router = express.Router();
const { getValidTrade } = require("../controllers/validTradeController");

router.get("/validtrade", getValidTrade);

module.exports = router;
