// controllers/settingsController.js
const settingsService = require("../services/settingsService");

// GET /settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user._id; // comes from auth middleware
    const settings = await settingsService.getSettings(userId);
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /settings/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = { ...req.body };

    // If a photo was uploaded, save its path
    if (req.file) {
      profileData.profitPhoto = `/uploads/${req.file.filename}`;
    }

    const updated = await settingsService.updateProfile(userId, profileData);
    res.json({ success: true, profile: updated.profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /settings/security
const updateSecurity = async (req, res) => {
  try {
    const userId = req.user._id;
    const updated = await settingsService.updateSecurity(userId, req.body);
    res.json({ success: true, security: updated.security });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /settings/notifications
const updateNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const updated = await settingsService.updateNotifications(userId, req.body);
    res.json({ success: true, notifications: updated.notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getSettings,
  updateProfile,
  updateSecurity,
  updateNotifications,
};
