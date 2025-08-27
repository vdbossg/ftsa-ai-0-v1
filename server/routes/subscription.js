// server/routes/subscription.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { verifyPaymentCFA } = require("../services/cfaPayment"); 
const { authenticateToken } = require("../middleware/auth");

const Payment = require("../models/Payment");
const User = require("../models/User"); // assuming you already have a User model

// Helper to generate unique license
const generateLicenseKey = (userId, plan) => {
  const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
  return `${userId}_${plan}_${timestamp}`;
};

// Helper to calculate expiry
const calculateExpiry = (plan) => {
  const now = new Date();
  if (plan === "Basic") now.setMonth(now.getMonth() + 1);
  else if (plan === "Plus") now.setFullYear(now.getFullYear() + 1);
  else if (plan === "Unlimited") now.setFullYear(now.getFullYear() + 100); 
  return now;
};

// ===================== SUBSCRIBE =====================
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { plan, mtLogin, paymentMethod, amount } = req.body;
    const userId = req.user.id;

    // Check fixed amounts
    const fixedAmounts = { Basic: 25, Plus: 130, Unlimited: 499 };
    if (amount !== fixedAmounts[plan]) {
      return res.status(400).json({ success: false, error: "Invalid payment amount" });
    }

    // Verify payment via CFA
    const paymentVerified = await verifyPaymentCFA(userId, amount, paymentMethod);
    if (!paymentVerified) {
      return res.status(400).json({ success: false, error: "Payment not verified by CFA" });
    }

    // Generate license & expiry
    const licenseKey = generateLicenseKey(userId, plan);
    const expiryDate = calculateExpiry(plan);

    // Save Payment record
    const payment = new Payment({
      userId,
      amount,
      method: paymentMethod,
      status: "completed",
      plan,
      transactionId: `${userId}_${Date.now()}`
    });
    await payment.save();

    // Save subscription info to user (instead of memory)
    await User.findByIdAndUpdate(userId, {
      subscription: { plan, mtLogin, licenseKey, expiryDate }
    });

    res.json({ success: true, nextBillingDate: expiryDate, licenseKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Subscription failed" });
  }
});

// ===================== EA DOWNLOAD =====================
router.post("/download", authenticateToken, async (req, res) => {
  try {
    const { platform } = req.query;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || !user.subscription) {
      return res.status(403).json({ success: false, error: "No active subscription" });
    }

    const { licenseKey, mtLogin, expiryDate } = user.subscription;

    // Check expiry
    if (new Date(expiryDate) < new Date()) {
      return res.status(403).json({ success: false, error: "Subscription expired" });
    }

    // EA template path
    const templatePath = path.join(
      __dirname,
      "../../FTSA_AI_0/mql5/templates",
      `FTSA_EA_TEMPLATE.${platform === "mt4" ? "mq4" : "mq5"}`
    );
    if (!fs.existsSync(templatePath)) throw new Error("EA template not found");

    // Inject MT login & license
    const templateCode = fs.readFileSync(templatePath, "utf8");
    const injectedCode = templateCode
      .replace(/{{LICENSE_KEY}}/g, licenseKey)
      .replace(/{{MT_LOGIN}}/g, mtLogin)
      .replace(/{{EXPIRY_DATE}}/g, new Date(expiryDate).toISOString());

    const userEAPath = path.join(
      __dirname,
      `../../temp/${userId}_FTSA_EA.${platform === "mt4" ? "mq4" : "mq5"}`
    );
    fs.writeFileSync(userEAPath, injectedCode, "utf8");

    // Compile to EX4/EX5
    const outputFile = userEAPath.replace(
      /\.(mq4|mq5)$/,
      platform === "mt4" ? ".ex4" : ".ex5"
    );
    const metaEditorPath =
      platform === "mt4"
        ? "/path/to/metaeditor_mt4.exe"
        : "/path/to/metaeditor_mt5.exe";

    exec(
      `"${metaEditorPath}" /compile:"${userEAPath}" /log:"${userEAPath}.log"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Compile error: ${stderr}`);
          return res
            .status(500)
            .json({ success: false, error: "EA compilation failed" });
        }

        res.download(
          outputFile,
          `FTSA_EA_${platform.toUpperCase()}.${
            platform === "mt4" ? "ex4" : "ex5"
          }`,
          (err) => {
            if (err) console.error(err);
            fs.unlinkSync(userEAPath);
            fs.unlinkSync(outputFile);
          }
        );
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "EA download failed" });
  }
});

module.exports = router;
