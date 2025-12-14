// services/settingsService.js
const UserSettings = require("../models/UserSettings");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Get settings (create default if not exist)
const getSettings = async (userId) => {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await UserSettings.create({
      userId,
      profile: { email: "", firstName: "", middleName: "", sirName: "", phoneNumber: "", phoneCode: "+254", country: "" },
      security: { passwordHash: "", twoFactorEnabled: false },
      notifications: { messages: true, alerts: true },
    });
  }
  return settings;
};

// Update profile
const updateProfile = async (userId, profileData) => {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await getSettings(userId);
  }

  const updatedProfile = { ...settings.profile.toObject() };

  // Handle file upload path (assuming multer sets file.path)
  if (profileData.profitPhoto && profileData.profitPhoto.path) {
    updatedProfile.profitPhoto = profileData.profitPhoto.path;
  }

  // Copy other profile fields
  ["firstName", "middleName", "sirName", "email", "phoneNumber", "phoneCode", "country"].forEach((field) => {
    if (profileData[field] !== undefined) updatedProfile[field] = profileData[field];
  });

  // Ensure email exists
  if (!updatedProfile.email) throw new Error("Profile email is required");

  settings.profile = updatedProfile;
  await settings.save();

  return settings;
};

// Update security
const updateSecurity = async (userId, securityData) => {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await getSettings(userId);
  }

  const { oldPassword, newPassword, twoFactorEnabled } = securityData;
  const existingSecurity = settings.security?.toObject() || {};

  if (oldPassword && existingSecurity.passwordHash) {
    const match = await bcrypt.compare(oldPassword, existingSecurity.passwordHash);
    if (!match) throw new Error("Old password is incorrect");
  }

  if (newPassword) {
    existingSecurity.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  if (typeof twoFactorEnabled === "boolean") {
    existingSecurity.twoFactorEnabled = twoFactorEnabled;
  }

  settings.security = existingSecurity;
  await settings.save();

  return settings;
};

// Update notifications
const updateNotifications = async (userId, notificationsData) => {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await getSettings(userId);
  }

  settings.notifications = notificationsData || { messages: true, alerts: true };
  await settings.save();

  return settings;
};

module.exports = {
  getSettings,
  updateProfile,
  updateSecurity,
  updateNotifications,
};
