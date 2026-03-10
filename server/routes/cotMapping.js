const express = require("express");
const router = express.Router();
const { getCOT } = require("../controllers/cotMapping");

router.get("/ftsacot/:pair", getCOT);

module.exports = router;