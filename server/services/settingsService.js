const UserSettings = require("../models/UserSettings");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

/**
 * Ensure user settings exist
 */
const ensureUserSettings = async (userId) => {
  let settings = await UserSettings.findOne({ userId });
  if (!settings) {
    settings = await UserSettings.create({
      userId,
      profile: {
        firstName: "",
        middleName: "",
        email: "",
        phone: "",
        profitPhoto: "",
      },
      security: {
        passwordHash: "",
      },
      notifications: {
        messages: true,
        alerts: true,
      },
    });
  }
  return settings;
};

/**
 * Get user profile + notifications
 */
const getUserProfile = async (userId) => {
  const settings = await ensureUserSettings(userId);

  return {
    success: true,
    data: {
      ...settings.profile.toObject(),
      notifications: settings.notifications,
    },
  };
};

/**
 * Update user profile (signup-matching fields)
 * Supports optional profile photo upload
 */
const updateUserProfile = async (userId, profileData) => {
  const settings = await ensureUserSettings(userId);

  const allowedFields = ["firstName", "middleName", "email", "phone"];
  allowedFields.forEach((field) => {
    if (profileData[field] !== undefined) {
      settings.profile[field] = profileData[field];
    }
  });

  // Handle profile photo upload
  if (profileData.profitPhoto) {
    // Delete old photo if exists
    if (settings.profile.profitPhoto) {
      const oldPath = path.join(
        __dirname,
        "..",
        settings.profile.profitPhoto
      );
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    settings.profile.profitPhoto = `/uploads/${profileData.profitPhoto.filename}`;
  }

  await settings.save();

  return {
    success: true,
    data: {
      ...settings.profile.toObject(),
      notifications: settings.notifications,
    },
  };
};

/**
 * Update user password
 */
const updateUserPassword = async (userId, { oldPassword, newPassword }) => {
  const settings = await ensureUserSettings(userId);

  const currentHash = settings.security.passwordHash || "";
  const isMatch = await bcrypt.compare(oldPassword, currentHash);
  if (!isMatch) throw new Error("Old password is incorrect");

  settings.security.passwordHash = await bcrypt.hash(newPassword, 10);
  await settings.save();

  return { success: true, data: {} };
};

/**
 * Update notifications
 */
const updateNotifications = async (userId, notificationsData) => {
  const settings = await ensureUserSettings(userId);

  settings.notifications = {
    ...settings.notifications.toObject(),
    ...notificationsData,
  };

  await settings.save();

  return {
    success: true,
    data: {
      ...settings.profile.toObject(),
      notifications: settings.notifications,
    },
  };
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  updateNotifications,
};
