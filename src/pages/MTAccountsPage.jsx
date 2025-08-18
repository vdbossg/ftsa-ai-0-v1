// src/pages/MTAccountsPage.jsx
import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from '/src/brain/APIControl.js';
import "../styles/MTAccountsPage.css"; // optional for additional styles

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

export default function MTAccountsPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountType, setSelectedAccountType] = useState("MT4");
  const [formData, setFormData] = useState({
    brokerName: "",
    accountID: "",
    password: "",
    serverName: "",
    accountType: "demo",
    currency: "USD",
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    APIControl.fetchMTAccountsData()
      .then((data) => {
        setAccounts(data);
        setError(null);
      })
      .catch(() => setError("Failed to load MT accounts."))
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
        Please login to view MT accounts.
      </div>
    );
  }

  const handleAccountTypeClick = (type) => {
    setSelectedAccountType(type);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAccount = async () => {
    try {
      setLoading(true);
      const res = await APIControl.saveMTAccount(formData); // call backend
      if (res.success) {
        const data = await APIControl.fetchMTAccountsData();
        setAccounts(data);
        setError(null);
      } else {
        setError(res.message || "Failed to save account.");
      }
    } catch (err) {
      setError(err.message || "Unexpected error saving account.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountID) => {
    try {
      setLoading(true);
      const res = await APIControl.deleteMTAccount(accountID);
      if (res.success) {
        const data = await APIControl.fetchMTAccountsData();
        setAccounts(data);
        setError(null);
      } else {
        setError(res.message || "Failed to delete account.");
      }
    } catch (err) {
      setError(err.message || "Unexpected error deleting account.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async (account) => {
    try {
      setLoading(true);
      const res = await APIControl.connectMTAccount(
        account.accountID,
        account.password,
        account.serverName
      );
      if (res.success) {
        alert(`Account ${account.accountID} connected successfully!`);
        const data = await APIControl.fetchMTAccountsData();
        setAccounts(data);
        setError(null);
      } else {
        setError(res.message || "Failed to connect account.");
      }
    } catch (err) {
      setError(err.message || "Unexpected error connecting account.");
    } finally {
      setLoading(false);
    }
  };

  // Filter accounts by selected type safely
  const filteredAccounts = Array.isArray(accounts) 
    ? accounts.filter(acc => acc.platform === selectedAccountType) 
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
        FTSA AI - MT Accounts
      </header>

      {/* Account Type Buttons */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        {["MT4", "MT5"].map((type) => (
          <NeonButton
            key={type}
            style={{
              border: selectedAccountType === type ? `2px solid ${neonColors.neonGreen}` : `2px solid ${neonColors.neonBlue}`,
              backgroundColor: selectedAccountType === type ? "#002200" : "transparent",
              minWidth: 100,
            }}
            onClick={() => handleAccountTypeClick(type)}
          >
            {type}
          </NeonButton>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center" }}>
          <LoadingSpinner size={50} color={neonColors.neonBlue} />
        </div>
      )}

      {error && (
        <StatusBadge status="error" className="glow-red" style={{ margin: "1rem auto", maxWidth: 400 }}>
          {error}
        </StatusBadge>
      )}

      {/* List MT Accounts */}
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
            <p>Account Type: {acc.accountType}</p>
            <p>Currency: {acc.currency}</p>
            <p>Balance: ${acc.balance.toFixed(2)}</p>
            <p>Equity: ${acc.equity.toFixed(2)}</p>
            <p>Free Margin: ${acc.freeMargin.toFixed(2)}</p>
            <p>Margin Level %: {acc.marginLevelPct.toFixed(2)}%</p>
            <p>Open Trades: {acc.openTrades}</p>
            <p>Pending Orders: {acc.pendingOrders}</p>

            <div style={{ marginTop: "0.5rem" }}>
              <NeonButton onClick={() => handleConnectAccount(acc)}>
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
          No {selectedAccountType} accounts found.
        </p>
      )}

      {/* Account Form */}
      <section
        style={{
          border: `2px solid ${neonColors.neonBlue}`,
          borderRadius: "12px",
          padding: "1rem",
          boxShadow: `0 0 10px ${neonColors.neonBlue}`,
          backgroundColor: "#111",
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        <h2>Add / Edit MT Account</h2>
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
            <NeonButton type="submit">Save Account</NeonButton>
            <NeonButton
              type="button"
              onClick={() => handleDeleteAccount(formData.accountID)}
              style={{ backgroundColor: neonColors.neonRed }}
            >
              Delete Account
            </NeonButton>
            <NeonButton type="button" onClick={() => handleConnectAccount(formData)}>
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
