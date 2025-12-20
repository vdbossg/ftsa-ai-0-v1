const Signal = require("../models/Signal.model");

// Fields that MUST be valid (never false)
const REQUIRED_FIELDS = [
  "symbol",
  "type",
  "mode",
  "choch",
  "entry",
  "sl",
  "tp",
  "timeframe"
];

// Helper: strict validity check
const isValidValue = (v) =>
  v !== false &&
  v !== "false" &&
  v !== 0 &&
  v !== null &&
  v !== undefined;

exports.getValidSignals = async () => {
  const signals = await Signal.find();

  const validSignals = [];
  const invalidIds = [];

  for (const s of signals) {
    // 1️⃣ Check mandatory fields
    const mandatoryOk = REQUIRED_FIELDS.every(f =>
      isValidValue(s[f])
    );

    // 2️⃣ Check support / resistance (at least ONE must be valid)
    const supportOk = isValidValue(s.support);
    const resistanceOk = isValidValue(s.resistance);

    if (!mandatoryOk || (!supportOk && !resistanceOk)) {
      // ❌ INVALID → mark for deletion
      invalidIds.push(s._id);
      continue;
    }

    // ✅ VALID
    validSignals.push({
      symbol: s.symbol,
      type: s.type,
      mode: s.mode,
      choch: s.choch,
      resistance: resistanceOk ? s.resistance : false,
      support: supportOk ? s.support : false,
      entry: s.entry,
      sl: s.sl,
      tp: s.tp,
      timeframe: s.timeframe
    });
  }

  // 3️⃣ HARD DELETE invalid signals
  if (invalidIds.length > 0) {
    await Signal.deleteMany({ _id: { $in: invalidIds } });
  }

  return validSignals;
};
