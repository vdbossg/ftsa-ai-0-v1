const mongoose = require("mongoose");

const FTSAHelpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Login problem",
        "Create account problem",
        "Affiliate problem",
        "Withdraw problem",
        "Payment problem",
        "Other"
      ]
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ["new", "in_progress", "resolved", "closed"],
      default: "new"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("FTSAHelp", FTSAHelpSchema);
