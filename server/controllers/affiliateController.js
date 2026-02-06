//FTSA_AI_0.v1\server\controllers\affiliateController.js
const Affiliate = require("../models/Affiliate");
const User = require("../models/User");
const WithdrawalRequest = require("../models/WithdrawalRequest");

const sendEmail = async (to, subject, text, html) => {
  console.log(`Email sent to ${to}: ${subject}`);
};


/**
 * GET /affiliate/:userId
 * Get affiliate data for logged-in user
 */
const getAffiliateData = async (req, res) => {
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

/**
 * POST /affiliate/register
 * Register new affiliate (multipart/form-data)
 */
const registerAffiliate = async (req, res) => {
  try {
    console.log("Req.body:", req.body);
    console.log("Req.files:", req.files);

    const userId = req.body.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const {
      firstName,
      middleName,
      lastName,
      phone,
      email,
      country,
      idType,
      idNumber,
      username,
    } = req.body;

    // check if affiliate already exists
    const existing = await Affiliate.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({ message: "Affiliate already exists" });
    }

    // check uploaded files
    const docFront = req.files?.docFront?.[0]?.path;
    const docBack = req.files?.docBack?.[0]?.path;
    if (!docFront || !docBack) {
      return res.status(400).json({ message: "Document images are required" });
    }

    // fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate ticket
    const count = await Affiliate.countDocuments();
    const ticketNumber = `#${String(count + 1).padStart(3, "0")}/${username}/${phone}/${email}`;

    const affiliate = await Affiliate.create({
      user: user._id,
      code: `${username.toUpperCase()}${count + 1}`,
      ticketNumber,
      firstName,
      middleName,
      lastName,
      username,
      phone,
      email,
      country,
      idType,
      idNumber,
      docFront,
      docBack,
      status: "pending",
      withdrawableBalance: 0,
      pendingCommission: 0,
      paidCommission: 0,
      totalCommission: 0,
      newSubscribersCount: 0,
      referredUsers: [],
    });

    console.log("Affiliate created:", affiliate._id);

    res.status(201).json({ success: true, data: affiliate });
  } catch (err) {
    console.error("Error registering affiliate:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};


/**
 * POST /cfa/request-withdrawal
 */
const requestWithdrawal = async (req, res) => {
  try {
    const { affiliateId, method, accountDetails } = req.body;

    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate not found" });
    }

    if (affiliate.withdrawableBalance <= 0) {
      return res.status(400).json({ message: "No funds available for withdrawal" });
    }

    const amount = affiliate.withdrawableBalance;

    // move funds
    affiliate.pendingCommission += amount;
    affiliate.withdrawableBalance = 0;
    affiliate.lastWithdrawalAt = new Date();
    await affiliate.save();

    const withdrawal = await WithdrawalRequest.create({
  affiliate: affiliate._id,
  amount,
  method,
  accountDetails,
  status: "pending"
});


    await sendEmail(
      affiliate.email,
      "Withdrawal Request Submitted",
      "",
      `<p>Dear ${affiliate.firstName || affiliate.email},</p>
       <p>Your withdrawal request of <strong>$${amount.toFixed(2)}</strong> has been submitted.</p>`
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

module.exports = {
  getAffiliateData,
  registerAffiliate,
  requestWithdrawal
};
