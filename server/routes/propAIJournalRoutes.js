// routes/propAIJournalRoute.js
const express = require("express");
const router = express.Router();
const { getPropAIJournal } = require("../controllers/propAIJournalController");

// only the relative path here
router.get("/", getPropAIJournal);

module.exports = router;
