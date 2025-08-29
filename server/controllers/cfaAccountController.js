// server/controllers/cfaAccountController.js
const cfaAccount = require("../services/cfaAccount");
const User = require("../models/User");
const Affiliate = require("../models/Affiliate"); // assuming you already have this

// ================= PUBLIC / AFFILIATE ROUTES ================= //

// Deposit from subscription (user pays, CFA balance increases)
exports.deposit = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from JWT
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid deposit amount" });
    }

    // Record CFA transaction
    const transaction = await cfaAccount.deposit(userId, amount, paymentMethod);

    // ✅ Affiliate commission logic
    const user = await User.findById(userId).populate("referredBy");
    if (user?.referredBy) {
      const commission = amount * 0.1; // e.g. 10%
      await Affiliate.findByIdAndUpdate(user.referredBy, {
        $inc: { pendingCommission: commission }
      });
    }

    return res.json({ success: true, transaction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Request affiliate withdrawal
exports.requestAffiliateWithdrawal = async (req, res) => {
  try {
    const { affiliateId, amount, method, accountDetails } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid withdrawal amount" });
    }

    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate || affiliate.availableBalance < amount) {
  return res.status(400).json({ success: false, message: "Insufficient balance" });
}

affiliate.availableBalance -= amount;
await affiliate.save();

const currentBalance = await cfaAccount.getBalance();
    if (amount > currentBalance) {
      return res.status(400).json({ success: false, message: "Insufficient CFA account balance" });
    }

    const reserveTx = await cfaAccount.reserveForAffiliate(affiliateId, amount);
    return res.json({
      success: true,
      message: "Withdrawal request submitted, pending admin approval",
      reserveTx
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ADMIN ROUTES ================= //

// Get current CFA account balance
exports.getBalance = async (req, res) => {
  try {
    const balance = await cfaAccount.getBalance();
    return res.json({ success: true, balance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Release payout to affiliate (admin only)
exports.releaseAffiliatePayout = async (req, res) => {
  try {
    const { affiliateId, amount } = req.body;

    if (!affiliateId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payout request" });
    }

    const balance = await cfaAccount.getBalance();
    if (amount > balance) {
      return res.status(400).json({ success: false, message: "Insufficient CFA account balance" });
    }

    // Deduct from CFA + update affiliate
    const payoutTx = await cfaAccount.releaseAffiliatePayout(affiliateId, amount);
    await Affiliate.findByIdAndUpdate(affiliateId, {
      $inc: { pendingCommission: -amount, paidCommission: amount }
    });

    return res.json({ success: true, message: "Payout released successfully", payoutTx });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
