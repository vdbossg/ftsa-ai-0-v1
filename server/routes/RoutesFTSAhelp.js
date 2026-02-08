// routes/RoutesFTSAhelp.js
const express = require("express");
const router = express.Router();

const FTSAController = require("../controllers/ControllersFTSAhelp");

/**
 * Support Ticket Routes
 */
router.post("/supportticket/Ftsa", FTSAController.createTicket);
router.get("/supportticket/Ftsaai", FTSAController.getTicketsForAI);

module.exports = router;
