const cfaAccount = require("../services/cfaAccount");

// ---- PUBLIC / AFFILIATE ROUTES ---- //

// Deposit from user subscription
exports.deposit = async (req, res) => {
  try {
    const { userId, amount, paymentMethod } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid deposit data" });
    }

    const transaction = await cfaAccount.deposit(userId, amount, paymentMethod);
    return res.json({ success: true, transaction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Request affiliate withdrawal
exports.requestAffiliateWithdrawal = async (req, res) => {
  try {
    const { affiliateId, amount, method } = req.body;

    if (!affiliateId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid withdrawal request" });
    }

    const currentBalance = await cfaAccount.getBalance();
    if (amount > currentBalance) {
      return res.status(400).json({ success: false, message: "Insufficient CFA account balance" });
    }

    const reserveTx = await cfaAccount.reserveForAffiliate(affiliateId, amount);
    return res.json({ success: true, message: "Withdrawal request submitted, pending admin approval", reserveTx });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---- ADMIN ROUTES ---- //

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

    const payoutTx = await cfaAccount.releaseAffiliatePayout(affiliateId, amount);
    return res.json({ success: true, message: "Payout released successfully", payoutTx });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
