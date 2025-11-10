const express = require("express");
const router = express.Router();
const { fetchMTJournalController } = require("../controllers/mtAIJournalController");

// GET /api/mtAIJournal
router.get("/", fetchMTJournalController);

module.exports = router;
