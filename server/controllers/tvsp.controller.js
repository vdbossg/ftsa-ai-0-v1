const signalService = require("../services/signal.service");

exports.receiveSignal = async (req, res) => {
  try {
    // Accept array or single signal
    const signals = Array.isArray(req.body) ? req.body : [req.body];
    const savedSignals = [];

    for (const s of signals) {
      // Save all signals exactly as received
      const saved = await signalService.save(s);

      // Push the saved signal exactly, keeping false/missing fields
      savedSignals.push({
        symbol: saved.symbol,
        type: saved.type,
        mode: saved.mode,
        choch: saved.choch,
        resistance: saved.resistance || false,
        support: saved.support || false, // <-- added support
        entry: saved.entry,
        sl: saved.sl,
        tp: saved.tp,
        timeframe: saved.timeframe
      });
    }

    // Return exactly what was saved
    res.json(savedSignals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSignals = async (req, res) => {
  const signals = await signalService.getAll();
  res.json(signals);
};
