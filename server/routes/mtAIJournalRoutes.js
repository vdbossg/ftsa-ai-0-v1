const express = require("express");
const router = express.Router();
const { getMTJournalController } = require("../controllers/mtAIJournalController");

// GET /api/mtAIJournal
router.get("/", getMTJournalController);

module.exports = router;
