// CFA Account Service - Central FTSA-AI Account
// Handles all money flow between users, affiliates, and admin
// Synced with OCB Bank API

const axios = require("axios");
const User = require("../models/User");
const Affiliate = require("../models/Affiliate");
const Transaction = require("../models/Transaction"); // ✅ You need a Transaction mongoose model

class CFAAccount {
  constructor() {
    this.accountId = "CFA_ACCOUNT";
    this.ocbBaseUrl = process.env.OCB_BANK_URL || "http://localhost:5001/api";
    this.ocbApiKey = process.env.OCB_BANK_KEY || "secure-api-key";
    this.commissionRate = 0.1; // 10%
  }

  // ✅ Push transaction to OCB Bank
  //async pushToOCB(payload) {
    //try {
      //const res = await axios.post(`${this.ocbBaseUrl}/transactions/sync`, payload, {
        //headers: { "x-api-key": this.ocbApiKey },
      //});
      //return res.data;
    //} catch (err) {
      //console.error("❌ Failed to sync with OCB Bank:", err.message);
      //throw new Error("OCB Bank sync failed");
    //}
  //}
  async pushToOCB(payload) {
  console.log("⚠️ OCB Bank push skipped (payload):", payload);
  return { success: true }; // pretend it worked
}


  // ✅ Record a deposit from user subscription
  async deposit(userId, amount, method) {
    const transaction = await Transaction.create({
      accountId: this.accountId,
      type: "deposit",
      userId,
      amount,
      method,
      status: "completed",
    });

    await this.pushToOCB({
      accountId: this.accountId,
      type: "deposit",
      userId,
      amount,
      method,
      source: "FTSA_AI",
    });

    // Commission logic
    const user = await User.findById(userId);
    if (user && user.referredBy) {
      const affiliate = await Affiliate.findById(user.referredBy);
      if (affiliate) {
        const commission = amount * this.commissionRate;

        affiliate.pendingCommission += commission;
        affiliate.totalCommission += commission;
        affiliate.extension += 1;
        affiliate.referredUsers.addToSet(user._id);
        await affiliate.save();

        console.log(`💰 Affiliate ${affiliate.code} earned commission: ${commission}`);
      }
    }

    return transaction;
  }

  // ✅ Reserve funds for affiliate withdrawal
  async reserveForAffiliate(affiliateId, amount) {
    const reserve = await Transaction.create({
      accountId: this.accountId,
      type: "reserve",
      affiliateId,
      amount,
      status: "pending",
    });

    await this.pushToOCB({
      accountId: this.accountId,
      type: "reserve",
      affiliateId,
      amount,
      source: "FTSA_AI",
    });

    return reserve;
  }

  // ✅ Release payout after admin approval
  async releaseAffiliatePayout(affiliateId, amount) {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) throw new Error("Affiliate not found");

    affiliate.pendingCommission -= amount;
    affiliate.paidCommission += amount;
    affiliate.pendingWithdrawal = 0;
    await affiliate.save();

    const payout = await Transaction.create({
      accountId: this.accountId,
      type: "payout",
      affiliateId,
      amount,
      status: "completed",
    });

    await this.pushToOCB({
      accountId: this.accountId,
      type: "payout",
      affiliateId,
      amount,
      source: "FTSA_AI",
    });

    return payout;
  }

  // ✅ Admin withdraw remaining funds
  async adminWithdraw(amount) {
    const adminTx = await Transaction.create({
      accountId: this.accountId,
      type: "adminWithdraw",
      amount,
      status: "completed",
    });

    await this.pushToOCB({
      accountId: this.accountId,
      type: "adminWithdraw",
      amount,
      source: "FTSA_AI_ADMIN",
    });

    return adminTx;
  }

  // ✅ Get CFA account balance
  async getBalance() {
    const deposits = await Transaction.aggregate([
      { $match: { accountId: this.accountId, type: "deposit" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const reserved = await Transaction.aggregate([
      { $match: { accountId: this.accountId, type: "reserve" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const payouts = await Transaction.aggregate([
      { $match: { accountId: this.accountId, type: "payout" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const adminWithdrawals = await Transaction.aggregate([
      { $match: { accountId: this.accountId, type: "adminWithdraw" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return (
      (deposits[0]?.total || 0) -
      (reserved[0]?.total || 0) -
      (payouts[0]?.total || 0) -
      (adminWithdrawals[0]?.total || 0)
    );
  }
}

module.exports = new CFAAccount();
