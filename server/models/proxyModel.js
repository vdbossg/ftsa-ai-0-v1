const mongoose = require("mongoose");

const proxySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    lastLicenseKey: { type: String, default: "" },
    lastMtLogin: { type: String, default: "" },
    lastBroker: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proxy", proxySchema);
