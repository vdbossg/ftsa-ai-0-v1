// src/pages/AffiliatesPage.jsx
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";

import "../styles/AffiliatesPage.css"; // you will create styling per your neon theme & orbitron font

const AffiliatesPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [affiliateData, setAffiliateData] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("paypal");
  const [accountDetails, setAccountDetails] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Redirect if not authenticated (pseudo code, integrate your routing logic)
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  // ✅ Fix 1: define fetchAffiliateData once
  const fetchAffiliateData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/affiliate/${user.id}`
      );
      setAffiliateData(res.data);
    } catch (err) {
      console.error("Failed to fetch affiliate data", err);
      alert("Failed to load affiliate data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAffiliateData();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) fetchAffiliateData();
    }, 30000); // every 30s
    return () => clearInterval(interval);
  }, [user]);

  const handleAffiliateRegister = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = {
      fullName: form[0].value,
      username: form[1].value,
      email: form[2].value,
      password: form[3].value,
      confirmPassword: form[4].value,
      country: form[5].value,
      phone: form[6].value,
    };

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/affiliate/register`,
        formData
      );
      setAffiliateData(res.data);
      alert("Affiliate registration successful!");
    } catch (err) {
      console.error("Affiliate registration failed", err);
      alert(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateData.referralLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();

    if (!withdrawAmount || withdrawAmount <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    try {
      setLoading(true);
      // ✅ Fix 2: use affiliateData._id and include accountDetails
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/cfa/request-withdrawal`,
        {
          affiliateId: affiliateData._id,
          amount: withdrawAmount,
          method: withdrawMethod,
          accountDetails,
        }
      );

      alert(res.data.message || "Withdrawal request submitted successfully.");

      const updated = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/affiliate/${user.id}`
      );
      setAffiliateData(updated.data);

      setWithdrawAmount("");
      setAccountDetails("");
    } catch (err) {
      console.error("Withdrawal failed", err);
      alert(
        err.response?.data?.message || "Withdrawal failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!affiliateData)
    return (
      <div className="error-message neon-red">
        Failed to load affiliate data.
      </div>
    );

  return (
    <div
      className="affiliates-page"
      style={{
        backgroundColor: "#000000",
        color: "#00FFFF",
        fontFamily: "Orbitron, sans-serif",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <header className="appbar">
        <h1>FTSA AI</h1>
      </header>

      <h2>Welcome to FTSA AI Affiliates</h2>
      <p>
        Join <br />
        • Lifetime commissions <br />
        • High payouts <br />
        • Track your Performance <br />
        • Instant withdraw when balance available
      </p>

      {!affiliateData?.isRegistered && (
        <section className="affiliate-registration neon-glow-border">
          <h3>Affiliate Registration</h3>
          <form onSubmit={handleAffiliateRegister}>
            <input type="text" placeholder="Full Name" required />
            <input type="text" placeholder="Username" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <input type="password" placeholder="Confirm Password" required />
            <input type="text" placeholder="Country" required />
            <input
              type="tel"
              placeholder="Phone Number (+123)(7********)"
              required
            />
            <label>
              <input type="checkbox" required /> I agree to the Affiliates Terms
              & Conditions
            </label>
            <NeonButton type="submit">Register</NeonButton>
          </form>
        </section>
      )}

      <section
        className="affiliates-dashboard neon-glow-border"
        style={{ marginTop: "2rem" }}
      >
        <h3>Your Affiliate Dashboard</h3>
        <div>Total commission: ${affiliateData.totalCommission.toFixed(2)}</div>
        <div>Available balance: ${affiliateData.availableBalance.toFixed(2)}</div>
        <div>Total Referrals: {affiliateData.totalReferrals}</div>
        <div>Subscriptions: {affiliateData.subscriptions}</div>
      </section>

      {affiliateData?.isRegistered && (
        <section
          className="referral-link neon-glow-border"
          style={{ marginTop: "2rem" }}
        >
          <h3>Your Referral Link</h3>
          <input
            type="text"
            readOnly
            value={affiliateData.referralLink || ""}
            style={{
              width: "80%",
              color: "#00FFFF",
              backgroundColor: "#000",
              border: "1px solid #00FFFF",
              borderRadius: "4px",
              padding: "0.5rem",
            }}
            onFocus={(e) => e.target.select()}
          />
          <NeonButton onClick={handleCopyLink}>
            {copySuccess ? "Copied!" : "Copy Link"}
          </NeonButton>
        </section>
      )}

      <section
        className="referral-performance neon-glow-border"
        style={{ marginTop: "2rem" }}
      >
        <h3>Referral Performance</h3>
        <table
          style={{ width: "100%", color: "#00FFFF", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>No</th>
              <th>Name/Email</th>
              <th>Date</th>
              <th>Plan</th>
              <th>Commission ($)</th>
            </tr>
          </thead>
          <tbody>
            {/* ✅ Fix 3: use referredUsers instead of referrals */}
            {affiliateData.referredUsers?.map((refUser, index) => (
              <tr
                key={refUser._id || index}
                style={{ borderBottom: "1px solid #00FFFF" }}
              >
                <td>{index + 1}</td>
                <td>{refUser.email}</td>
                <td>{new Date(refUser.createdAt).toLocaleDateString()}</td>
                <td>{refUser.subscription?.plan || "—"}</td>
                <td>{refUser.commissionEarned?.toFixed(2) || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {affiliateData?.isRegistered && (
        <section
          className="withdrawal-panel neon-glow-border"
          style={{ marginTop: "2rem" }}
        >
          <h3>Withdrawal Panel</h3>
          <div>
            Available balance: ${affiliateData.availableBalance.toFixed(2)}
          </div>
          <div>
            Withdrawable Amount: ${affiliateData.availableBalance.toFixed(2)}
          </div>

          <form onSubmit={handleWithdrawSubmit}>
            <input
              type="number"
              min="1"
              max={affiliateData.availableBalance}
              placeholder="Withdrawal amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              required
            />

            <select
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              required
            >
              <option value="paypal">PayPal</option>
              <option value="webmoney">WebMoney</option>
              {/* ✅ Fix 4: correct Skrill spelling */}
              <option value="skrill">Skrill</option>
              <option value="bankTransfer">Bank Transfer</option>
            </select>

            <input
              type="text"
              placeholder="Account details"
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              required
            />

            <NeonButton type="submit">
              {loading ? "Processing..." : "Submit Withdrawal"}
            </NeonButton>
          </form>

          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.9rem",
              color: "#FF4500",
            }}
          >
            Note: You will receive a confirmation email. Verify to complete
            withdrawal.
          </p>
        </section>
      )}

      <section
        className="rules-conditions neon-glow-border"
        style={{ marginTop: "2rem" }}
      >
        <h3>Rules & Conditions</h3>
        <p>
          NOTE: COMMISSION IS ONLY EARNED WHEN <br />
          ° User signs up through your referral link <br />
          ° AND purchases a paid subscription plan
        </p>
      </section>

      <footer
        style={{ marginTop: "3rem", textAlign: "center", color: "#00FFFF" }}
      >
        FTSA AI-Powered by KELVIN SPECTER (MBURU G) Copyright ©️ 2025
      </footer>
    </div>
  );
};

export default AffiliatesPage;
