const settingsService = require("../services/settingsService");

// GET /settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const settings = await settingsService.getSettings(userId);
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /settings/profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = { ...req.body };

    // Handle uploaded file
    if (req.file) {
      profileData.profitPhoto = `/uploads/${req.file.filename}`;
    }

    const updatedSettings = await settingsService.updateProfile(userId, profileData);
    res.json({ success: true, data: updatedSettings });
  } catch (err) {
    res.status(err.message.includes("required") ? 400 : 500).json({
      success: false,
      error: err.message,
    });
  }
};

// PUT /settings/security
const updateSecurity = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedSettings = await settingsService.updateSecurity(userId, req.body);
    res.json({ success: true, data: updatedSettings });
  } catch (err) {
    res.status(err.message.includes("incorrect") ? 400 : 500).json({
      success: false,
      error: err.message,
    });
  }
};

// PUT /settings/notifications
const updateNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedSettings = await settingsService.updateNotifications(userId, req.body);
    res.json({ success: true, data: updatedSettings });
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
