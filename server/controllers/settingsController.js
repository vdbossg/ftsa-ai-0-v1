// controllers/settingsController.js
const settingsService = require("../services/settingsService");

// GET /settings/:userId
const getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings(req.params.userId);
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /settings/profile/:userId
const updateProfile = async (req, res) => {
  try {
    const profileData = { ...req.body };

    // If a photo was uploaded, save its path
    if (req.file) {
      profileData.profitPhoto = `/uploads/${req.file.filename}`;
    }

    const updated = await settingsService.updateProfile(req.params.userId, profileData);
    res.json({ success: true, profile: updated.profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// PUT /settings/security/:userId
const updateSecurity = async (req, res) => {
  try {
    const updated = await settingsService.updateSecurity(req.params.userId, req.body);
    res.json({ success: true, security: updated.security });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /settings/notifications/:userId
const updateNotifications = async (req, res) => {
  try {
    const updated = await settingsService.updateNotifications(req.params.userId, req.body);
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
