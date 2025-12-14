const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  firstName: { type: String, default: "" },
  middleName: { type: String, default: "" },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  profitPhoto: { type: String, default: "" },
});

const SecuritySchema = new mongoose.Schema({
  passwordHash: { type: String, default: "" },
});

const NotificationsSchema = new mongoose.Schema({
  messages: { type: Boolean, default: true },
  alerts: { type: Boolean, default: true },
});

const UserSettingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    profile: ProfileSchema,
    security: SecuritySchema,
    notifications: NotificationsSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSettings", UserSettingsSchema);
