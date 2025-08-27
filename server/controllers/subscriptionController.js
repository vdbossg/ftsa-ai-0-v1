// backend/controllers/subscriptionController.js
import Subscription from "../models/Subscription.js";
import CFAAccount from "../services/cfaAccount.js";  // Your CFA service
import axios from "axios";

// OCB Bank API
const OCB_API = process.env.OCB_API || "http://ocb-bank:5000/api";

// ✅ Subscribe user to a plan
export const subscribe = async (req, res, next) => {
  try {
    const { userId, accountNumber, plan, paymentMethod, amount } = req.body;

    // 1. Save subscription locally
    const subscription = await Subscription.create({
      userId,
      accountNumber,
      plan,
      paymentMethod,
      amount,
      status: "active",
      expiryDate: plan === "basic" 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : plan === "plus"
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
        : null, // unlimited
    });

    // 2. Deposit into CFA account (local tracking)
    await CFAAccount.deposit(userId, amount, paymentMethod);

    // 3. Sync deposit into OCB Bank
    await axios.post(`${OCB_API}/transactions/sync`, {
      accountId: "CFA_ACCOUNT",
      type: "deposit",
      userId,
      amount,
      method: paymentMethod,
      source: "FTSA_AI_APP",
    });

    res.status(201).json({
      message: "Subscription successful & funds synced to OCB Bank",
      subscription,
    });
  } catch (error) {
    console.error("❌ Subscription Error:", error.message);
    next(error);
  }
};

// ✅ Get subscription status
export const getStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const subscription = await Subscription.findOne({ userId });

    if (!subscription) return res.status(404).json({ message: "No subscription found" });

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};
