const express = require("express");
const router = express.Router();
const PropJournalController = require("../controllers/propAIJournalController");

router.get("/", PropJournalController.getPropJournal);

module.exports = router;
