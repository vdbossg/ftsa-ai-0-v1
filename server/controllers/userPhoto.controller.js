const { getUserPhoto, saveUserPhoto } = require("../services/userPhoto.service");

async function fetchPhoto(req, res) {
  try {
    const photo = await getUserPhoto(req.user.id);
    res.json({ success: true, data: photo ? { url: photo.url } : null });
  } catch (err) {
    console.error("Fetch photo error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch photo" });
  }
}

async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "User not authenticated" });
    }

    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    const photo = await saveUserPhoto(req.user.id, photoUrl);

    res.json({ success: true, data: { url: photo.url } });
  } catch (err) {
    console.error("Photo upload error:", err);
    res.status(500).json({ success: false, error: "Photo upload failed" });
  }
}

module.exports = { fetchPhoto, uploadPhoto };
