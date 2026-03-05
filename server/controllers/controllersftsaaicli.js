const FTSAcliService = require("../services/servicesftsaaicli");

exports.streamMT5Trades = async (req, res) => {

  try {

    const result = await FTSAcliService.updateLiveTrades(req.body);

    res.status(200).json({
      success: true,
      message: "MT5 live trades synced",
      updatedAt: result.updatedAt
    });

  } catch (error) {

    console.error("FTSA CLI stream error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

};

exports.getMT5Trades = async (req, res) => {

  try {

    const { userId } = req.query;

    const data = await FTSAcliService.getLiveTrades(userId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No MT5 data found"
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error("Fetch MT5 trades error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

};