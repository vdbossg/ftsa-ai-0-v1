const UserPhoto = require("../models/UserPhoto");

async function getUserPhoto(userId) {
  return await UserPhoto.findOne({ userId });
}

async function saveUserPhoto(userId, url) {
  return await UserPhoto.findOneAndUpdate(
    { userId },
    { url },
    { new: true, upsert: true }
  );
}

module.exports = {
  getUserPhoto,
  saveUserPhoto,
};
