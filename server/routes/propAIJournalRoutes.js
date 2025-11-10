// routes/propAIJournalRoute.js
const express = require("express");
const router = express.Router();
const { getPropAIJournal } = require("../controllers/propAIJournalController");

// GET /api/propAIJournal
router.get("/", getPropAIJournal);

module.exports = router;
