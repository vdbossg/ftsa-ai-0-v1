const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    plan: { type: String, enum: ["Basic", "Plus", "Unlimited"], required: true },
    mtLogin: { type: String, required: true },
    broker: { type: String, required: true },
    licenseKey: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    active: { type: Boolean, default: true, index: true },
    paystackReference: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("License", licenseSchema);
