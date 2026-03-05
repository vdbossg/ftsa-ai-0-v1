const express = require("express");
const router = express.Router();

const {
  streamMT5Trades,
  getMT5Trades
} = require("../controllers/controllersftsaaicli");

/*
POST
CLI → Backend live stream
*/
router.post("/ftsaaicli/mt5trades", streamMT5Trades);

/*
GET
Frontend → Fetch live state
*/
router.get("/ftsaaicli/mt5trades", getMT5Trades);

module.exports = router;