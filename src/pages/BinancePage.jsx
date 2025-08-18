// src/pages/BinancePage.jsx
import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl"; // updated import

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

export default function BinancePage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [binanceData, setBinanceData] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    APIControl.fetchBinanceData?.()
      .then((data) => {
        setBinanceData(data);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load Binance data.");
      })
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
        Please login to view Binance information.
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

      {binanceData && (
        <>
          {/* Account Information */}
          <section
            style={{
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 10px ${neonColors.neonBlue}`,
              backgroundColor: "#111",
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>ACCOUNT INFORMATION</h2>
            <p>Email: {binanceData.email}</p>
            <p>Total Balance: ${binanceData.totalBalance.toFixed(2)}</p>
            <p>Available Balance: ${binanceData.availableBalance.toFixed(2)}</p>
            <p>
              Daily PnL:{" "}
              <span
               style={{
                  color:
                    binanceData.dailyPnl >= 0
                      ? neonColors.neonGreen
                      : neonColors.neonRed,
                }}
              >
                ${binanceData.dailyPnl.toFixed(2)}
              </span>
            </p>
            <p>
              Weekly PnL:{" "}
              <span
                style={{
                  color:
                    binanceData.weeklyPnl >= 0
                      ? neonColors.neonGreen
                      : neonColors.neonRed,
                }}
              >
                ${binanceData.weeklyPnl.toFixed(2)}
              </span>
            </p>
          </section>

          {/* Wallet Breakdown */}
          <section
            style={{
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 10px ${neonColors.neonBlue}`,
              backgroundColor: "#111",
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>WALLET BREAKDOWN</h2>
            <ul>
              <li>Spots Wallet: ${binanceData.wallets.spots.toFixed(2)}</li>
              <li>Funding Wallet: ${binanceData.wallets.funding.toFixed(2)}</li>
              <li>Futures Wallet: ${binanceData.wallets.futures.toFixed(2)}</li>
            </ul>
          </section>

          {/* Holdings */}
          <section
            style={{
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 10px ${neonColors.neonBlue}`,
              backgroundColor: "#111",
              overflowX: "auto",
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>HOLDINGS</h2>
            <table
              style={{
                width: "100%",
                color: neonColors.neonBlue,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: `1px solid ${neonColors.neonBlue}`,
                      padding: "0.5rem",
                    }}
                  >
                    Coin
                  </th>
                  <th
                    style={{
                      borderBottom: `1px solid ${neonColors.neonBlue}`,
                      padding: "0.5rem",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      borderBottom: `1px solid ${neonColors.neonBlue}`,
                      padding: "0.5rem",
                    }}
                  >
                    USD Value
                  </th>
                  <th
                    style={{
                      borderBottom: `1px solid ${neonColors.neonBlue}`,
                      padding: "0.5rem",
                    }}
                  >
                    Portfolio %
                  </th>
                </tr>
              </thead>
              <tbody>
                {binanceData.holdings.map(
                  ({ coin, amount, usdValue, portfolioPct }) => (
                    <tr key={coin}>
                      <td style={{ padding: "0.5rem" }}>{coin}</td>
                      <td style={{ padding: "0.5rem" }}>{amount}</td>
                      <td style={{ padding: "0.5rem" }}>${usdValue.toFixed(2)}</td>
                      <td style={{ padding: "0.5rem" }}>{portfolioPct.toFixed(2)}%</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </section>

          {/* Market Watchlist */}
          <section
            style={{
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 10px ${neonColors.neonBlue}`,
              backgroundColor: "#111",
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>MARKET WATCHLIST</h2>
            <ul>
              {binanceData.marketWatchlist.map(({ symbol, price, changePct }) => (
                <li key={symbol} style={{ marginBottom: "0.5rem" }}>
                  <strong>{symbol}</strong> | ${price.toFixed(2)} |{" "}
                  <span
                    style={{
                      color:
                        changePct >= 0 ? neonColors.neonGreen : neonColors.neonRed,
                    }}
                  >
                    {changePct >= 0 ? "+" : ""}
                    {changePct.toFixed(2)}%
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Connection Status */}
          <section
            style={{
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 10px ${neonColors.neonBlue}`,
              backgroundColor: "#111",
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>CONNECTION STATUS</h2>
            <p>Logins/Logout/Connect Entries:</p>
            <ul>
              {binanceData.connectionHistory.map((entry, i) => (
                <li key={i}>{entry}</li>
              ))}
            </ul>
            <NeonButton onClick={() => alert("Connect Binance account - feature to implement")}>
              Binance Account Connected
            </NeonButton>
            <NeonButton
              style={{ marginLeft: "1rem" }}
              onClick={() => alert("Refresh Connection - feature to implement")}
            >
              Refresh Connection
            </NeonButton>
          </section>

          {/* Security Information */}
          <section
            style={{
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 10px ${neonColors.neonBlue}`,
              backgroundColor: "#111",
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>SECURITY INFORMATION</h2>
            <p>Last login: {binanceData.lastLogin}</p>
            <p>2FA status: {binanceData.twoFAEnabled ? "ENABLED" : "DISABLED"}</p>
            <p>Binance UID: {binanceData.binanceUID}</p>
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

