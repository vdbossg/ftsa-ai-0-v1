const express = require("express");
const router = express.Router();
const { propTableTrades } = require("../controllers/propTradesController");

router.get("/proptabletrades", propTableTrades);

module.exports = router;
