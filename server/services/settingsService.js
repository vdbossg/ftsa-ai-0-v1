// services/settingsService.js
const UserSettings = require("../models/UserSettings");
const bcrypt = require("bcrypt");

const getSettings = async (userId) => {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    // Create default settings if not exist
    settings = await UserSettings.create({
      userId,
      profile: { email: "", firstName: "", middleName: "", sirName: "", phoneNumber: "", phoneCode: "+254", country: "" },
      security: { passwordHash: "", twoFactorEnabled: false },
      notifications: { messages: true, alerts: true },
    });
  }
  return settings;
};

const updateProfile = async (userId, profileData) => {
  let settings = await UserSettings.findOne({ userId });

  if (!settings) {
    settings = await getSettings(userId); // ensures defaults exist
  }

  const updatedProfile = { ...settings.profile }; // remove .toObject()

  // Update fields from profileData
  ["profitPhoto", "firstName", "middleName", "sirName", "email", "phoneNumber", "phoneCode", "country"].forEach(field => {
    if (profileData[field] !== undefined) {
      updatedProfile[field] = profileData[field];
    }
  });

  settings.profile = updatedProfile;
  await settings.save();
  return settings;
};

const updateSecurity = async (userId, securityData) => {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await getSettings(userId);
  }

  const { oldPassword, newPassword, twoFactorEnabled } = securityData;
  const existingSecurity = { ...(settings.security || {}) }; // remove .toObject() and fallback safely

  // Verify old password only if provided
  if (oldPassword && existingSecurity.passwordHash) {
    const isMatch = await bcrypt.compare(oldPassword, existingSecurity.passwordHash);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }
  }

  const updateData = { ...existingSecurity };

  if (newPassword) {
    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  if (typeof twoFactorEnabled === "boolean") {
    updateData.twoFactorEnabled = twoFactorEnabled;
  }

  // Merge existing profile to avoid validation errors
  const profileCopy = { ...settings.profile }; // remove .toObject()

  const updatedSettings = await UserSettings.findOneAndUpdate(
    { userId },
    { profile: profileCopy, security: updateData },
    { new: true, upsert: true }
  );

  return updatedSettings;
};

const updateNotifications = async (userId, notificationsData) => {
  const updatedSettings = await UserSettings.findOneAndUpdate(
    { userId },
    { notifications: notificationsData },
    { new: true, upsert: true } // ensure document exists
  );

  return updatedSettings;
};

module.exports = {
  getSettings,
  updateProfile,
  updateSecurity,
  updateNotifications,
};
