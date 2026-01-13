const mongoose = require("mongoose");

const licenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["Basic", "Plus", "Unlimited"], required: true },
    mtLogin: { type: String, required: true },
    broker: { type: String, required: true },
    licenseKey: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    active: { type: Boolean, default: true },
    paystackReference: { type: String }, // replaces selarOrderId
  },
  { timestamps: true }
);

module.exports = mongoose.model("License", licenseSchema);
