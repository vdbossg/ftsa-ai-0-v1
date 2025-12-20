const express = require("express");
const router = express.Router();

const {
  getValidTradeData
} = require("../controllers/validTradeDataController");

router.get("/validtradedata", getValidTradeData);

module.exports = router;
