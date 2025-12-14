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
  // Fetch existing settings first
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await UserSettings.create({
      userId,
      profile: { email: "" },
      security: { passwordHash: "" },
    });
  }

  const { oldPassword, newPassword, twoFactorEnabled } = securityData;

  // Safe fallback for existing security document
  const existingSecurity = settings.security?.toObject() || {};

  // Verify old password only if oldPassword is provided
  if (oldPassword && existingSecurity.passwordHash) {
    const isMatch = await bcrypt.compare(oldPassword, existingSecurity.passwordHash);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }
  }

  const updateData = { ...existingSecurity };

  if (newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    updateData.passwordHash = hash;
  }

  if (typeof twoFactorEnabled === "boolean") {
    updateData.twoFactorEnabled = twoFactorEnabled;
  }

  // Update the security subdocument safely
  const updatedSettings = await UserSettings.findOneAndUpdate(
    { userId },
    { $set: { security: updateData } },
    { new: true, upsert: true }
  );

  return updatedSettings;
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
