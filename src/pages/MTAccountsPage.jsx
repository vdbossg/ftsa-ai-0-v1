import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "/src/brain/APIControl.js";
import "../styles/MTAccountsPage.css";

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonRed: "#FF0000",
};

export default function MTAccountsPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    broker: "",
    login: "",
    password: "",
    server: "",
    platform: "MT4",
    accountType: "demo",
    currency: "", // Added currency
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAccount();
  }, [isAuthenticated]);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const accountsData = await APIControl.fetchMTAccounts();
if (accountsData.success && accountsData.data.length > 0) {
  // Pick the first account (or handle multiple accounts as needed)
  setFormData(accountsData.data[0]);
} else {
  setFormData({
    broker: "",
    login: "",
    password: "",
    server: "",
    platform: "MT4",
    accountType: "demo",
    currency: "",
  });
}

      if (data) setFormData(data);
      setStatus({ type: "", text: "" });
    } catch {
      setStatus({ type: "error", text: "Failed to load account." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConnect = async () => {
    if (!formData.login || !formData.password || !formData.server) {
      setStatus({ type: "error", text: "Please fill all fields." });
      return;
    }
    try {
      setLoading(true);
      const res = await APIControl.connectMTAccount(
        formData.login,
        formData.password,
        formData.server
      );
      if (res.success) {
        // Update formData with returned currency if available
        setFormData((prev) => ({
          ...prev,
          currency: res.currency || prev.currency,
        }));
        setStatus({ type: "success", text: "Account connected successfully!" });
      } else {
        setStatus({ type: "error", text: res.message || "Failed to connect account." });
      }
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Unexpected error." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await APIControl.deleteMTAccount(); // delete single account
      if (res.success) {
        setStatus({ type: "success", text: "Account deleted successfully!" });
        setFormData({
          broker: "",
          login: "",
          password: "",
          server: "",
          platform: "MT4",
          accountType: "demo",
          currency: "",
        });
      } else {
        setStatus({ type: "error", text: res.message || "Failed to delete account." });
      }
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Unexpected error." });
    } finally {
      setLoading(false);
    }
  };

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
        Please login to manage your MT account.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        height: "100%",
        padding: "2rem",
        maxWidth: 500,
        margin: "0 auto",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Connect Your MT4/MT5 Account
      </h2>

      {loading && (
        <div style={{ textAlign: "center" }}>
          <LoadingSpinner size={50} color={neonColors.neonBlue} />
        </div>
      )}

      {status.text && (
        <StatusBadge
          status={status.type}
          style={{ marginBottom: "1rem", display: "block", textAlign: "center" }}
        >
          {status.text}
        </StatusBadge>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleConnect();
        }}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <label>
          Broker
          <input
            name="broker"
            value={formData.broker}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
        </label>

        <label>
          Login
          <input
            name="login"
            value={formData.login}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
        </label>

        <label>
          Server
          <input
            name="server"
            value={formData.server}
            onChange={handleInputChange}
            style={inputStyle}
            required
          />
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

        {formData.currency && (
          <p style={{ textAlign: "center", color: neonColors.neonGreen }}>
            Currency: {formData.currency}
          </p>
        )}

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <NeonButton type="submit">Connect</NeonButton>
          <NeonButton
            type="button"
            style={{ backgroundColor: neonColors.neonRed }}
            onClick={handleDelete}
          >
            Delete
          </NeonButton>
        </div>
      </form>

      <footer
        style={{
          marginTop: "2rem",
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
