//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\routes\propSettingRoutes.js
const express = require("express");
const router = express.Router();
const propSettingController = require("../controllers/propSettingController");

// POST - add new prop setting
router.post("/", propSettingController.addPropSetting);

// GET - all prop settings (auto-calculated)
router.get("/", propSettingController.getAllPropSettings);

// 🆕 DELETE - delete a prop setting by accountLogin or ID
router.delete("/:accountLogin", propSettingController.deletePropSetting);

module.exports = router;
