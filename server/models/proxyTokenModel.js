const mongoose = require("mongoose");

const ProxyTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  email: { type: String, required: true },
  firstName: { type: String },
  token: { type: String, required: true }
}, { timestamps: true });

// Optional index for fast latest token queries
ProxyTokenSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("ProxyToken", ProxyTokenSchema);
