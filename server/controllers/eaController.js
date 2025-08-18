import path from "path";
import { generateEA } from "../services/eaGenerator.js";
import User from "../models/User.js";
import License from "../models/License.js";

export async function downloadEA(req, res) {
  try {
    const { platform } = req.query; // "mt4" or "mt5"
    const userId = req.user.id; // from auth middleware

    // 1️⃣ Check user subscription
    const user = await User.findById(userId).populate("subscription");
    if (!user || !user.subscription || !user.subscription.isActive) {
      return res.status(403).json({ error: "No active subscription" });
    }

    // 2️⃣ Get license + account number
    const license = await License.findOne({ userId });
    if (!license) {
      return res.status(404).json({ error: "License not found" });
    }

    // 3️⃣ Generate & compile EA file (async now)
    const filePath = await generateEA(
      userId,
      license.key,
      license.allowedAccount,
      platform
    );

    // 4️⃣ Send compiled file (.ex4 / .ex5)
    return res.download(filePath);
  } catch (err) {
    console.error("EA Download Error:", err);
    return res.status(500).json({ error: "Failed to download EA" });
  }
}
