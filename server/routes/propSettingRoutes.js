const express = require("express");
const router = express.Router();
const propSettingController = require("../controllers/propSettingController");

// POST - add new prop setting
router.post("/", propSettingController.addPropSetting);

// GET - all prop settings (auto-calculated)
router.get("/", propSettingController.getAllPropSettings);

module.exports = router;
