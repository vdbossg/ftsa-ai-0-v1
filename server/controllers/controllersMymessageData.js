const service = require("../services/servicesMymessageData");

// GET /api/messageData/userid
const getMessages = async (req, res) => {
  try {
    const messages = await service.getMessagesForUser();
    await service.markMessagesAsRead(); // mark as read after fetching
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

module.exports = { getMessages };
