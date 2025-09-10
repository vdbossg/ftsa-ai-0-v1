// server/services/chochService.js
const mongoose = require('mongoose');

// -------------------- MongoDB Schema --------------------
const ltfChochSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  side: { type: String, enum: ['BUY', 'SELL'], default: null },
  valid: { type: Boolean, default: false },
  magnitudePct: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const LTFChoch = mongoose.model('LTFChoch', ltfChochSchema);

// -------------------- Connect MongoDB --------------------
async function connectMongo(uri) {
  if (!uri) throw new Error("MongoDB URI required for CHoCH service");
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("✅ MongoDB connected for CHoCH service");
}

// -------------------- Store Lower Timeframe CHoCH --------------------
async function storeLTF(symbol, side, valid, magnitudePct = 0) {
  if (!symbol) throw new Error("Symbol required to store LTF CHoCH");

  const now = new Date();
  const update = { side, valid, magnitudePct, updatedAt: now };
  const opts = { upsert: true, new: true, setDefaultsOnInsert: true };

  const doc = await LTFChoch.findOneAndUpdate({ symbol }, update, opts);
  console.log(`📦 LTF CHoCH stored: ${symbol} - ${side} - valid=${valid} - mag=${magnitudePct}`);
  return doc;
}

// -------------------- Retrieve Lower Timeframe CHoCH --------------------
async function getLTF(symbol) {
  const doc = await LTFChoch.findOne({ symbol });
  if (!doc) return { side: null, valid: false, magnitudePct: 0 };
  return { side: doc.side, valid: doc.valid, magnitudePct: doc.magnitudePct, updatedAt: doc.updatedAt };
}

// -------------------- Retrieve all CHoCH --------------------
async function getAll() {
  const docs = await LTFChoch.find({});
  return docs.map(d => ({
    symbol: d.symbol,
    side: d.side,
    valid: d.valid,
    magnitudePct: d.magnitudePct,
    updatedAt: d.updatedAt
  }));
}

// -------------------- Check valid trade signal --------------------
async function isValidTradeSignal(symbol, expectedSide) {
  const ltf = await getLTF(symbol);
  return ltf.valid && ltf.side === expectedSide;
}

// -------------------- Exports --------------------
module.exports = {
  connectMongo,
  storeLTF,
  getLTF,
  getAll,
  isValidTradeSignal
};
