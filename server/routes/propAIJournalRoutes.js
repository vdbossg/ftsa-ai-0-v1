// routes/propAIJournalRoute.js
const express = require("express");
const router = express.Router();
const { getPropAIJournal } = require("../controllers/propAIJournalController");

router.get("/api/propaijournal", getPropAIJournal);

module.exports = router;
