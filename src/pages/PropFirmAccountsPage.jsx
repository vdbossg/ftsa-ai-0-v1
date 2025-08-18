// src/pages/PropFirmAccountsPage.jsx
import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from '../brain/APIControl';
import "../styles/PropFirmAccountsPage.css";

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

export default function PropFirmAccountsPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("MT4");
  const [formData, setFormData] = useState({
    brokerName: "",
    accountID: "",
    password: "",
    serverName: "",
    propFirmName: "",
    accountType: "demo",
    platform: "MT4",
    currency: "USD",
  });

  // Fetch Prop Firm accounts
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    APIControl.fetchPropFirmAccountsData()
      .then((data) => {
        setAccounts(data);
        setError(null);
      })
      .catch(() => setError("Failed to load Prop Firm accounts."))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div
        style={{
          color: neonColors.neonRed,
          fontFamily: "'Orbitron', sans-serif",
          textAlign: "center",
          marginTop: "5rem",
        }}
      >
        Please login to view Prop Firm accounts.
      </div>
    );
  }

  const handlePlatformClick = (platform) => {
    setSelectedPlatform(platform);
    setFormData((prev) => ({ ...prev, platform }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---- FIXED: Fully connected functions ----
  const handleSaveAccount = async () => {
    try {
      setLoading(true);
      const updatedAccounts = await APIControl.savePropFirmAccount(formData);
      setAccounts(updatedAccounts);
      setError(null);
    } catch (err) {
      setError("Failed to save Prop Firm account.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountID) => {
    try {
      setLoading(true);
      const updatedAccounts = await APIControl.deletePropFirmAccount(accountID);
      setAccounts(updatedAccounts);
      setError(null);
    } catch (err) {
      setError("Failed to delete Prop Firm account.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async (accountID) => {
    try {
      setLoading(true);
      await APIControl.connectPropFirmAccount(accountID);
      setError(null);
      alert(`Prop Firm account ${accountID} connected successfully`);
    } catch (err) {
      setError("Failed to connect Prop Firm account.");
    } finally {
      setLoading(false);
    }
  };
  // ----------------------------------------

  const filteredAccounts = Array.isArray(accounts)
  ? accounts.filter((acc) => acc.platform === selectedPlatform)
  : [];

  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        height: "100%",
        padding: "1rem",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <header
        style={{
          fontSize: "1.8rem",
          fontWeight: "bold",
          borderBottom: `2px solid ${neonColors.neonBlue}`,
          paddingBottom: "0.5rem",
          textAlign: "center",
        }}
      >
        FTSA AI - Prop Firm Accounts
      </header>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        {["MT4", "MT5"].map((platform) => (
          <NeonButton
            key={platform}
            style={{
              border:
                selectedPlatform === platform
                  ? `2px solid ${neonColors.neonGreen}`
                  : `2px solid ${neonColors.neonBlue}`,
              backgroundColor:
                selectedPlatform === platform ? "#002200" : "transparent",
              minWidth: 100,
            }}
            onClick={() => handlePlatformClick(platform)}
          >
            {platform}
          </NeonButton>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center" }}>
          <LoadingSpinner size={50} color={neonColors.neonBlue} />
        </div>
      )}

      {error && (
        <StatusBadge
          status="error"
          className="glow-red"
          style={{ margin: "1rem auto", maxWidth: 400 }}
        >
          {error}
        </StatusBadge>
      )}

      {filteredAccounts.length > 0 ? (
        filteredAccounts.map((acc) => (
          <section
            key={acc.accountID}
            style={{
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 10px ${neonColors.neonBlue}`,
              backgroundColor: "#111",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <h3>
              {acc.brokerName} - {acc.accountID}{" "}
              <StatusBadge
                status={acc.isActive ? "success" : "error"}
                style={{ marginLeft: "1rem" }}
              >
                {acc.isActive ? "ACTIVE" : "INACTIVE"}
              </StatusBadge>
            </h3>
            <p>Prop Firm: {acc.propFirmName}</p>
            <p>Account Type: {acc.accountType}</p>
            <p>Currency: {acc.currency}</p>
            <p>Balance: ${acc.balance.toFixed(2)}</p>
            <p>Equity: ${acc.equity.toFixed(2)}</p>
            <p>Free Margin: ${acc.freeMargin.toFixed(2)}</p>
            <p>Margin Level %: {acc.marginLevelPct.toFixed(2)}%</p>
            <p>Open Trades: {acc.openTrades}</p>
            <p>Pending Orders: {acc.pendingOrders}</p>
            <p>Max Daily Loss Limit: ${acc.maxDailyLossLimit.toFixed(2)}</p>
            <p>Max Overall Loss Limit: ${acc.maxOverallLossLimit.toFixed(2)}</p>
            <p>
              Profit Target: {acc.profitTargetAmount} USD / {acc.profitTargetPercent}%
            </p>
            <p>Days Remaining: {acc.daysRemaining}</p>

            <div style={{ marginTop: "0.5rem" }}>
              <NeonButton onClick={() => handleConnectAccount(acc.accountID)}>
                Connect Account
              </NeonButton>
              <NeonButton
                style={{ marginLeft: "1rem" }}
                onClick={() => handleDeleteAccount(acc.accountID)}
              >
                Delete Account
              </NeonButton>
            </div>
          </section>
        ))
      ) : (
        <p style={{ textAlign: "center", color: neonColors.neonOrange }}>
          No {selectedPlatform} Prop Firm accounts found.
        </p>
      )}

      <section
        style={{
          border: `2px solid ${neonColors.neonBlue}`,
          borderRadius: "12px",
          padding: "1rem",
          boxShadow: `0 0 10px ${neonColors.neonBlue}`,
          backgroundColor: "#111",
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        <h2>Add / Edit Prop Firm Account</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveAccount();
          }}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <label>
            Broker Name
            <input
              name="brokerName"
              value={formData.brokerName}
              onChange={handleInputChange}
              style={inputStyle}
              required
            />
          </label>

          <label>
            Account ID/Login
            <input
              name="accountID"
              value={formData.accountID}
              onChange={handleInputChange}
              style={inputStyle}
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              style={inputStyle}
              required
            />
          </label>

          <label>
            Server Name
            <input
              name="serverName"
              value={formData.serverName}
              onChange={handleInputChange}
              style={inputStyle}
              required
            />
          </label>

          <label>
            Prop Firm Name
            <input
              name="propFirmName"
              value={formData.propFirmName}
              onChange={handleInputChange}
              style={inputStyle}
              required
            />
          </label>

          <label>
            Account Type
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option value="demo">Demo</option>
              <option value="live">Live</option>
            </select>
          </label>

          <label>
            Platform
            <select
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option value="MT4">MT4</option>
              <option value="MT5">MT5</option>
            </select>
          </label>

          <label>
            Account Currency
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              style={inputStyle}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="KES">KES</option>
            </select>
          </label>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <NeonButton type="submit">Save Prop Account</NeonButton>
            <NeonButton
              type="button"
              onClick={() => handleDeleteAccount(formData.accountID)}
              style={{ backgroundColor: neonColors.neonRed }}
            >
              Delete Account
            </NeonButton>
            <NeonButton
              type="button"
              onClick={() => handleConnectAccount(formData.accountID)}
            >
              Connect Account
            </NeonButton>
          </div>
        </form>
      </section>

      <footer
        style={{
          marginTop: "auto",
          paddingTop: "1rem",
          borderTop: `1px solid ${neonColors.neonBlue}`,
          fontSize: "0.9rem",
          color: neonColors.neonBlue,
          textAlign: "center",
        }}
      >
        FTSA AI - Powered by KELVIN SPECTER (MBURU G) © 2025
      </footer>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.5rem",
  borderRadius: "6px",
  border: "2px solid #00FFFF",
  backgroundColor: "#111",
  color: "#00FFFF",
  fontFamily: "'Orbitron', sans-serif",
  outline: "none",
};
