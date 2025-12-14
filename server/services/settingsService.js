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

const fs = require("fs");
const path = require("path");

const updateProfile = async (userId, profileData) => {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await UserSettings.create({ userId, profile: { email: "" }, security: { passwordHash: "" } });
  }

  const updatedProfile = { ...settings.profile.toObject() };

  // Check for uploaded file (profitPhoto)
  if (profileData.profitPhoto && profileData.profitPhoto.path) {
    // Save relative path in DB
    updatedProfile.profitPhoto = profileData.profitPhoto.path;
  }

  // Copy other fields
  ["firstName", "middleName", "sirName", "email", "phoneNumber", "phoneCode", "country"].forEach(field => {
    if (profileData[field] !== undefined) {
      updatedProfile[field] = profileData[field];
    }
  });

  settings.profile = updatedProfile;
  await settings.save();

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
