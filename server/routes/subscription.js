const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const { authenticateToken } = require("../middleware/auth");
const Subscription = require("../models/Subscription");
const License = require("../models/License");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const CFAAccount = require("../services/cfaAccount");

// Environment-configured MetaEditor paths
const METAEDITOR_MT4 = process.env.METAEDITOR_MT4_PATH || "C:/MetaTrader/MetaEditor.exe";
const METAEDITOR_MT5 = process.env.METAEDITOR_MT5_PATH || "C:/MetaTrader5/MetaEditor.exe";

// -----------------------------
// Helper functions
// -----------------------------
const generateLicenseKey = (userId, plan) => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return `${userId}_${plan}_${timestamp}`;
};

const calculateExpiry = (plan) => {
  const now = new Date();
  if (plan === "Basic") now.setDate(now.getDate() + 30);
  else if (plan === "Plus") now.setFullYear(now.getFullYear() + 1);
  else if (plan === "Unlimited") now.setFullYear(now.getFullYear() + 100);
  return now;
};

// -----------------------------
// Subscribe route (creates pending subscription)
// -----------------------------
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { plan, mtLogin, paymentMethod, amount } = req.body;
    const userId = req.user.id;

    // Create pending subscription
    const subscription = await Subscription.create({
      userId,
      plan,
      mtLogin,
      paymentMethod,
      amount,
      status: "pending", // ❌ Not active until webhook
    });

    // Track pending transaction
    await Transaction.create({
      accountId: "CFA_ACCOUNT",
      type: "deposit",
      userId,
      amount,
      method: paymentMethod,
      status: "pending",
      metadata: { plan },
    });

    res.json({
      success: true,
      message: "Subscription created. Pending payment confirmation via Selar.",
      subscriptionId: subscription._id,
    });
  } catch (err) {
    console.error("Subscription creation failed:", err);
    res.status(500).json({ success: false, error: "Subscription creation failed" });
  }
});

// -----------------------------
// EA Download Route
// -----------------------------
router.post("/download", authenticateToken, async (req, res) => {
  try {
    const { platform } = req.query;
    const userId = req.user.id;

    // Fetch active license
    const license = await License.findOne({
      userId,
      endDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    if (!license)
      return res.status(403).json({ success: false, error: "No active license" });

    const userEAPath = path.join(
      __dirname,
      `../../temp/${userId}_FTSA_EA.${platform === "mt4" ? "mq4" : "mq5"}`
    );

    // If EA already generated, serve it
    if (fs.existsSync(userEAPath)) {
      const outputFile = userEAPath.replace(
        /\.(mq4|mq5)$/,
        platform === "mt4" ? ".ex4" : ".ex5"
      );
      return res.download(outputFile, (err) => {
        if (err) console.error(err);
        fs.unlinkSync(userEAPath);
        fs.unlinkSync(outputFile);
      });
    }

    // Otherwise generate EA from template
    const templatePath = path.join(
      __dirname,
      "../../FTSA_AI_0/mql5/templates",
      `FTSA_EA_TEMPLATE.${platform === "mt4" ? "mq4" : "mq5"}`
    );
    if (!fs.existsSync(templatePath)) throw new Error("EA template not found");

    const templateCode = fs.readFileSync(templatePath, "utf8");
    const injectedCode = templateCode
      .replace(/{{LICENSE_KEY}}/g, license.licenseKey)
      .replace(/{{MT_LOGIN}}/g, license.mtLogin)
      .replace(/{{EXPIRY_DATE}}/g, new Date(license.endDate).toISOString());

    fs.writeFileSync(userEAPath, injectedCode, "utf8");

    // Compile EA
    const outputFile = userEAPath.replace(/\.(mq4|mq5)$/, platform === "mt4" ? ".ex4" : ".ex5");
    const metaEditorPath = platform === "mt4" ? METAEDITOR_MT4 : METAEDITOR_MT5;

    exec(
      `"${metaEditorPath}" /compile:"${userEAPath}" /log:"${userEAPath}.log"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`EA compilation failed: ${stderr}`);
          return res.status(500).json({ success: false, error: "EA compilation failed" });
        }

        res.download(outputFile, `FTSA_EA_${platform.toUpperCase()}.${platform === "mt4" ? "ex4" : "ex5"}`, (err) => {
          if (err) console.error(err);
          fs.unlinkSync(userEAPath);
          fs.unlinkSync(outputFile);
        });
      }
    );
  } catch (err) {
    console.error("EA download error:", err);
    res.status(500).json({ success: false, error: "EA download failed" });
  }
});

module.exports = router;
