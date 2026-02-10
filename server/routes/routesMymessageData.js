const express = require("express");
const router = express.Router();
const controller = require("../controllers/controllersMymessageData");

// GET messages for current logged-in user
router.get("/messageData/userid", controller.getMessages);

module.exports = router;
