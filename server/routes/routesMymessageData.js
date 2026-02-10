const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllersMymessageData");

/* ===== FETCH ALL MESSAGES (NO STATUS CHANGE) ===== */
/* GET /api/messageData/userid */
router.get("/messageData/userid", controller.getMessages);

/* ===== MARK SINGLE MESSAGE AS READ ===== */
/* PATCH /api/messageData/read/:id */
router.patch("/messageData/read/:id", controller.markMessageRead);

module.exports = router;
