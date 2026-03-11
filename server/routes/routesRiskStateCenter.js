// FTSA_AI_0.v1/server/routes/routesRiskStateCenter.js

const express = require("express");
const router = express.Router();

const { riskStateController } = require("../controllers/controllersRiskStateCenter");

router.get("/brain/risk-state/:userId", riskStateController);

module.exports = router;