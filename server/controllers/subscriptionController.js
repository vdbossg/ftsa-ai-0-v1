// backend/controllers/subscriptionController.js
import Subscription from "../models/Subscription.js";
import CFAAccount from "../services/cfaAccount.js";  // CFA service
import axios from "axios";
import Affiliate from "../models/Affiliate.js";

// OCB Bank API
const OCB_API = process.env.OCB_API || "http://ocb-bank:5000/api";

export const subscribe = async (req, res, next) => {
  try {
    const { userId, plan, paymentMethod, amount, mtLogin, broker } = req.body;

    // 1️⃣ Determine expiry date based on plan
    let expiryDate;
    if (plan === "Basic") expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    else if (plan === "Plus") expiryDate = new Date(Date.now() + 360 * 24 * 60 * 60 * 1000);
    else if (plan === "Unlimited") expiryDate = new Date(Date.now() + 36500 * 24 * 60 * 60 * 1000);

    // 2️⃣ Save subscription locally
    const subscription = await Subscription.create({
      userId,
      plan,
      paymentMethod,
      amount,
      status: "active",
      expiryDate,
      mtLogin,
      broker,
    });

    // 3️⃣ Deposit into CFA account (local tracking)
    await CFAAccount.deposit(userId, amount, paymentMethod);

    // 4️⃣ Sync deposit to OCB Bank
    await axios.post(`${OCB_API}/transactions/sync`, {
      accountId: "CFA_ACCOUNT",
      type: "deposit",
      userId,
      amount,
      method: paymentMethod,
      source: "FTSA_AI_APP",
    });

    // 5️⃣ Handle affiliate commission
    const affiliate = await Affiliate.findOne({ referredUsers: userId });
    if (affiliate) {
      let commission = 0;
      if (plan === "Basic") commission = 5;
      else if (plan === "Plus") commission = 15;
      else if (plan === "Unlimited") commission = 30;

      affiliate.totalCommission += commission;
      affiliate.pendingCommission += commission;
      affiliate.newSubscribersCount = (affiliate.newSubscribersCount || 0) + 1;

      await affiliate.save();
    }

    res.status(201).json({
      success: true,
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

    if (!subscription) return res.status(404).json({ success: false, message: "No subscription found" });

    res.json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
};
