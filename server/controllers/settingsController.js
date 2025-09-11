// server/controllers/settingsController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET settings for logged-in user
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    res.json({
      success: true,
      profile: {
        firstName: user.firstName,
        middleName: user.middleName,
        sirName: user.sirName,
        profitPhoto: user.profitPhoto,
        country: user.country,
        phoneNumber: user.phone,
        phoneCode: user.phoneCode,
        email: user.email,
      },
      security: {
        twoFactorEnabled: user.twoFactorEnabled,
      },
      notifications: user.notifications,
      theme: user.theme,
      tradingSettings: user.tradingSettings,
      subscription: user.subscription,
      language: user.language || "ENGLISH",
    });
  } catch (err) {
    console.error("❌ Error fetching settings:", err);
    res.status(500).json({ success: false, msg: "Server error fetching settings" });
  }
};

// SAVE settings for logged-in user
exports.saveSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    const { profile, security, notifications, theme, tradingSettings, language } = req.body;

    // PROFILE
    if (profile) {
      user.firstName = profile.firstName ?? user.firstName;
      user.middleName = profile.middleName ?? user.middleName;
      user.sirName = profile.sirName ?? user.sirName;
      user.profitPhoto = profile.profitPhoto ?? user.profitPhoto;
      user.country = profile.country ?? user.country;
      user.phone = profile.phoneNumber ?? user.phone;
      user.phoneCode = profile.phoneCode ?? user.phoneCode;
      user.email = profile.email ?? user.email;
    }

    // SECURITY
   // SECURITY
if (security) {
  if (security.twoFactorEnabled !== undefined) user.twoFactorEnabled = security.twoFactorEnabled;

  // Password change logic
  if (security.newPassword) {
    if (!security.oldPassword) {
      return res.status(400).json({ success: false, msg: "Old password is required to set a new password" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(security.oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Old password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(security.newPassword, salt);
  }
    }

    // NOTIFICATIONS
    if (notifications) user.notifications = { ...user.notifications, ...notifications };

    // THEME
    if (theme) user.theme = { ...user.theme, ...theme };

    // TRADING SETTINGS
    if (tradingSettings) user.tradingSettings = { ...user.tradingSettings, ...tradingSettings };

    // LANGUAGE
    if (language) user.language = language;

    await user.save();
    res.json({ success: true, msg: "Settings saved successfully" });
  } catch (err) {
    console.error("❌ Error saving settings:", err);
    res.status(500).json({ success: false, msg: "Server error saving settings" });
  }
};
