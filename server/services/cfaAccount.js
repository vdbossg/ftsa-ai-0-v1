// CFA Account Service - Central FTSA-AI Account
// Handles all money flow between users, affiliates, and admin
// Now extended to sync with OCB Bank API and Affiliate commissions

const db = require("../models"); // Sequelize or Mongoose
const axios = require("axios");  // For calling OCB Bank backend API
const User = require("../models/User");
const Affiliate = require("../models/Affiliate");

class CFAAccount {
  constructor() {
    // could be loaded from DB or environment
    this.accountId = "CFA_ACCOUNT";
    this.ocbBaseUrl = process.env.OCB_BANK_URL || "http://localhost:5001/api"; 
    this.ocbApiKey = process.env.OCB_BANK_KEY || "secure-api-key"; 

    // Commission rate (10% for example)
    this.commissionRate = 0.1;
  }

  // helper: push transaction to OCB Bank
  async pushToOCB(payload) {
    try {
      const res = await axios.post(`${this.ocbBaseUrl}/transactions/sync`, payload, {
        headers: { "x-api-key": this.ocbApiKey }
      });
      return res.data;
    } catch (err) {
      console.error("❌ Failed to sync with OCB Bank:", err.message);
      throw new Error("OCB Bank sync failed");
    }
  }

  // Record a deposit from user subscription
  async deposit(userId, amount, method) {
    const transaction = await db.Transaction.create({
      accountId: this.accountId,
      type: "deposit",
      userId,
      amount,
      method,
      status: "completed",
    });

    // Mirror into OCB Bank
    await this.pushToOCB({
      accountId: this.accountId,
      type: "deposit",
      userId,
      amount,
      method,
      source: "FTSA_AI",
    });

    // ✅ Check if user is referred by an affiliate
    const user = await User.findById(userId);
    if (user && user.referredBy) {
      const affiliate = await Affiliate.findById(user.referredBy);
      if (affiliate) {
        const commission = amount * this.commissionRate;

        affiliate.pendingCommission += commission;
        affiliate.totalCommission += commission;
        affiliate.referredUsers.addToSet(user._id); // avoid duplicates
        await affiliate.save();

        console.log(`💰 Affiliate ${affiliate.code} earned commission: ${commission}`);
      }
    }

    return transaction;
  }

  // Reserve funds for affiliate withdrawal
  async reserveForAffiliate(affiliateId, amount) {
    const reserve = await db.Transaction.create({
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

  // Release payout to affiliate
  async releaseAffiliatePayout(affiliateId, amount) {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) throw new Error("Affiliate not found");

    // Adjust balances
    affiliate.pendingCommission -= amount;
    affiliate.paidCommission += amount;
    affiliate.pendingWithdrawal = 0;
    await affiliate.save();

    const payout = await db.Transaction.create({
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

  // Admin withdraw remaining funds
  async adminWithdraw(amount) {
    const adminTx = await db.Transaction.create({
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

  // Get CFA account balance
  async getBalance() {
    const deposits = await db.Transaction.sum("amount", { where: { accountId: this.accountId, type: "deposit" } });
    const reserved = await db.Transaction.sum("amount", { where: { accountId: this.accountId, type: "reserve" } });
    const payouts = await db.Transaction.sum("amount", { where: { accountId: this.accountId, type: "payout" } });
    const adminWithdrawals = await db.Transaction.sum("amount", { where: { accountId: this.accountId, type: "adminWithdraw" } });

    return (deposits || 0) - (reserved || 0) - (payouts || 0) - (adminWithdrawals || 0);
  }
}

module.exports = new CFAAccount();
