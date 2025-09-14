import Affiliate from "../models/Affiliate.js";
import User from "../models/User.js";
import AffiliateWithdrawal from "../models/AffiliateWithdrawal.js";  // ✅ add this
import { sendEmail } from "../utils/emailService.js";               // ✅ add this

// ✅ Get affiliate data
export const getAffiliateData = async (req, res) => {
  try {
    const { userId } = req.params;
    const affiliate = await Affiliate.findOne({ user: userId }).populate("referredUsers");
    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }
    res.json(affiliate);
  } catch (err) {
    console.error("Error fetching affiliate data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Register new affiliate
export const registerAffiliate = async (req, res) => {
  try {
    const { userId, firstName, middleName, lastName, email, phone, country } = req.body;

    // check if already exists
    const existing = await Affiliate.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Affiliate already exists" });
    }

    // fetch linked user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate ticket number (unique identifier)
    const count = await Affiliate.countDocuments();
    const ticketNumber = `#${String(count + 1).padStart(3, "0")}/${user.username}/${phone}/${email}`;

    const newAffiliate = await Affiliate.create({
      user: user._id,
      code: user.username.toUpperCase() + (count + 1), // e.g. KELVIN1
      ticketNumber,
      firstName,
      middleName,
      lastName,
      phone,
      email,
      country,
      status: "pending",
      withdrawableBalance: 0,
      pendingCommission: 0,
      paidCommission: 0,
      totalCommission: 0,
      referredUsers: []
    });

    res.status(201).json(newAffiliate);
  } catch (err) {
    console.error("Error registering affiliate:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ✅ Request withdrawal
export const requestWithdrawal = async (req, res) => {
  try {
    const { userId } = req.body;
    const affiliate = await Affiliate.findOne({ user: userId });

    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    if (affiliate.withdrawableBalance <= 0) {
      return res.status(400).json({ message: "No funds available for withdrawal" });
    }

    // Move funds to pendingCommission (waiting for admin approval)
    affiliate.pendingCommission += affiliate.withdrawableBalance;
    affiliate.withdrawableBalance = 0;
    affiliate.lastWithdrawalAt = new Date();
    await affiliate.save();

// ✅ Create a withdrawal request record
const withdrawal = await AffiliateWithdrawal.create({
  affiliate: affiliate._id,
  amount: affiliate.pendingCommission, 
  status: "pending"
});

// ✅ Send email notification
await sendEmail(
  affiliate.email,
  "Withdrawal Request Submitted",
  "",
  `<p>Dear ${affiliate.firstName || affiliate.email},</p>
   <p>Your withdrawal request of <strong>${withdrawal.amount}</strong> has been submitted. Our team will review it shortly.</p>`
);

res.json({
  message: "Withdrawal request submitted. Awaiting admin approval.",
  affiliate,
  withdrawal
});

  } catch (err) {
    console.error("Error requesting withdrawal:", err);
    res.status(500).json({ message: "Withdrawal request failed" });
  }
};
