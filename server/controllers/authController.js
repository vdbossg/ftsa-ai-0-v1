// server/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ProxyTokenService = require("../services/proxyTokenService");
const { setWatcherUserId } = require("../services/watcherSessionService");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; // use your env secret

// ---------------------- Login Controller ----------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, error: "Invalid credentials" });

    // 2️⃣ Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ success: false, error: "Invalid credentials" });
    
// ✅ Bind this machine's EX5 watcher to the logged-in user
setWatcherUserId(user._id);

    
    // 3️⃣ Generate JWT token
const payload = {
  id: user._id,
  email: user.email,
  role: user.role || "user",
};
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); // token valid 7 days

// 4️⃣ Save token to ProxyToken collection
let savedToken;
try {
  savedToken = await ProxyTokenService.saveOrUpdateToken(user, token);
  console.log("✅ Token successfully saved:", savedToken.token);
} catch (err) {
  console.error("❌ Failed to save token:", err);
  return res.status(500).json({ success: false, error: "Failed to save token" });
}


// 6️⃣ Send token and user info to frontend
res.json({
  success: true,
  token,
  user: {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    role: user.role || "user",
  },
  updatedAt: savedToken.updatedAt, // shows when token was saved
  userId: savedToken.userId,
});

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
