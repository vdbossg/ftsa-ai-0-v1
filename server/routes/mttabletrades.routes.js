const express = require("express");
const router = express.Router();
const MTController = require("../controllers/mttabletrades.controller");

router.get("/", MTController.fetchMTTableTrades);


module.exports = router;
