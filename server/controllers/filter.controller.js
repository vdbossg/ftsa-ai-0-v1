const filterService = require("../services/filter.service");

exports.getFilteredSignals = async (req, res) => {
  try {
    // Get only valid signals
    const filtered = await filterService.getValidSignals();

    // Return exactly the array of valid signals
    res.json(filtered);
  } catch (err) {
    console.error("Filter module error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
