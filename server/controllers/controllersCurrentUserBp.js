// FTSA_AI_0.v1\server\controllers\controllersCurrentUserBp.js
const { getCurrentUserBp } = require("../services/servicesCurrentUserBp");

const currentUserBpController = async (req, res) => {
  try {
    const { userId } = req.params; // optional
    const user = await getCurrentUserBp(userId);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { currentUserBpController };