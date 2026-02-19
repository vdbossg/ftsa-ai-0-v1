// controllers/finalTvSignalsController.js
const { getFinalSignals } = require("../services/tvFetcher");

exports.getFinalSignalsController = async (req, res) => {
  const signals = await getFinalSignals();
  res.status(200).json({
    message: "Filtered NEW + CHOCH signals",
    data: signals
  });
};
