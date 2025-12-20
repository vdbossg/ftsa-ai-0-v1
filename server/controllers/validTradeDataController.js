const {
  buildValidTradeData
} = require("../services/validTradeDataService");

async function getValidTradeData(req, res) {
  try {
    const data = await buildValidTradeData();

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("ValidTradeData error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate valid trade data"
    });
  }
}

module.exports = { getValidTradeData };
