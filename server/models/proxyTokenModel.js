const mongoose = require("mongoose");

const ProxyTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  email: { type: String, required: true },
  firstName: { type: String },
  token: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("ProxyToken", ProxyTokenSchema);
