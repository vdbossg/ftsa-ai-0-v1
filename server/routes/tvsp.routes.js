const express = require("express")
const router = express.Router()
const tvspController = require("../controllers/tvsp.controller")

router.post("/tvspSignal", tvspController.receiveSignal)
router.get("/tvspSignal", tvspController.getSignals)

module.exports = router
