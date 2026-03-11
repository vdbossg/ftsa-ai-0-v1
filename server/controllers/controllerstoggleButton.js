const toggleService = require("../services/servicestoggleButton");

exports.toggleRiskState = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId; // from auth middleware if exists
    const { status } = req.body;

    const updated = await toggleService.toggleRSC(userId, status);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Toggle RSC failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};