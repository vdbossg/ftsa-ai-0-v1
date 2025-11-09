const express = require("express");
const router = express.Router();
const MTJournalController = require("../controllers/mtAIJournalController");

router.get("/", MTJournalController.getMTJournal);

module.exports = router;
