// CFA Account Service - Central FTSA-AI Account
// Handles all money flow between users, affiliates, and admin

const db = require("../models"); // assuming you have Sequelize or Mongoose

class CFAAccount {
  constructor() {
    // could be loaded from DB or environment
    this.accountId = "CFA_ACCOUNT";
  }

  // Record a deposit from user subscription
  async deposit(userId, amount, method) {
    // Save transaction in DB
    const transaction = await db.Transaction.create({
      accountId: this.accountId,
      type: "deposit",
      userId,
      amount,
      method,
      status: "completed",
    });
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
    return reserve;
  }

  // Release payout to affiliate
  async releaseAffiliatePayout(affiliateId, amount) {
    const payout = await db.Transaction.create({
      accountId: this.accountId,
      type: "payout",
      affiliateId,
      amount,
      status: "completed",
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
    return adminTx;
  }

  // Get CFA account balance
  async getBalance() {
    // sum deposits - sum payouts/reserves
    const deposits = await db.Transaction.sum("amount", { where: { accountId: this.accountId, type: "deposit" } });
    const reserved = await db.Transaction.sum("amount", { where: { accountId: this.accountId, type: "reserve" } });
    const payouts = await db.Transaction.sum("amount", { where: { accountId: this.accountId, type: "payout" } });
    const adminWithdrawals = await db.Transaction.sum("amount", { where: { accountId: this.accountId, type: "adminWithdraw" } });

    return (deposits || 0) - (reserved || 0) - (payouts || 0) - (adminWithdrawals || 0);
  }
}

module.exports = new CFAAccount();
