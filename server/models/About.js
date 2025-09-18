const mongoose = require("mongoose");

const OfficeSchema = new mongoose.Schema({
  address: String,
  city: String,
  country: String,
  contact: {
    phone: String,
    email: String,
    whatsapp: String,
    chat: String,
  },
});

const TeamSchema = new mongoose.Schema({
  name: String,
  role: String,
  photo: String,
});

const RoadmapSchema = new mongoose.Schema({
  item: String,
  eta: String,
});

const AboutSchema = new mongoose.Schema(
  {
    keyFeatures: [String],
    whyExist: String,
    poweredBy: String,
    offices: [OfficeSchema],
    team: [TeamSchema],
    roadmap: [RoadmapSchema],
    criticalNotices: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("About", AboutSchema);
