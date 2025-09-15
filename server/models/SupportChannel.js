const mongoose = require("mongoose");

// Define schema first without subOptions
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subOptions: [{ type: mongoose.Schema.Types.Mixed, default: [] }] // allows nested objects
});

// SupportChannel schema
const SupportChannelSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    phone: { type: [String], default: [] },
    whatsapp: { type: String, default: "" },
    categories: { type: [CategorySchema], default: [] } // nested categories
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportChannel", SupportChannelSchema);
