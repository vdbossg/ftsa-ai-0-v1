// server/controllers/gatemanController.js
const { generateUserJson } = require("../services/gatemanService"); // ✅ fixed path

// Gateman login endpoint
async function loginGateman(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const jsonData = await generateUserJson(email);

    res.json({
      message: "Gateman JSON generated successfully",
      data: jsonData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { loginGateman };
