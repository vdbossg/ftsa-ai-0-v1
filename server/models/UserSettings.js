const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  profitPhoto: { type: String, default: "" },
  firstName: { type: String, default: "" },
  middleName: { type: String, default: "" },
  sirName: { type: String, default: "" },
  email: { type: String, required: true }, // removed unique
  phoneNumber: { type: String, default: "" },
  phoneCode: { type: String, default: "+254" },
  country: { type: String, default: "" },
});

const SecuritySchema = new mongoose.Schema({
  passwordHash: { type: String, default: "" }, // optional for OAuth users
  twoFactorEnabled: { type: Boolean, default: false },
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
