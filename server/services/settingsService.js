// services/settingsService.js
const UserSettings = require("../models/UserSettings");
const bcrypt = require("bcrypt");

const getSettings = async (userId) => {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    // Create default if not exist
    settings = await UserSettings.create({ userId, profile: { email: "" }, security: { passwordHash: "" } });
  }
  return settings;
};

const updateProfile = async (userId, profileData) => {
  const settings = await UserSettings.findOneAndUpdate(
    { userId },
    { profile: profileData },
    { new: true, upsert: true }
  );
  return settings;
};

const updateSecurity = async (userId, securityData) => {
  const updateData = {};
  if (securityData.newPassword) {
    const hash = await bcrypt.hash(securityData.newPassword, 10);
    updateData.passwordHash = hash;
  }
  if (typeof securityData.twoFactorEnabled === "boolean") {
    updateData.twoFactorEnabled = securityData.twoFactorEnabled;
  }

  const settings = await UserSettings.findOneAndUpdate(
    { userId },
    { security: updateData },
    { new: true }
  );
  return settings;
};

const updateNotifications = async (userId, notificationsData) => {
  const settings = await UserSettings.findOneAndUpdate(
    { userId },
    { notifications: notificationsData },
    { new: true }
  );
  return settings;
};

module.exports = {
  getSettings,
  updateProfile,
  updateSecurity,
  updateNotifications,
};
