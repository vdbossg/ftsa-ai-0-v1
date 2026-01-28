// server/models/ex5Linkermodel.js
const mongoose = require("mongoose");

const Ex5LinkSchema = new mongoose.Schema({
  licenseId: { type: mongoose.Schema.Types.ObjectId, ref: "License", required: true },
  userId: { type: String, required: true },
  mtLogin: { type: Number, required: true },

  licenseKey: { type: String, required: true },
  broker: { type: String },
  plan: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  linkedAt: { type: Date, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("LicenseEx5", Ex5LinkSchema);
