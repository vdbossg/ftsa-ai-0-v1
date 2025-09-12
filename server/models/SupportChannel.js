const mongoose = require("mongoose");

const SupportChannelSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: [String], default: [] },
  whatsapp: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("SupportChannel", SupportChannelSchema);
