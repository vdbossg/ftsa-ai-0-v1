const service = require("../services/servicesMymessageData");

/* ===== GET ALL MESSAGES FOR CURRENT USER ===== */
/* GET /api/messageData/userid */
const getMessages = async (req, res) => {
  try {
    const messages = await service.getMessagesForUser();
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

/* ===== MARK SINGLE MESSAGE AS READ ===== */
/* PATCH /api/messageData/read/:id */
const markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    await service.markMessageAsRead(id);
    res.json({ success: true });
  } catch (err) {
    console.error("Error marking message as read:", err);
    res.status(500).json({ message: "Error updating message status" });
  }
};

module.exports = {
  getMessages,
  markMessageRead,
};
