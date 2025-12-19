const Signal = require("../models/Signal.model");

// Fields that must be valid
const REQUIRED_FIELDS = [
  "symbol",
  "type",
  "mode",
  "choch",
  "entry",
  "sl",
  "tp"
  // Removed resistance from REQUIRED_FIELDS to allow support-only signals
];

exports.getValidSignals = async () => {
  const signals = await Signal.find();

  // Filter valid signals: either resistance or support can exist
  const validSignals = signals.filter(s => {
    const hasSupportOrResistance = s.resistance || s.support; // at least one
    const otherFieldsValid = REQUIRED_FIELDS.every(f => {
      const value = s[f];
      // Ignore if false, "false", 0, null, or undefined
      return value !== false && value !== "false" && value !== 0 && value !== null && value !== undefined;
    });
    return hasSupportOrResistance && otherFieldsValid;
  });

  // Delete invalid signals in bulk
  const invalidIds = signals
    .filter(s => !validSignals.includes(s))
    .map(s => s._id);

  if (invalidIds.length > 0) {
    await Signal.deleteMany({ _id: { $in: invalidIds } });
  }

  // Map to clean output
  return validSignals.map(s => ({
    symbol: s.symbol,
    type: s.type,
    mode: s.mode,
    choch: s.choch,
    resistance: s.resistance || false,
    support: s.support || false,
    entry: s.entry,
    sl: s.sl,
    tp: s.tp,
    timeframe: s.timeframe
  }));
};
