//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\routes\fcsRoutes.js
const express = require("express");
const router = express.Router();
const { getSignal, sendSignal } = require("../controllers/fcsController");

router.get("/latestSignal", getSignal);
router.post("/sendSignal", sendSignal);

module.exports = router;
