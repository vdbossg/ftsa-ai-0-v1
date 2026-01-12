//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\routes\tvsp.routes.js
const express = require("express")
const router = express.Router()
const tvspController = require("../controllers/tvsp.controller")

router.post("/tvspSignal", tvspController.receiveSignal)
router.get("/tvspSignal", tvspController.getSignals)

module.exports = router
