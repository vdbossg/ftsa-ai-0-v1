const express = require("express");
const router = express.Router();
const Controller = require("./Controller");

// GET /api/mtaijournal
router.get("/", Controller.getMTJournal);

module.exports = router;
