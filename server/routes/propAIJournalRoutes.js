const express = require("express");
const router = express.Router();
const Controller = require("./Controller");

// GET /api/propaijournal
router.get("/", Controller.getPropJournal);

module.exports = router;
