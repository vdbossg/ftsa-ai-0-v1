import Subscription from "../models/Subscription.js";
import CFAAccount from "../services/cfaAccount.js";  
import License from "../models/License.js";
import Affiliate from "../models/Affiliate.js";
import Transaction from "../models/Transaction.js";  // <-- ADD THIS

// ---------------- CREATE PENDING SUBSCRIPTION ----------------
export const subscribe = async (req, res, next) => {
  try {
    const { userId, plan, amount, mtLogin, broker } = req.body;

    // Save subscription as pending until webhook confirms payment
    const subscription = await Subscription.create({
      userId,
      plan,
      paymentMethod: "Selar",
      amount,
      status: "pending",  // ❌ will become "active" after payment
      expiryDate: null,   // set after webhook
      mtLogin,
      broker,
    });

    res.status(201).json({
      success: true,
      message: "Subscription created. Pending payment confirmation via Selar.",
      subscription,
    });
  } catch (error) {
    console.error("❌ Subscription Error:", error.message);
    next(error);
  }
};

// ---------------- GET SUBSCRIPTION STATUS ----------------
export const getStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Fetch the most recent subscription
    const subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });

    if (!subscription)
      return res.status(404).json({ success: false, message: "No subscription found" });

    // Active only if webhook confirmed
    const isActive = subscription.status === "active";

    res.json({ success: true, subscription, isActive });
  } catch (error) {
    console.error("❌ Get Status Error:", error.message);
    next(error);
  }
};

// ---------------- SELAR WEBHOOK TO ACTIVATE SUBSCRIPTION ----------------
export const selarWebhook = async (req, res, next) => {
  try {
    const { metadata, status } = req.body;

    if (status !== "paid") return res.status(200).send("Payment not completed, ignoring");

    const { userId, plan, mtLogin, broker, orderId } = metadata;

    // Find pending subscription
    const subscription = await Subscription.findOne({ userId, plan, status: "pending" });
    if (!subscription) return res.status(404).send("Pending subscription not found");

    // Calculate expiry
    let expiryDate = new Date();
    if (plan === "Basic") expiryDate.setDate(expiryDate.getDate() + 30);
    else if (plan === "Plus") expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    else if (plan === "Unlimited") expiryDate.setFullYear(expiryDate.getFullYear() + 100);

    // Update subscription to active
    subscription.status = "active";
    subscription.expiryDate = expiryDate;
    await subscription.save();

    // -------------------- ADD THIS --------------------
await Transaction.findOneAndUpdate(
  { userId, "metadata.plan": plan, status: "pending" },
  { status: "completed" }
);
// ---------------------------------------------------

    // Record deposit in CFAAccount after confirmed payment
    await CFAAccount.deposit(userId, subscription.amount, "Selar");

    // Generate License
    const licenseKey = `LIC_${userId}_${plan}_${new Date().toISOString().replace(/[-:.TZ]/g, "")}`;
    const license = await License.create({
      userId,
      plan,
      mtLogin,
      broker,
      licenseKey,
      startDate: new Date(),
      endDate: expiryDate,
      selarOrderId: orderId,
    });

    res.status(200).send("Subscription activated and license generated");
  } catch (error) {
    console.error("❌ Selar Webhook Error:", error.message);
    next(error);
  }
};
