const fs = require("fs");
const path = require("path");
const connectAdminDB = require("../config/adminDb");
const mongoose = require("mongoose");

// Import Message model from admin DB
let Message;

// Load Message model from admin DB connection
const loadMessageModel = async () => {
  if (!Message) {
    const adminConn = await connectAdminDB();
    const messageSchema = new mongoose.Schema({
      user_id: { type: String, required: true },
      subject: String,
      body: String,
      priority: String,
      sent_by: String,
      status: { type: String, default: "new" },
      created_at: { type: Date, default: Date.now },
    });
    Message = adminConn.model("Message", messageSchema, "messages");
  }
};

// Path to the JSON file that tracks the logged-in user
const currentUserFile = path.join(__dirname, "currentWatcherUser.json");

// Get current logged-in user ID
const getCurrentUserId = () => {
  try {
    const data = fs.readFileSync(currentUserFile, "utf-8");
    const json = JSON.parse(data);
    return json.userId || null;
  } catch (err) {
    console.error("Error reading currentWatcherUser.json:", err);
    return null;
  }
};

// Fetch messages for logged-in user
const getMessagesForUser = async () => {
  await loadMessageModel();
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const messages = await Message.find({ user_id: userId }).sort({ created_at: -1 });
    return messages;
  } catch (err) {
    console.error("Error fetching messages from admin DB:", err);
    return [];
  }
};

// Mark user's new messages as read
const markMessagesAsRead = async () => {
  await loadMessageModel();
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    await Message.updateMany({ user_id: userId, status: "new" }, { $set: { status: "read" } });
  } catch (err) {
    console.error("Error updating message status:", err);
  }
};

module.exports = {
  getCurrentUserId,
  getMessagesForUser,
  markMessagesAsRead,
};
