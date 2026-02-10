const fs = require("fs");
const path = require("path");
const connectAdminDB = require("../config/adminDb");
const mongoose = require("mongoose");

// Cached Message model
let Message;

/* ===== LOAD MESSAGE MODEL (ADMIN DB) ===== */
const loadMessageModel = async () => {
  if (!Message) {
    const adminConn = await connectAdminDB();

    const messageSchema = new mongoose.Schema({
      user_id: { type: String, required: true },
      subject: String,
      body: String,
      priority: String,
      sent_by: String,
      status: { type: String, default: "new" }, // new | read
      created_at: { type: Date, default: Date.now },
    });

    Message = adminConn.model("Message", messageSchema, "messages");
  }
};

/* ===== CURRENT LOGGED-IN USER ===== */
const currentUserFile = path.join(__dirname, "currentWatcherUser.json");

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

/* ===== FETCH ALL MESSAGES (NO STATUS CHANGE) ===== */
const getMessagesForUser = async () => {
  await loadMessageModel();
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    return await Message
      .find({ user_id: userId })
      .sort({ created_at: -1 });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return [];
  }
};

/* ===== MARK A SINGLE MESSAGE AS READ ===== */
const markMessageAsRead = async (messageId) => {
  await loadMessageModel();
  const userId = getCurrentUserId();
  if (!userId || !messageId) return;

  try {
    await Message.updateOne(
      { _id: messageId, user_id: userId, status: "new" },
      { $set: { status: "read" } }
    );
  } catch (err) {
    console.error("Error marking message as read:", err);
  }
};

module.exports = {
  getCurrentUserId,
  getMessagesForUser,
  markMessageAsRead,
};
