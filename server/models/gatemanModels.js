// server/models/gatemanModels.js
const mongoose = require("mongoose");
const Users = require("./User"); // ✅ exact filename

// Find the userId by email
async function findUserIdByEmail(email) {
  const user = await Users.findOne({ email });
  if (!user) return null;
  return user._id.toString(); // return as string
}

module.exports = { findUserIdByEmail };
