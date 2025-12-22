const fs = require("fs");
const path = require("path");
const UserPhoto = require("../models/UserPhoto");

/**
 * Get user photo URL
 */
async function getUserPhoto(userId) {
  const photoDoc = await UserPhoto.findOne({ userId });
  if (!photoDoc) return null;
  return { url: photoDoc.url };
}

/**
 * Save or replace user photo
 */
async function saveUserPhoto(userId, photoUrl) {
  // 1️⃣ Check if user already has a photo
  const existingPhoto = await UserPhoto.findOne({ userId });

  if (existingPhoto) {
    // Delete old file from disk
    const oldFilePath = path.join(process.cwd(), existingPhoto.url);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
    // Update the existing document
    existingPhoto.url = photoUrl;
    await existingPhoto.save();
    return existingPhoto;
  }

  // 2️⃣ Otherwise, create new document
  const newPhoto = await UserPhoto.create({ userId, url: photoUrl });
  return newPhoto;
}

module.exports = { getUserPhoto, saveUserPhoto };
