const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema({
  criticalNotices: { type: [String], default: [] },
  keyFeatures: { type: [String], default: [] },
  offices: { type: [Object], default: [] },
  team: {
  type: [
    {
      name: String,
      role: String,
      photo: String,
    }
  ],
  default: []
},

  roadmap: { type: [Object], default: [] },
  whyExist: { type: String, default: "" },
}, { collection: "aboutdatas" });

module.exports = mongoose.model("AboutAdmin", aboutSchema);
