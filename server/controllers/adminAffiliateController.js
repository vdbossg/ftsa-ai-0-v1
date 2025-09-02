const Affiliate = require("../models/Affiliate");
const User = require("../models/User");
const { sendApprovalEmail, sendRejectionEmail } = require("../utils/emailService");

// Approve Affiliate
const approveAffiliate = async (req, res) => {
  try {
    const { affiliateId } = req.params;

    const affiliate = await Affiliate.findById(affiliateId).populate("user");
    if (!affiliate) return res.status(404).json({ message: "Affiliate not found" });

    affiliate.status = "active";
    await affiliate.save();

    await sendApprovalEmail(
      affiliate.email,
      affiliate.firstName || affiliate.user.username,
      affiliate.ticketNumber,
      process.env.DASHBOARD_URL
    );

    res.json({ message: "Affiliate approved successfully", affiliate });
  } catch (err) {
    console.error("Error approving affiliate:", err);
    res.status(500).json({ message: "Server error approving affiliate" });
  }
};

// Decline Affiliate
const declineAffiliate = async (req, res) => {
  try {
    const { affiliateId } = req.params;
    const { reason } = req.body;

    const affiliate = await Affiliate.findById(affiliateId).populate("user");
    if (!affiliate) return res.status(404).json({ message: "Affiliate not found" });

    affiliate.status = "declined";
    await affiliate.save();

    await sendRejectionEmail(
      affiliate.email,
      affiliate.firstName || affiliate.user.username,
      reason || "Incomplete or invalid information"
    );

    res.json({ message: "Affiliate declined successfully", affiliate });
  } catch (err) {
    console.error("Error declining affiliate:", err);
    res.status(500).json({ message: "Server error declining affiliate" });
  }
};

// Approve Withdrawal
const approveWithdrawal = async (req, res) => {
  try {
    const { affiliateId } = req.params;

    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) return res.status(404).json({ message: "Affiliate not found" });

    if (affiliate.pendingCommission <= 0) {
      return res.status(400).json({ message: "No pending withdrawal to approve" });
    }

    affiliate.paidCommission += affiliate.pendingCommission;
    affiliate.pendingCommission = 0;
    await affiliate.save();

    res.json({ message: "Withdrawal approved successfully", affiliate });
  } catch (err) {
    console.error("Error approving withdrawal:", err);
    res.status(500).json({ message: "Server error approving withdrawal" });
  }
};

module.exports = {
  approveAffiliate,
  declineAffiliate,
  approveWithdrawal,
};
