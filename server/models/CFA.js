const mongoose = require("mongoose");

const CFASchema = new mongoose.Schema(
  {
    centralAccountId: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CFA", CFASchema);
