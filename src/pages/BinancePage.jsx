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
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [binanceData, setBinanceData] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");


  // -----------------------------
  // Load token from localStorage
  // -----------------------------
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) setAuthToken(token);
  }, []);

  // -----------------------------
  // Login Handler
  // -----------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await APIControl.loginUser(credentials.email, credentials.password);
if (response.success && response.token) {
  setAuthToken(response.token);
  localStorage.setItem("authToken", response.token);
  setError(null);
} else {
  setError(response.error || "Login failed. Please try again.");
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

  const fetchData = async () => {
    console.log("📡 Fetching Binance data...");
    setLoading(true);

    try {
      const response = await APIControl.fetchBinanceData();
console.log("✅ Binance API response:", response);

if (!mounted) return;

if (response?.success) {
  // Normalize backend shape: ensure we always work with response.data.account
  const account = response.data?.account || response.data || {};
  const publicData = response.data?.public || [];

  if (Object.keys(account).length === 0) {
    setBinanceData(null);
    setError("No Binance account connected yet.");
  } else {
    setBinanceData({ ...account, publicPrices: publicData });
    setError(null);
  }
} else {
  setError(response?.error || "Failed to load Binance data.");
  setBinanceData(null);
}

    } catch (err) {
      console.error("❌ Fetch error:", err);
      if (mounted) setError("Error loading Binance data.");
    } finally {
      if (mounted) {
        console.log("⏹️ Loading complete");
        setLoading(false);
      }
    }
  };

  fetchData();

  return () => {
    mounted = false;
  };
}, [authToken]);

  // -----------------------------
  // Logout Handler
  // -----------------------------
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    setBinanceData(null);
  };

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
          <h2 style={{ textAlign: "center" }}>Login</h2>
          {error && <StatusBadge status="error">{error}</StatusBadge>}
          <input
  type="email"
  placeholder="Email"
  value={credentials.email}
  onChange={(e) =>
    setCredentials({ ...credentials, email: e.target.value })
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
        FTSA AI - Binance Dashboard
        <NeonButton
          onClick={handleLogout}
          style={{ marginLeft: "1rem", fontSize: "0.8rem" }}
        >
          Logout
        </NeonButton>
      </header>

      {loading && (
        <div style={{ textAlign: "center" }}>
          <LoadingSpinner size={50} color={neonColors.neonBlue} />
        </div>
      )}

      {error && <StatusBadge status="error">{error}</StatusBadge>}

      {!loading && !binanceData && !error && (
  <StatusBadge status="info">No Binance data available yet.</StatusBadge>
)}
      {binanceData && !loading && (
        <>
        {/* CONNECT BINANCE ACCOUNT */}
<section style={sectionStyle()}>
  <h2>Connect Binance Account</h2>
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      try {
        setLoading(true);
        setError(null);
        const res = await APIControl.connectBinance(apiKey, apiSecret);
         if (res.success) {
  alert("✅ Binance account connected!");
  // 🔄 Refresh data immediately
  const refreshed = await APIControl.fetchBinanceData();
if (refreshed?.success && refreshed.data) {
  const account = refreshed.data.account || {
    email: "N/A",
    totalBalance: 0,
    availableBalance: 0,
    dailyPnl: 0,
    weeklyPnl: 0,
    holdings: [],
    wallets: { spots: 0, funding: 0, futures: 0 },
  };
  const publicData = refreshed.data.public || { prices: {}, holdings: [] };
  setBinanceData({ ...account, publicPrices: publicData });
  setError(null);
} else {
  setError(refreshed?.error || "Failed to load Binance data.");
  setBinanceData(null);
}

} else {
  setError(res.error || "Failed to connect Binance.");
}

      } catch (err) {
        setError(err.message || "Connection failed.");
      } finally {
        setLoading(false);
      }
    }}
    style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
  >
    <input
      type="text"
      placeholder="Binance API Key"
      value={apiKey}
      onChange={(e) => setApiKey(e.target.value)}
      style={inputStyle()}
    />
    <input
      type="password"
      placeholder="Binance Secret Key"
      value={apiSecret}
      onChange={(e) => setApiSecret(e.target.value)}
      style={inputStyle()}
    />
    <NeonButton type="submit" disabled={loading}>
      {loading ? "Connecting..." : "Connect Binance"}
    </NeonButton>
  </form>
</section>

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
              <li>Spots Wallet: ${Number(binanceData.wallets?.spots || 0).toFixed(2)}</li>
              <li>Funding Wallet: ${Number(binanceData.wallets?.funding || 0).toFixed(2)}</li>
              <li>Futures Wallet: ${Number(binanceData.wallets?.futures || 0).toFixed(2)}</li>
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
                      <td style={tdStyle()}>${Number(usdValue || 0).toFixed(2)}</td>
                      <td style={tdStyle()}>{Number(portfolioPct || 0).toFixed(2)}%</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </section>
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
