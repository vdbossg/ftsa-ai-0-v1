//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\controllers\propSettingController.js
const propSettingService = require("../services/propSettingService");

exports.getAllPropSettings = async (req, res) => {
  try {
    const data = await propSettingService.getAllPropSettings();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.addPropSetting = async (req, res) => {
  try {
    const newSetting = await propSettingService.addPropSetting(req.body);
    res.status(201).json({ success: true, data: newSetting });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};
exports.deletePropSetting = async (req, res) => {
  try {
    const { accountLogin } = req.params;

    const deletedSetting = await propSettingService.deletePropSetting(accountLogin);

    if (!deletedSetting) {
      return res.status(404).json({ success: false, message: "Prop setting not found" });
    }

    res.json({ success: true, message: "Prop setting deleted successfully" });
  } catch (err) {
    console.error("❌ deletePropSetting error:", err);
    res.status(500).json({ success: false, message: "Server error deleting prop setting" });
  }
};
