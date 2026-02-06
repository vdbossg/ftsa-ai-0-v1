const cfaAccount = require("../services/cfaAccount");
const User = require("../models/User");
const Affiliate = require("../models/Affiliate");

// ================= AFFILIATE ROUTES ================= //

// Deposit subscription payment (adds funds to CFA)
async function deposit(req, res) {
  try {
    const userId = req.user.id; // from JWT
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid deposit amount" });
    }

    // Record CFA transaction
    const transaction = await cfaAccount.deposit(userId, amount, paymentMethod);

    // Pay commission to referrer (if any)
    const user = await User.findById(userId).populate("referredBy");
    if (user?.referredBy) {
      const commission = amount * 0.1; // 10% commission
      await Affiliate.findByIdAndUpdate(user.referredBy, {
        $inc: { pendingCommission: commission }
      });
    }

    return res.json({ success: true, transaction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Request affiliate withdrawal (affiliate endpoint)
async function requestAffiliateWithdrawal(req, res) {
  try {
    const { affiliateId, method, accountDetails } = req.body;

    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      return res.status(404).json({ success: false, message: "Affiliate not found" });
    }

    if (affiliate.withdrawableBalance <= 0) {
      return res.status(400).json({ success: false, message: "No funds available for withdrawal" });
    }

    // Move funds to pending (waiting admin approval)
    const amount = affiliate.withdrawableBalance;
    affiliate.pendingCommission += amount;
    affiliate.withdrawableBalance = 0;
    affiliate.lastWithdrawalAt = new Date();
    await affiliate.save();

    // Reserve in CFA account
    const currentBalance = await cfaAccount.getBalance();
    if (amount > currentBalance) {
      return res.status(400).json({ success: false, message: "Insufficient CFA account balance" });
    }

    const reserveTx = await cfaAccount.reserveForAffiliate(affiliateId, amount);

    return res.json({
      success: true,
      message: "Withdrawal request submitted, pending admin approval",
      reserveTx,
      affiliate
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ================= ADMIN ROUTES ================= //

// Get CFA account balance
async function getBalance(req, res) {
  try {
    const balance = await cfaAccount.getBalance();
    return res.json({ success: true, balance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Release payout to affiliate (admin only)
async function releaseAffiliatePayout(req, res) {
  try {
    const { affiliateId, amount } = req.body;

    if (!affiliateId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payout request" });
    }

    const balance = await cfaAccount.getBalance();
    if (amount > balance) {
      return res.status(400).json({ success: false, message: "Insufficient CFA account balance" });
    }

    // Deduct from CFA and update affiliate balances
    const payoutTx = await cfaAccount.releaseAffiliatePayout(affiliateId, amount);
    await Affiliate.findByIdAndUpdate(affiliateId, {
      $inc: { pendingCommission: -amount, paidCommission: amount }
    });

    return res.json({ success: true, message: "Payout released successfully", payoutTx });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ✅ Export all functions properly
module.exports = {
  deposit,
  requestAffiliateWithdrawal,
  getBalance,
  releaseAffiliatePayout
};
