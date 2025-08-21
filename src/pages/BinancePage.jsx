// src/pages/BinancePage.jsx
import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import APIControl from "../brain/APIControl"; // must expose loginUser & fetchBinanceData

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

export default function BinancePage() {
  const [authToken, setAuthToken] = useState(null);
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [binanceData, setBinanceData] = useState(null);

  // -----------------------------
  // Login Handler (calls backend)
  // -----------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await APIControl.loginUser(credentials.username, credentials.password);
      if (response?.token) {
        setAuthToken(response.token);
        setError(null);
      } else {
        setError(response?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setError("Unable to login. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Fetch Binance Data (after login)
  // -----------------------------
  useEffect(() => {
    if (!authToken) return;

    let mounted = true;
    setLoading(true);

    APIControl.fetchBinanceData(authToken)
      .then((data) => {
        if (mounted) {
          setBinanceData(data || {});
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError("Failed to load Binance data.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [authToken]);

  // -----------------------------
  // Login Screen
  // -----------------------------
  if (!authToken) {
    return (
      <div
        style={{
          backgroundColor: neonColors.background,
          color: neonColors.neonBlue,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            border: `2px solid ${neonColors.neonBlue}`,
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: `0 0 15px ${neonColors.neonBlue}`,
            backgroundColor: "#111",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            width: "300px",
          }}
        >
          <h2 style={{ textAlign: "center" }}>Binance Login</h2>
          {error && <StatusBadge status="error">{error}</StatusBadge>}
          <input
            type="text"
            placeholder="Username"
            value={credentials.username}
            onChange={(e) =>
              setCredentials({ ...credentials, username: e.target.value })
            }
            style={inputStyle()}
          />
          <input
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={(e) =>
              setCredentials({ ...credentials, password: e.target.value })
            }
            style={inputStyle()}
          />
          <NeonButton type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </NeonButton>
        </form>
      </div>
    );
  }

  // -----------------------------
  // Authenticated Binance Page
  // -----------------------------
  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        minHeight: "100vh",
        padding: "1rem",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
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
        FTSA AI - Binance Account
      </header>

      {loading && (
        <div style={{ textAlign: "center" }}>
          <LoadingSpinner size={50} color={neonColors.neonBlue} />
        </div>
      )}

      {error && (
        <StatusBadge status="error" className="glow-red">
          {error}
        </StatusBadge>
      )}

      {binanceData && !loading && (
        <>
          {/* ACCOUNT INFORMATION */}
          <section style={sectionStyle()}>
            <h2>ACCOUNT INFORMATION</h2>
            <p>Email: {binanceData.email || "N/A"}</p>
            <p>Total Balance: ${Number(binanceData.totalBalance || 0).toFixed(2)}</p>
            <p>
              Available Balance: $
              {Number(binanceData.availableBalance || 0).toFixed(2)}
            </p>
            <p>
              Daily PnL:{" "}
              <span
                style={{
                  color:
                    (binanceData.dailyPnl || 0) >= 0
                      ? neonColors.neonGreen
                      : neonColors.neonRed,
                }}
              >
                ${Number(binanceData.dailyPnl || 0).toFixed(2)}
              </span>
            </p>
            <p>
              Weekly PnL:{" "}
              <span
                style={{
                  color:
                    (binanceData.weeklyPnl || 0) >= 0
                      ? neonColors.neonGreen
                      : neonColors.neonRed,
                }}
              >
                ${Number(binanceData.weeklyPnl || 0).toFixed(2)}
              </span>
            </p>
          </section>

          {/* WALLET BREAKDOWN */}
          <section style={sectionStyle()}>
            <h2>WALLET BREAKDOWN</h2>
            <ul>
              <li>
                Spots Wallet: ${Number(binanceData.wallets?.spots || 0).toFixed(2)}
              </li>
              <li>
                Funding Wallet: $
                {Number(binanceData.wallets?.funding || 0).toFixed(2)}
              </li>
              <li>
                Futures Wallet: $
                {Number(binanceData.wallets?.futures || 0).toFixed(2)}
              </li>
            </ul>
          </section>

          {/* HOLDINGS */}
          <section style={{ ...sectionStyle(), overflowX: "auto" }}>
            <h2>HOLDINGS</h2>
            <table style={tableStyle()}>
              <thead>
                <tr>
                  <th style={thStyle()}>Coin</th>
                  <th style={thStyle()}>Amount</th>
                  <th style={thStyle()}>USD Value</th>
                  <th style={thStyle()}>Portfolio %</th>
                </tr>
              </thead>
              <tbody>
                {(binanceData.holdings || []).map(
                  ({ coin, amount, usdValue, portfolioPct }) => (
                    <tr key={coin}>
                      <td style={tdStyle()}>{coin}</td>
                      <td style={tdStyle()}>{amount || 0}</td>
                      <td style={tdStyle()}>
                        ${Number(usdValue || 0).toFixed(2)}
                      </td>
                      <td style={tdStyle()}>
                        {Number(portfolioPct || 0).toFixed(2)}%
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </section>

          {/* MARKET WATCHLIST */}
          <section style={sectionStyle()}>
            <h2>MARKET WATCHLIST</h2>
            <ul>
              {(binanceData.marketWatchlist || []).map(
                ({ symbol, price, changePct }) => (
                  <li key={symbol} style={{ marginBottom: "0.5rem" }}>
                    <strong>{symbol}</strong> | $
                    {Number(price || 0).toFixed(2)} |{" "}
                    <span
                      style={{
                        color:
                          (changePct || 0) >= 0
                            ? neonColors.neonGreen
                            : neonColors.neonRed,
                      }}
                    >
                      {(changePct || 0) >= 0 ? "+" : ""}
                      {Number(changePct || 0).toFixed(2)}%
                    </span>
                  </li>
                )
              )}
            </ul>
          </section>

          {/* CONNECTION STATUS */}
          <section style={sectionStyle()}>
            <h2>CONNECTION STATUS</h2>
            <ul>
              {(binanceData.connectionHistory || []).map((entry, i) => (
                <li key={i}>{entry}</li>
              ))}
            </ul>
            <NeonButton onClick={() => APIControl.connectBinance(authToken)}>
              Connect Binance Account
            </NeonButton>
            <NeonButton
              style={{ marginLeft: "1rem" }}
              onClick={() => APIControl.refreshBinance(authToken)}
            >
              Refresh Connection
            </NeonButton>
          </section>

          {/* SECURITY INFO */}
          <section style={sectionStyle()}>
            <h2>SECURITY INFORMATION</h2>
            <p>Last login: {binanceData.lastLogin || "N/A"}</p>
            <p>
              2FA status: {binanceData.twoFAEnabled ? "ENABLED" : "DISABLED"}
            </p>
            <p>Binance UID: {binanceData.binanceUID || "N/A"}</p>
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
            FTSA AI - Binance View powered by KELVIN SPECTER (MBURU G) © 2025
          </footer>
        </>
      )}
    </div>
  );
}

// -----------------------------
// Styles
// -----------------------------
function sectionStyle() {
  return {
    border: `2px solid ${neonColors.neonBlue}`,
    borderRadius: "12px",
    padding: "1rem",
    boxShadow: `0 0 10px ${neonColors.neonBlue}`,
    backgroundColor: "#111",
  };
}

function inputStyle() {
  return {
    padding: "0.5rem",
    borderRadius: "8px",
    border: `1px solid ${neonColors.neonBlue}`,
    backgroundColor: "#000",
    color: neonColors.neonBlue,
  };
}

function tableStyle() {
  return {
    width: "100%",
    color: neonColors.neonBlue,
    borderCollapse: "collapse",
  };
}

function thStyle() {
  return {
    borderBottom: `1px solid ${neonColors.neonBlue}`,
    padding: "0.5rem",
  };
}

function tdStyle() {
  return { padding: "0.5rem" };
}
