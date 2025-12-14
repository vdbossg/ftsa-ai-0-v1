// controllers/settingsController.js
const settingsService = require("../services/settingsService");
const multer = require("multer");
const path = require("path");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + Date.now() + ext;
    cb(null, name);
  },
});
const upload = multer({ storage });

// Middleware to handle single file upload for 'profitPhoto'
const uploadProfitPhoto = upload.single("profitPhoto");

// GET /settings
const getSettings = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const result = await settingsService.getUserProfile(token);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /settings/profile
const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    // FormData fields including optional file
    const formData = { ...req.body };
    if (req.file) formData.profitPhoto = req.file;

    const result = await settingsService.updateUserProfile(formData, token);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /settings/security
const updateSecurity = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Old and new passwords are required" });
    }

    const result = await settingsService.updateUserPassword({ oldPassword, newPassword }, token);
    res.json(result); // returns { success: true, data: {} } matching frontend
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// PUT /settings/notifications
const updateNotifications = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const result = await settingsService.updateNotifications(req.body, token);
    res.json(result); // returns { success: true, data: {...profile, notifications} }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getSettings,
  updateProfile,
  updateSecurity,
  updateNotifications,
  uploadProfitPhoto,
};
