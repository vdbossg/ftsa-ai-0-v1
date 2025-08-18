// src/pages/AffiliatesPage.jsx
import React, { useContext, useState, useEffect } from "react";
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
      // e.g., useNavigate() from react-router-dom or your routing method
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  // Fetch affiliate data from brain/APIControl.js (replace with your actual fetching logic)
  useEffect(() => {
    async function fetchAffiliateData() {
      try {
        setLoading(true);
        // Replace this with real brain/APIControl call
        const data = await fakeFetchAffiliateData();
        setAffiliateData(data);
      } catch (err) {
        console.error("Failed to fetch affiliate data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAffiliateData();
  }, []);

  const fakeFetchAffiliateData = async () => {
    // simulate backend API response
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          totalCommission: 2450.0,
          availableBalance: 850.0,
          totalReferrals: 127,
          subscriptions: 89,
          referralLink: `https://ftsa.ai/ref/${user?.username || "guest"}`,
          referrals: [
            { no: 1, name: "kelvinmburug@gmail.com", date: "2025-01-15", plan: "plus", commission: 2.0 },
            { no: 2, name: "marystacy0710@gmail.com", date: "2025-01-15", plan: "plus", commission: 2.0 },
            { no: 3, name: "Trizahnjoroge0759@gmail.com", date: "2025-01-15", plan: "plus", commission: 2.0 },
          ],
        });
      }, 1000)
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateData.referralLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    // TODO: integrate withdrawal submission logic to backend here
    alert(`Withdrawal submitted: ${withdrawAmount} via ${withdrawMethod}`);
  };

  if (loading) return <LoadingSpinner />;

  if (!affiliateData)
    return <div className="error-message neon-red">Failed to load affiliate data.</div>;

  return (
    <div className="affiliates-page" style={{ backgroundColor: "#000000", color: "#00FFFF", fontFamily: "Orbitron, sans-serif", minHeight: "100vh", padding: "2rem" }}>
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

      {/* Affiliate Registration */}
      <section className="affiliate-registration neon-glow-border">
        <h3>Affiliate Registration</h3>
        <form>
          <input type="text" placeholder="Full Name" required />
          <input type="text" placeholder="Username" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Confirm Password" required />
          <input type="text" placeholder="Country" required />
          <input type="tel" placeholder="Phone Number (+123)(7********)" required />
          <label>
            <input type="checkbox" required /> I agree to the Affiliates Terms & Conditions
          </label>
          <NeonButton type="submit">Register</NeonButton>
        </form>
      </section>

      {/* Affiliates Dashboard */}
      <section className="affiliates-dashboard neon-glow-border" style={{ marginTop: "2rem" }}>
        <h3>Your Affiliate Dashboard</h3>
        <div>Total commission: ${affiliateData.totalCommission.toFixed(2)}</div>
        <div>Available balance: ${affiliateData.availableBalance.toFixed(2)}</div>
        <div>Total Referrals: {affiliateData.totalReferrals}</div>
        <div>Subscriptions: {affiliateData.subscriptions}</div>
      </section>

      {/* Referral Link */}
      <section className="referral-link neon-glow-border" style={{ marginTop: "2rem" }}>
        <h3>Your Referral Link</h3>
        <input
          type="text"
          readOnly
          value={affiliateData.referralLink}
          style={{ width: "80%", color: "#00FFFF", backgroundColor: "#000", border: "1px solid #00FFFF", borderRadius: "4px", padding: "0.5rem" }}
          onFocus={(e) => e.target.select()}
        />
        <NeonButton onClick={handleCopyLink}>
          {copySuccess ? "Copied!" : "Copy Link"}
        </NeonButton>
      </section>

      {/* Referral Performance Table */}
      <section className="referral-performance neon-glow-border" style={{ marginTop: "2rem" }}>
        <h3>Referral Performance</h3>
        <table style={{ width: "100%", color: "#00FFFF", borderCollapse: "collapse" }}>
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
            {affiliateData.referrals.map(({ no, name, date, plan, commission }) => (
              <tr key={no} style={{ borderBottom: "1px solid #00FFFF" }}>
                <td>{no}</td>
                <td>{name}</td>
                <td>{date}</td>
                <td>{plan}</td>
                <td>{commission.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Withdrawal Panel */}
      <section className="withdrawal-panel neon-glow-border" style={{ marginTop: "2rem" }}>
        <h3>Withdrawal Panel</h3>
        <div>Available balance: ${affiliateData.availableBalance.toFixed(2)}</div>
        <div>Withdrawable Amount: ${affiliateData.availableBalance.toFixed(2)}</div>
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
          <select value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)} required>
            <option value="paypal">PayPal</option>
            <option value="webmoney">WebMoney</option>
            <option value="skill">Skill</option>
            <option value="bankTransfer">Bank Transfer</option>
          </select>
          <input
            type="text"
            placeholder="Account details"
            value={accountDetails}
            onChange={(e) => setAccountDetails(e.target.value)}
            required
          />
          <NeonButton type="submit">Submit Withdrawal</NeonButton>
        </form>
        <p>
          User will first verify in email "Confirm email it's your and click verify"
        </p>
      </section>

      {/* Rules & Conditions */}
      <section className="rules-conditions neon-glow-border" style={{ marginTop: "2rem" }}>
        <h3>Rules & Conditions</h3>
        <p>
          NOTE: COMMISSION IS ONLY EARNED WHEN <br />
          ° User signs up through your referral link <br />
          ° AND purchases a paid subscription plan
        </p>
      </section>

      <footer style={{ marginTop: "3rem", textAlign: "center", color: "#00FFFF" }}>
        FTSA AI-Powered by KELVIN SPECTER (MBURU G) Copyright ©️ 2025
      </footer>
    </div>
  );
};

export default AffiliatesPage;
