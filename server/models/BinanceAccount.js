// server/models/BinanceAccount.js
const mongoose = require("mongoose");

const BinanceAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
  apiKeyEncrypted: { type: String, required: true },
  apiSecretEncrypted: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

BinanceAccountSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("BinanceAccount", BinanceAccountSchema);
