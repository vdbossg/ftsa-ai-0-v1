const express = require("express");
const router = express.Router();
const { getMyProxyStatus } = require("../controllers/proxyController");

// Optional debugging endpoint
router.get("/myaccountid", getMyProxyStatus);

module.exports = router;
