// server/routes/ex5LinkerRoutes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { getActiveEx5, getInactiveEx5 } = require("../controllers/ex5LinkerController");

router.get("/licensedactiveex5/my", authenticateToken, getActiveEx5);
router.get("/licensedinactiveex5/my", authenticateToken, getInactiveEx5);

module.exports = router;
